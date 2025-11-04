import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (orig) => {
  const m = await orig();
  return { ...m, toast: vi.fn((x) => mockToast(x)) };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (orig) => {
  const m = await orig();
  return {
    ...m,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("UCSBOrganizationCreatePage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);

  beforeEach(() => {
    vi.clearAllMocks();
    axiosMock.reset();
    axiosMock.resetHistory();
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  });

  const queryClient = new QueryClient();

  test("renders form", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(
        screen.getByTestId("UCSBOrganizationForm-orgCode"),
      ).toBeInTheDocument();
    });
  });

  test("submit posts to backend and redirects to /ucsborganization", async () => {
    const created = {
      id: 5,
      orgCode: "ZETA",
      orgTranslationShort: "Zeta Org",
      orgTranslation: "Zeta Organization Full Name",
      inactive: true,
    };

    axiosMock.onPost("/api/ucsborganizations/post").reply(202, created);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() =>
      expect(
        screen.getByTestId("UCSBOrganizationForm-orgCode"),
      ).toBeInTheDocument(),
    );

    fireEvent.change(screen.getByTestId("UCSBOrganizationForm-orgCode"), {
      target: { value: "ZETA" },
    });
    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      {
        target: { value: "Zeta Org" },
      },
    );
    fireEvent.change(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      {
        target: { value: "Zeta Organization Full Name" },
      },
    );
    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-inactive"));
    fireEvent.click(screen.getByTestId("UCSBOrganizationForm-submit"));

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      orgCode: "ZETA",
      orgTranslationShort: "Zeta Org",
      orgTranslation: "Zeta Organization Full Name",
      inactive: true,
    });

    expect(mockToast).toBeCalledWith(
      "New UCSBOrganization Created - id: 5 orgCode: ZETA",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/ucsborganization" });
  });
});
