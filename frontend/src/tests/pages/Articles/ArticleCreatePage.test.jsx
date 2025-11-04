import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import ArticleCreatePage from "main/pages/Articles/ArticleCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";

import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";

const mockToast = vi.fn();
vi.mock("react-toastify", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    toast: vi.fn((x) => mockToast(x)),
  };
});

const mockNavigate = vi.fn();
vi.mock("react-router", async (importOriginal) => {
  const originalModule = await importOriginal();
  return {
    ...originalModule,
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

describe("ArticleCreatePage tests", () => {
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
  test("renders without crashing", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /articles", async () => {
    const queryClient = new QueryClient();
    const article = {
      id: 3,
      title: "South Coast Deli",
      url: "https://southcoastdeli.com",
      email: "info@southcoastdeli.com",
      explanation: "Sandwiches and Salads",
      localDateTime: "2023-10-30T12:00",
    };

    axiosMock.onPost("/api/articles/post").reply(202, article);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <ArticleCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Title")).toBeInTheDocument();
    });

    const titleInput = screen.getByLabelText("Title");
    expect(titleInput).toBeInTheDocument();

    const URLInput = screen.getByLabelText("URL");
    expect(URLInput).toBeInTheDocument();
    const EmailInput = screen.getByLabelText("Email");
    expect(EmailInput).toBeInTheDocument();
    const ExplanationInput = screen.getByLabelText("Explanation");
    expect(ExplanationInput).toBeInTheDocument();
    const LocalDateTimeInput = screen.getByLabelText("Date (iso format)");
    expect(LocalDateTimeInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(titleInput, { target: { value: "South Coast Deli" } });
    fireEvent.change(URLInput, {
      target: { value: "https://southcoastdeli.com" },
    });
    fireEvent.change(EmailInput, {
      target: { value: "info@southcoastdeli.com" },
    });
    fireEvent.change(ExplanationInput, {
      target: { value: "Sandwiches and Salads" },
    });
    fireEvent.change(LocalDateTimeInput, {
      target: { value: "2023-10-30T12:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      title: "South Coast Deli",
      url: "https://southcoastdeli.com",
      email: "info@southcoastdeli.com",
      explanation: "Sandwiches and Salads",
      localDateTime: "2023-10-30T12:00",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New article Created - id: 3 title: South Coast Deli",
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/articles" });
  });
});
