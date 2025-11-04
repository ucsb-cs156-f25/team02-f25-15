import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { toast } from "react-toastify";

vi.mock("react-toastify", () => ({ toast: vi.fn() }));

const mockUseParams = vi.fn(() => ({ orgCode: "ZBT" }));
const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const original = await importOriginal();
  return {
    ...original,
    useParams: () => mockUseParams(),
    Navigate: (props) => {
      mockNavigate(props);
      return null;
    },
  };
});

const setup = (props = {}) =>
  render(
    <QueryClientProvider client={new QueryClient()}>
      <MemoryRouter>
        <UCSBOrganizationEditPage {...props} />
      </MemoryRouter>
    </QueryClientProvider>
  );

const makeMock = () => {
  const mock = new AxiosMockAdapter(axios);
  mock.onGet("/api/currentUser").reply(200, {});
  mock.onGet("/api/systemInfo").reply(200, {});
  return mock;
};

const fillForm = async () => {
  const short = await screen.findByTestId("UCSBOrganizationForm-orgTranslationShort");
  const full = screen.getByTestId("UCSBOrganizationForm-orgTranslation");
  const inactive = screen.getByTestId("UCSBOrganizationForm-inactive");

  fireEvent.change(short, { target: { value: "ZBT (Updated)" } });
  fireEvent.change(full, { target: { value: "Zeta Beta Tau — Updated" } });
  fireEvent.click(inactive);
  fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));
};

describe("UCSBOrganizationEditPage", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  test("when route param missing → toast + Navigate", async () => {
    mockUseParams.mockReturnValueOnce({});
    const mock = makeMock();

    setup();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        expect.stringMatching(/Missing route param: orgCode/)
      )
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganization" });
    mock.restore();
  });

  test("GET success → shows form with correct initial values", async () => {
    const mock = makeMock();
    mock.onGet(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "Zeta",
      orgTranslation: "Zeta Beta Tau",
      inactive: false,
    });
    setup();

    const code = await screen.findByTestId("UCSBOrganizationForm-orgCode");
    expect(code).toHaveValue("ZBT");
    expect(code).toBeDisabled();

    mock.restore();
  });

  test("PUT success → updates and navigates back", async () => {
    const mock = makeMock();
    mock.onGet(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "Zeta",
      orgTranslation: "Zeta Beta Tau",
      inactive: false,
    });
    mock.onPut(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "ZBT (Updated)",
      orgTranslation: "Zeta Beta Tau — Updated",
      inactive: true,
    });

    setup();
    await fillForm();

    await waitFor(() => expect(mock.history.put.length).toBe(1));
    const req = mock.history.put[0];
    expect(req.url).toBe("/api/ucsborganizations");
    expect(JSON.parse(req.data)).toEqual({
      orgTranslationShort: "ZBT (Updated)",
      orgTranslation: "Zeta Beta Tau — Updated",
      inactive: true,
    });
    expect(req.params).toEqual({ orgCode: "ZBT" });

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: ZBT"
      )
    );
    await waitFor(() =>
      expect(mockNavigate).toHaveBeenCalledWith({ to: "/ucsborganization" })
    );
    mock.restore();
  });

  test("storybook=true → toast but no navigation", async () => {
    const mock = makeMock();
    mock.onGet(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "Zeta",
      orgTranslation: "Zeta Beta Tau",
      inactive: false,
    });
    mock.onPut(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "ZBT (Updated)",
      orgTranslation: "Zeta Beta Tau — Updated",
      inactive: true,
    });

    setup({ storybook: true });
    await fillForm();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: ZBT"
      )
    );
    expect(mockNavigate).not.toHaveBeenCalled();

    mock.restore();
  });

  test("PUT response missing orgCode → uses fallback toast value", async () => {
    const mock = makeMock();
    mock.onGet(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "Zeta Beta Tau",
      orgTranslation: "Zeta Beta Tau Fraternity",
      inactive: false,
    });
    mock.onPut(/\/api\/ucsborganizations/).reply(200, {
      orgTranslationShort: "ZBT (Updated)",
      orgTranslation: "ZBT Updated",
      inactive: true,
    });

    setup();
    await fillForm();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: ZBT"
      )
    );
    mock.restore();
  });

  test("PUT returns null → handles gracefully and uses route orgCode", async () => {
    const mock = makeMock();
    mock.onGet("/api/ucsborganizations", { params: { orgCode: "ZBT" } }).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "Zeta",
      orgTranslation: "Zeta Beta Tau",
      inactive: false,
    });
    mock.onPut("/api/ucsborganizations").reply(200, null);

    setup();
    await fillForm();

    await waitFor(() =>
      expect(toast).toHaveBeenCalledWith(
        "UCSBOrganization Updated - orgCode: ZBT"
      )
    );
    mock.restore();
  });

  test("legacy route id param used when orgCode missing", async () => {
    mockUseParams.mockReturnValueOnce({ id: "ZBT" });
    const mock = makeMock();
    mock.onGet(/\/api\/ucsborganizations/).reply(200, {
      orgCode: "ZBT",
      orgTranslationShort: "Zeta",
      orgTranslation: "Zeta Beta Tau",
      inactive: false,
    });

    setup();

    const code = await screen.findByTestId("UCSBOrganizationForm-orgCode");
    expect(code).toHaveValue("ZBT");
    mock.restore();
  });

  // ✅ FINAL TEST 8: kills array + string literal mutants
  test("verifies correct GET method and invalidation key", async () => {
    vi.resetModules();
    let capturedKey, capturedCfg, capturedInvalidateKeys;

    vi.doMock("main/utils/useBackend", async (orig) => {
      const actual = await orig();
      return {
        __esModule: true,
        ...actual,
        useBackend: (key, cfg) => {
          capturedKey = key;
          capturedCfg = cfg;
          return { data: {} };
        },
        useBackendMutation: (fn, opts, invalidate) => {
          capturedInvalidateKeys = invalidate;
          return { mutate: vi.fn(), isSuccess: false };
        },
      };
    });

    const React = await import("react");
    const { default: Page } = await import(
      "main/pages/UCSBOrganization/UCSBOrganizationEditPage"
    );
    const { QueryClient, QueryClientProvider } = await import(
      "@tanstack/react-query"
    );
    const { MemoryRouter } = await import("react-router");

    // GET actually happens
    const axiosMock = new (await import("axios-mock-adapter")).default(axios);
    axiosMock.onGet("/api/currentUser").reply(200, {});
    axiosMock.onGet("/api/systemInfo").reply(200, {});
    axiosMock
      .onGet("/api/ucsborganizations", { params: { orgCode: "ZBT" } })
      .reply(200, { orgCode: "ZBT" });

    render(
      React.createElement(
        QueryClientProvider,
        { client: new QueryClient() },
        React.createElement(MemoryRouter, null, React.createElement(Page, null))
      )
    );

    await screen.findByText("Edit UCSBOrganization");

    //correct key and GET method
    expect(capturedKey).toEqual(["/api/ucsborganizations?orgCode=ZBT"]);
    expect(capturedCfg.method).toBe("GET");
    //orrect invalidation array
    expect(capturedInvalidateKeys).toEqual([
      `/api/ucsborganizations?orgCode=ZBT`,
    ]);
    await waitFor(() =>
      expect(axiosMock.history.get.some((r) => r.method === "get")).toBe(true)
    );

    axiosMock.restore();
  });
});
