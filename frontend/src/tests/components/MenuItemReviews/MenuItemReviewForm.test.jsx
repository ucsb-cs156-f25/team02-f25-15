import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import MenuItemReviewForm from "main/components/MenuItemReviews/MenuItemReviewForm";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("MenuItemReviewForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Item ID",
    "Reviewer Email",
    "Stars",
    "Date Reviewed (iso format)",
    "Comments",
  ];
  const testId = "MenuItemReviewForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });
  });

  test("renders correctly when passing in initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            initialContents={menuItemReviewFixtures.oneMenuItemReview}
          />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      const header = screen.getByText(headerText);
      expect(header).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText(`Id`)).toBeInTheDocument();
  });

  test("that navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>
    );
    expect(await screen.findByTestId(`${testId}-cancel`)).toBeInTheDocument();
    const cancelButton = screen.getByTestId(`${testId}-cancel`);

    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("that the correct validations are performed", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm />
        </Router>
      </QueryClientProvider>
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/Item ID is required/);
    expect(screen.getByText(/Reviewer Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Stars are required/)).toBeInTheDocument();
    expect(
      screen.getByText(/Date reviewed \(iso format\) is required/)
    ).toBeInTheDocument();
    expect(screen.getByText(/Comment is required/)).toBeInTheDocument();

    const reviewerEmailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    fireEvent.change(reviewerEmailInput, {
      target: { value: "a".repeat(256) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });

    const commentsInput = screen.getByTestId(`${testId}-comments`);
    fireEvent.change(commentsInput, { target: { value: "a".repeat(256) } });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });
  });

  // extra test for ss coverage
  test("calls submitAction with properly formatted data on submit", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm
            submitAction={mockSubmitAction}
            buttonLabel="Update"
          />
        </Router>
      </QueryClientProvider>
    );

    const itemIdInput = screen.getByTestId(`${testId}-itemId`);
    const reviewerEmailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateReviewedInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    fireEvent.change(itemIdInput, { target: { value: "5" } });
    fireEvent.change(reviewerEmailInput, {
      target: { value: "test@test.com" },
    });
    fireEvent.change(starsInput, { target: { value: "4" } });
    fireEvent.change(dateReviewedInput, {
      target: { value: "2025-11-03T20:00" },
    });
    fireEvent.change(commentsInput, { target: { value: "Good food" } });

    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockSubmitAction).toHaveBeenCalledTimes(1);
      expect(mockSubmitAction).toHaveBeenCalledWith({
        itemId: "5",
        reviewerEmail: "test@test.com",
        stars: "4",
        dateReviewed: "2025-11-03T20:00:00",
        comments: "Good food",
      });
    });
  });

  test("enforces max length validation on comments field", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <MenuItemReviewForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>
    );

    const itemIdInput = screen.getByTestId(`${testId}-itemId`);
    const reviewerEmailInput = screen.getByTestId(`${testId}-reviewerEmail`);
    const starsInput = screen.getByTestId(`${testId}-stars`);
    const dateReviewedInput = screen.getByTestId(`${testId}-dateReviewed`);
    const commentsInput = screen.getByTestId(`${testId}-comments`);
    const submitButton = screen.getByTestId(`${testId}-submit`);

    // Fill all fields EXCEPT comments with valid data
    fireEvent.change(itemIdInput, { target: { value: "5" } });
    fireEvent.change(reviewerEmailInput, {
      target: { value: "test@test.com" },
    });
    fireEvent.change(starsInput, { target: { value: "4" } });
    fireEvent.change(dateReviewedInput, {
      target: { value: "2025-11-03T20:00" },
    });

    // Make ONLY comments exceed max length (256 characters)
    fireEvent.change(commentsInput, { target: { value: "a".repeat(256) } });

    fireEvent.click(submitButton);

    // Should show the SPECIFIC max length error message
    await waitFor(() => {
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument();
    });

    // Verify form was NOT submitted due to validation error
    expect(mockSubmitAction).not.toHaveBeenCalled();
  });
});
