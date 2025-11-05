import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import MenuItemReviewsCreatePage from "main/pages/MenuItemReviews/MenuItemReviewsCreatePage";
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

describe("MenuItemReviewsCreatePage tests", () => {
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
          <MenuItemReviewsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /menuitemreviews", async () => {
    const queryClient = new QueryClient();
    const menuitemreview = {
      id: 1,
      itemId: 1,
      reviewerEmail: "jaydenli@ucsb.edu",
      stars: 5,
      dateReviewed: "2025-11-03T12:59",
      comments: "yummy food!",
    };

    axiosMock.onPost("/api/menuitemreviews/post").reply(202, menuitemreview);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <MenuItemReviewsCreatePage />
        </MemoryRouter>
      </QueryClientProvider>
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Item ID")).toBeInTheDocument();
    });

    const itemIdInput = screen.getByLabelText("Item ID");
    expect(itemIdInput).toBeInTheDocument();

    const reviewerEmailInput = screen.getByLabelText("Reviewer Email");
    expect(reviewerEmailInput).toBeInTheDocument();

    const starsInput = screen.getByLabelText("Stars");
    expect(starsInput).toBeInTheDocument();

    const dateReviewedInput = screen.getByLabelText(
      "Date Reviewed (iso format)"
    );
    expect(dateReviewedInput).toBeInTheDocument();

    const commentsInput = screen.getByLabelText("Comments");
    expect(commentsInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(itemIdInput, { target: { value: 1 } });
    fireEvent.change(reviewerEmailInput, {
      target: { value: "jaydenli@ucsb.edu" },
    });
    fireEvent.change(starsInput, { target: { value: 5 } });
    fireEvent.change(dateReviewedInput, {
      target: { value: "2025-11-03T12:59" },
    });
    fireEvent.change(commentsInput, { target: { value: "yummy food!" } });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      itemId: 1,
      reviewerEmail: "jaydenli@ucsb.edu",
      stars: 5,
      dateReviewed: "2025-11-03T12:59:00",
      comments: "yummy food!",
    });

    // assert - check that the toast was called with the expected message
    expect(mockToast).toHaveBeenCalledWith(
      "New menu item review Created - id: 1 itemId: 1"
    );
    expect(mockNavigate).toHaveBeenCalledWith({ to: "/menuitemreviews" });
  });
});
