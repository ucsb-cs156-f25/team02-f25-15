import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { articlesFixtures } from "fixtures/articlesFixtures";
import ArticleTable from "main/components/Articles/ArticleTable";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { currentUserFixtures } from "fixtures/currentUserFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("ArticleTable tests", () => {
  const queryClient = new QueryClient();
  const expectedHeaders = ["id", "Title", "URL", "Email", "Explanation"];
  const expectedFields = ["id", "title", "url", "email", "explanation"];
  const testId = "ArticleTable";

  test("renders empty table correctly", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleTable articles={[]} currentUser={currentUser} />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expectedFields.forEach((field) => {
      expect(
        screen.queryByTestId(`${testId}-cell-row-0-col-${field}`),
      ).not.toBeInTheDocument();
    });
  });

  test("Has the expected column headers, content and buttons for admin user", () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    // --- Row 0 checks ---
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-title`),
    ).toHaveTextContent("guyfallsoffcliff");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-url`),
    ).toHaveTextContent("www.news.com/guyfallsoffcliff");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-email`),
    ).toHaveTextContent("joesmith@email.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-explanation`),
    ).toHaveTextContent("guy falls off cliff");

    // --- Row 1 checks ---
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-title`),
    ).toHaveTextContent("guygetsinjured");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-url`),
    ).toHaveTextContent("www.news.com/guygetsinjured");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-email`),
    ).toHaveTextContent("joesmith@email.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-explanation`),
    ).toHaveTextContent("guy gets injured");

    // --- Row 2 checks ---
    expect(screen.getByTestId(`${testId}-cell-row-2-col-id`)).toHaveTextContent(
      "3",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-title`),
    ).toHaveTextContent("guyrecovers");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-url`),
    ).toHaveTextContent("www.news.com/guyrecovers");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-email`),
    ).toHaveTextContent("joesmith@email.com");
    expect(
      screen.getByTestId(`${testId}-cell-row-2-col-explanation`),
    ).toHaveTextContent("guy recovers");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    expect(editButton).toBeInTheDocument();
    expect(editButton).toHaveClass("btn-primary");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();
    expect(deleteButton).toHaveClass("btn-danger");
  });

  test("Has the expected column headers, content for ordinary user", () => {
    const currentUser = currentUserFixtures.userOnly;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    // Spot-check first two rows
    expect(screen.getByTestId(`${testId}-cell-row-0-col-id`)).toHaveTextContent(
      "1",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-0-col-title`),
    ).toHaveTextContent("guyfallsoffcliff");
    expect(screen.getByTestId(`${testId}-cell-row-1-col-id`)).toHaveTextContent(
      "2",
    );
    expect(
      screen.getByTestId(`${testId}-cell-row-1-col-title`),
    ).toHaveTextContent("guygetsinjured");

    expect(screen.queryByText("Delete")).not.toBeInTheDocument();
    expect(screen.queryByText("Edit")).not.toBeInTheDocument();
  });

  test("Edit button navigates to the edit page", async () => {
    const currentUser = currentUserFixtures.adminUser;

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    const editButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Edit-button`,
    );
    fireEvent.click(editButton);

    await waitFor(() =>
      expect(mockedNavigate).toHaveBeenCalledWith("/articles/edit/1"),
    );
  });

  test("Delete button calls delete callback", async () => {
    const currentUser = currentUserFixtures.adminUser;

    const axiosMock = new AxiosMockAdapter(axios);
    axiosMock
      .onDelete("/api/articles")
      .reply(200, { message: "Article deleted" });

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleTable
            articles={articlesFixtures.threeArticles}
            currentUser={currentUser}
          />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    expect(
      await screen.findByTestId(`${testId}-cell-row-0-col-id`),
    ).toHaveTextContent("1");

    const deleteButton = screen.getByTestId(
      `${testId}-cell-row-0-col-Delete-button`,
    );
    expect(deleteButton).toBeInTheDocument();

    fireEvent.click(deleteButton);

    await waitFor(() => expect(axiosMock.history.delete.length).toBe(1));
    expect(axiosMock.history.delete[0].params).toEqual({ id: 1 });
  });
});

// ----------------------------------------------------
// Additional tests for articleUtils (keeps mutation 100%)
// ----------------------------------------------------
import { toast } from "react-toastify";
import {
  onDeleteSuccess,
  cellToAxiosParamsDelete,
} from "main/utils/articleUtils";

// Mock toast so no actual popup appears
vi.mock("react-toastify", () => ({
  toast: vi.fn(),
}));

describe("articleUtils tests (added to ArticleTable.test.jsx)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test("onDeleteSuccess logs and calls toast", () => {
    const message = "Article deleted successfully";
    const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {});

    onDeleteSuccess(message);

    expect(consoleSpy).toHaveBeenCalledWith(message);
    expect(toast).toHaveBeenCalledWith(message);

    consoleSpy.mockRestore();
  });

  test("cellToAxiosParamsDelete returns proper axios config", () => {
    const cell = {
      row: {
        original: { id: 42 },
      },
    };

    const result = cellToAxiosParamsDelete(cell);

    expect(result).toEqual({
      url: "/api/articles",
      method: "DELETE",
      params: { id: 42 },
    });

    // Extra checks to guarantee mutation kills
    expect(result.url).toBe("/api/articles");
    expect(result.method).toBe("DELETE");
    expect(result.params.id).toBe(42);
  });
});
