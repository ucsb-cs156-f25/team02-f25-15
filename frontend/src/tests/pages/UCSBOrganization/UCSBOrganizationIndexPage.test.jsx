import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import UCSBOrganizationIndexPage from "main/pages/UCSBOrganization/UCSBOrganizationIndexPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbOrganizationFixtures } from "fixtures/ucsbOrganizationFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

describe("UCSBOrganizationIndexPage tests", () => {
  const axiosMock = new AxiosMockAdapter(axios);
  const queryClient = new QueryClient();

  beforeEach(() => {
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

  const mockCommon = (userFixture) => {
    axiosMock.onGet("/api/currentUser").reply(200, userFixture);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  test("renders correctly for regular user (array response)", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();

    await screen.findByRole("heading", { name: "UCSBOrganization" });
    expect(
      screen.queryByRole("button", { name: "Create UCSBOrganization" }),
    ).not.toBeInTheDocument();
  });

  test("renders Create button for admin user (array response)", async () => {
    mockCommon(apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();

    await screen.findByRole("heading", { name: "UCSBOrganization" });
    const createBtn = await screen.findByRole("button", {
      name: "Create UCSBOrganization",
    });
    expect(createBtn).toHaveAttribute("href", "/ucsborganization/create");
    expect(
      await screen.findByRole("button", { name: "Create UCSBOrganization" }),
    ).toBeInTheDocument();
  });
  test("handles backend response with { content: [...] }", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, {
      content: ucsbOrganizationFixtures.threeOrganizations,
    });

    renderPage();

    await screen.findByRole("heading", { name: "UCSBOrganization" });
    for (const row of ucsbOrganizationFixtures.threeOrganizations) {
      expect(await screen.findByText(row.orgCode)).toBeInTheDocument();
    }
  });

  // [] when object has no content
  test("renders with empty list when backend returns object without content", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, {});
    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    expect(
      screen.queryByRole("button", { name: "Create UCSBOrganization" }),
    ).not.toBeInTheDocument();
  });

  test("treats null response as empty array and passes [] to table", async () => {
    const localAxiosMock = new AxiosMockAdapter(axios);
    const localQueryClient = new QueryClient();
    localAxiosMock.onGet("/api/currentUser").reply(200, apiCurrentUserFixtures.userOnly);
    localAxiosMock.onGet("/api/systemInfo").reply(200, systemInfoFixtures.showingNeither);
    localAxiosMock.onGet("/api/ucsborganizations/all").reply(200, null);
    vi.resetModules();
    let capturedProps;
    vi.doMock("main/components/UCSBOrganization/UCSBOrganizationTable", async () => {
      const React = await import("react");
      return {
        __esModule: true,
        default: (props) => {
          capturedProps = props;
          return React.createElement("div", { "data-testid": "UCSBOrganizationTable-mock" });
        },
      };
    });
    // Import the page
    const React = await import("react");
    const { default: Page } = await import(
      "main/pages/UCSBOrganization/UCSBOrganizationIndexPage"
    );
    render(
      React.createElement(QueryClientProvider, { client: localQueryClient },
        React.createElement(MemoryRouter, null,
          React.createElement(Page, null)
        )
      )
    );
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    await screen.findByTestId("UCSBOrganizationTable-mock");
    expect(Array.isArray(capturedProps.organizations)).toBe(true);
    expect(capturedProps.organizations.length).toBe(0);

    vi.resetModules();
    localAxiosMock.restore();
  });
  test("calls the correct backend URL", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });

    const urls = axiosMock.history.get.map((r) => r.url);
    expect(urls).toContain("/api/ucsborganizations/all");
  });

  test("refetches on invalidateQueries of the plural key", async () => {
    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onGet("/api/currentUser")
      .reply(200, apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .replyOnce(200, ucsbOrganizationFixtures.threeOrganizations);

    const queryClient = new QueryClient();
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    const smaller = ucsbOrganizationFixtures.threeOrganizations.slice(0, 2);
    axiosMock.onGet("/api/ucsborganizations/all").replyOnce(200, smaller);
    await queryClient.invalidateQueries({
      queryKey: ["/api/ucsborganizations/all"],
    });
    await waitFor(() => {
      expect(
        screen.queryByText(
          ucsbOrganizationFixtures.threeOrganizations[2].orgCode,
        ),
      ).not.toBeInTheDocument();
    });

    axiosMock.restore();
  });
});
describe("Additional mutation-killing tests", () => {
  let axiosMock;
  let queryClient;

  beforeEach(() => {
    axiosMock = new AxiosMockAdapter(axios);
    queryClient = new QueryClient();
    axiosMock.reset();
    axiosMock.resetHistory();
  });

  afterEach(() => {
    axiosMock.restore();
  });

  const mockCommon = (userFixture) => {
    axiosMock.onGet("/api/currentUser").reply(200, userFixture);
    axiosMock
      .onGet("/api/systemInfo")
      .reply(200, systemInfoFixtures.showingNeither);
  };

  const renderPage = () =>
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <UCSBOrganizationIndexPage />
        </MemoryRouter>
      </QueryClientProvider>,
    );
  test("uses GET method for fetching organizations", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });

    await waitFor(() => {
      const getRequests = axiosMock.history.get;
      const orgRequest = getRequests.find(req => 
        req.url === "/api/ucsborganizations/all"
      );
      
      expect(orgRequest).toBeDefined();
      expect(orgRequest.method).toBe("get");
    });
  });
  test("handles undefined response gracefully", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, undefined);

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    
    // Check that none of the org codes from fixtures appear
    for (const org of ucsbOrganizationFixtures.threeOrganizations) {
      expect(screen.queryByText(org.orgCode)).not.toBeInTheDocument();
    }
  });
  test("extracts content array from paginated response object", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    const paginatedResponse = {
      content: ucsbOrganizationFixtures.threeOrganizations,
      totalElements: 3,
      totalPages: 1,
    };
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, paginatedResponse);

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    await waitFor(() => {
      for (const org of ucsbOrganizationFixtures.threeOrganizations) {
        expect(screen.getByText(org.orgCode)).toBeInTheDocument();
      }
    });
  });
  test("Create button has float right style for admin", async () => {
    mockCommon(apiCurrentUserFixtures.adminUser);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, ucsbOrganizationFixtures.threeOrganizations);

    renderPage();
    
    const createBtn = await screen.findByRole("button", {
      name: "Create UCSBOrganization",
    });
    
    expect(createBtn).toHaveStyle({ float: "right" });
  });
  test("handles response with null content property", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, {
      content: null,
      totalElements: 0,
    });

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    
    // should display no organizations
    for (const org of ucsbOrganizationFixtures.threeOrganizations) {
      expect(screen.queryByText(org.orgCode)).not.toBeInTheDocument();
    }
  });

  test("uses array response directly without accessing content property", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    const arrayResponse = ucsbOrganizationFixtures.threeOrganizations;
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, arrayResponse);

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });

    for (const org of ucsbOrganizationFixtures.threeOrganizations) {
      expect(await screen.findByText(org.orgCode)).toBeInTheDocument();
    }
  });
  test("calls exact /api/ucsborganizations/all endpoint without modifications", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock
      .onGet("/api/ucsborganizations/all")
      .reply(200, []);

    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });

    await waitFor(() => {
      const getRequests = axiosMock.history.get;
      const exactMatch = getRequests.find(req => 
        req.url === "/api/ucsborganizations/all"
      );
      expect(exactMatch).toBeDefined();
      expect(exactMatch.url).toBe("/api/ucsborganizations/all");
    });
  });
  test("defaults to empty array when organizations is falsy", async () => {
    mockCommon(apiCurrentUserFixtures.userOnly);
    axiosMock.onGet("/api/ucsborganizations/all").reply(200, false);
    renderPage();
    await screen.findByRole("heading", { name: "UCSBOrganization" });
    for (const org of ucsbOrganizationFixtures.threeOrganizations) {
      expect(screen.queryByText(org.orgCode)).not.toBeInTheDocument();
    }
  });
<<<<<<< HEAD
});
=======
});
>>>>>>> origin/jl-menuitemreview-table
