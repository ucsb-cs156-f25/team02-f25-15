// src/tests/components/UCSBOrganization/UCSBOrganizationTable.test.jsx
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

// --- mock react-router navigate ---
const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const actual = await vi.importActual("react-router");
  return { ...actual, useNavigate: () => mockedNavigate };
});

// --- mock react-toastify (toast is a plain function here) ---
vi.mock("react-toastify", () => ({ toast: vi.fn() }));
import { toast } from "react-toastify";

// --- capture useBackendMutation wiring so we can assert it and invoke onSuccess ---
let lastMutationArgs = null;
const mutateSpy = vi.fn();

vi.mock("main/utils/useBackend", () => {
  return {
    useBackendMutation: (fn, opts, deps) => {
      lastMutationArgs = { fn, opts, deps };
      return { mutate: mutateSpy };
    },
  };
});

// After mocks: import SUT and the real utils we compare by reference
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/UCSBOrganizationUtils";

describe("UCSBOrganizationTable tests", () => {
  const queryClient = new QueryClient();

  const renderTable = (orgs, user) =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationTable organizations={orgs} currentUser={user} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  beforeEach(() => {
    mutateSpy.mockClear();
    lastMutationArgs = null;
    mockedNavigate.mockClear();
    vi.clearAllMocks(); // clears toast too
  });

  test("renders correct headers for ordinary user (no admin buttons)", () => {
    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.userOnly,
    );

    // locks the table-level testid string used by ButtonColumn calls
    expect(screen.getByTestId("UCSBOrganizationTable")).toBeInTheDocument();

    ["Code", "Short Name", "Full Name", "Inactive?"].forEach((h) =>
      expect(screen.getByText(h)).toBeInTheDocument(),
    );
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
  });

  test("renders Edit/Delete buttons for admin user with correct Bootstrap variants", async () => {
    const orgs = ucsbOrganizationFixtures.threeOrganizations;

    renderTable(orgs, currentUserFixtures.adminUser);

    // one Edit and one Delete per row
    const editButtons = await screen.findAllByTestId(
      /UCSBOrganizationTable-cell-row-\d+-col-Edit-button/,
    );
    const deleteButtons = await screen.findAllByTestId(
      /UCSBOrganizationTable-cell-row-\d+-col-Delete-button/,
    );
    expect(editButtons).toHaveLength(orgs.length);
    expect(deleteButtons).toHaveLength(orgs.length);

    // assert variant mapping: "primary" -> btn-primary, "danger" -> btn-danger
    // this kills mutants that change the "primary"/"danger" arguments
    editButtons.forEach((btn) => expect(btn.className).toMatch(/btn-primary/));
    deleteButtons.forEach((btn) => expect(btn.className).toMatch(/btn-danger/));
  });

  test("Edit button navigates to /ucsborganization/edit/{orgCode}", async () => {
    const firstOrgCode = ucsbOrganizationFixtures.threeOrganizations[0].orgCode;

    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.adminUser,
    );

    const editButton = await screen.findByTestId(
      "UCSBOrganizationTable-cell-row-0-col-Edit-button",
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith(
        `/ucsborganization/edit/${firstOrgCode}`,
      ),
    );
  });

  test("columns use the correct accessor keys (cells show real data)", () => {
    const row0 = ucsbOrganizationFixtures.threeOrganizations[0];
    const row2 = ucsbOrganizationFixtures.threeOrganizations[2];

    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.userOnly,
    );

    expect(screen.getByText(row0.orgCode)).toBeInTheDocument();
    expect(screen.getByText(row0.orgTranslationShort)).toBeInTheDocument();
    expect(screen.getByText(row0.orgTranslation)).toBeInTheDocument();

    // Boolean cell: assert via specific testids (avoid duplicate 'false' text ambiguity)
    expect(
      screen.getByTestId("UCSBOrganizationTable-cell-row-0-col-inactive"),
    ).toHaveTextContent(String(row0.inactive));
    expect(
      screen.getByTestId("UCSBOrganizationTable-cell-row-2-col-inactive"),
    ).toHaveTextContent(String(row2.inactive));
  });

  test("delete mutation is wired correctly and clicking Delete calls mutate with cell", async () => {
    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.adminUser,
    );

    // Hook wiring
    expect(lastMutationArgs).toBeTruthy();
    expect(lastMutationArgs.fn).toBe(cellToAxiosParamsDelete);
    expect(lastMutationArgs.opts?.onSuccess).toBe(onDeleteSuccess);
    expect(lastMutationArgs.deps).toEqual(["/api/ucsborganizations/all"]);

    // Click Delete -> mutate(cell)
    const delBtn = await screen.findByTestId(
      "UCSBOrganizationTable-cell-row-0-col-Delete-button",
    );
    fireEvent.click(delBtn);

    await waitFor(() => expect(mutateSpy).toHaveBeenCalledTimes(1));
    const passedCell = mutateSpy.mock.calls[0][0];
    expect(passedCell?.row?.original?.orgCode).toBe(
      ucsbOrganizationFixtures.threeOrganizations[0].orgCode,
    );
  });

  test("executing onDeleteSuccess covers console.log and toast(message)", () => {
    renderTable(
      ucsbOrganizationFixtures.threeOrganizations,
      currentUserFixtures.adminUser,
    );
    expect(lastMutationArgs?.opts?.onSuccess).toBe(onDeleteSuccess);

    const logSpy = vi.spyOn(console, "log").mockImplementation(() => {});
    const msg = "Organization deleted";

    lastMutationArgs.opts.onSuccess(msg);

    expect(logSpy).toHaveBeenCalledWith(msg);
    expect(toast).toHaveBeenCalledWith(msg);

    logSpy.mockRestore();
  });

  test("axios params builder produces correct DELETE config (extra guard)", async () => {
    const cell = {
      row: { original: ucsbOrganizationFixtures.threeOrganizations[0] },
    };
    const cfg = cellToAxiosParamsDelete(cell);
    expect(cfg).toEqual({
      url: "/api/ucsborganizations",
      method: "DELETE",
      params: { orgCode: cell.row.original.orgCode },
    });

    const mock = new AxiosMockAdapter(axios);
    mock.onDelete("/api/ucsborganizations").reply(200, { message: "ok" });
    await axios.delete(cfg.url, { params: cfg.params });
    expect(mock.history.delete.length).toBe(1);
    mock.reset();
  });
});
