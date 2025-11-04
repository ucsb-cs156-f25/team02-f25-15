import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { vi } from "vitest";

import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { recommendationRequestFixtures } from "fixtures/recommendationRequestFixtures";

const mockedNavigate = vi.fn();

vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("RecommendationRequestForm tests", () => {
  const queryClient = new QueryClient();
  const testId = "RecommendationRequestForm";
  const expectedHeaders = [
    "Requester Email",
    "Professor Email",
    "Explanation",
    "Date Requested (iso format)",
    "Date Needed (iso format)",
    "Done",
  ];

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });
  });

  test("renders correctly with initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            initialContents={recommendationRequestFixtures.oneRequest}
          />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();

    expectedHeaders.forEach((headerText) => {
      expect(screen.getByText(headerText)).toBeInTheDocument();
    });

    expect(await screen.findByTestId(`${testId}-id`)).toBeInTheDocument();
    expect(screen.getByText("Id")).toBeInTheDocument();
  });

  test("navigate(-1) is called when Cancel is clicked", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    const cancelButton = await screen.findByTestId(`${testId}-cancel`);
    fireEvent.click(cancelButton);

    await waitFor(() => expect(mockedNavigate).toHaveBeenCalledWith(-1));
  });

  test("validates required fields", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.click(screen.getByText(/Create/));

    await screen.findByText(/Requester Email is required/);
    expect(screen.getByText(/Professor Email is required/)).toBeInTheDocument();
    expect(screen.getByText(/Explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Requested is required/)).toBeInTheDocument();
    expect(screen.getByText(/Date Needed is required/)).toBeInTheDocument();
  });

  test("submits correctly with valid data", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm submitAction={mockSubmitAction} />
        </Router>
      </QueryClientProvider>,
    );

    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: "student@example.com" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "prof@example.com" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Please write a recommendation for my grad school." },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
      target: { value: "2024-01-10T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2024-02-01T12:00" },
    });
    fireEvent.click(screen.getByTestId(`${testId}-done`));

    fireEvent.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(mockSubmitAction).toHaveBeenCalledTimes(1));

    const formData = mockSubmitAction.mock.calls[0][0];
    expect(formData).toMatchObject({
      requesterEmail: "student@example.com",
      professorEmail: "prof@example.com",
      explanation: "Please write a recommendation for my grad school.",
      dateRequested: "2024-01-10T12:00",
      dateNeeded: "2024-02-01T12:00",
      done: true,
    });
  });

  test("rejects invalid requesterEmail", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );
  
    const requesterEmail = screen.getByTestId(`${testId}-requesterEmail`);
    
    // Use a value that fails the regex but might pass HTML5 validation
    fireEvent.change(requesterEmail, { target: { value: "test@test" } });
    
    // Fill other required fields
    fireEvent.change(screen.getByTestId(`${testId}-professorEmail`), {
      target: { value: "prof@example.com" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-explanation`), {
      target: { value: "Some explanation" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateRequested`), {
      target: { value: "2024-01-10T12:00" },
    });
    fireEvent.change(screen.getByTestId(`${testId}-dateNeeded`), {
      target: { value: "2024-02-01T12:00" },
    });
  
    fireEvent.click(screen.getByText(/Create/));
  
    await waitFor(() => {
      expect(screen.getByText('Email should contain one "@" and one "."')).toBeInTheDocument();
    });
  });

  test("validates max length for requesterEmail", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    const longEmail = "a".repeat(256) + "@example.com";
    fireEvent.change(screen.getByTestId(`${testId}-requesterEmail`), {
      target: { value: longEmail },
    });
    fireEvent.click(screen.getByText(/Create/));

    await waitFor(() =>
      expect(screen.getByText(/Max length 255 characters/)).toBeInTheDocument(),
    );
  });

  test("prefills form when initialContents are provided", async () => {
    const mockSubmitAction = vi.fn();

    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm
            submitAction={mockSubmitAction}
            initialContents={{
              requesterEmail: "prefilled@example.com",
              professorEmail: "prof@example.com",
              explanation: "Prefilled explanation",
              dateRequested: "2024-01-01T10:00",
              dateNeeded: "2024-02-01T10:00",
              done: false,
            }}
          />
        </Router>
      </QueryClientProvider>,
    );

    const requesterEmail = await screen.findByTestId(`${testId}-requesterEmail`);
    expect(requesterEmail.value).toBe("prefilled@example.com");
  });

  test("uses provided buttonLabel prop", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm buttonLabel="Update" />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Update/)).toBeInTheDocument();
  });
  
  test("shows max length validation message for requesterEmail", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );
  
    await screen.findByTestId(`${testId}-requesterEmail`);
    const requesterEmailField = screen.getByTestId(`${testId}-requesterEmail`);
    const submitButton = screen.getByTestId(`${testId}-submit`);
  
    // Create a valid email format that's longer than 255 characters
    const longEmail = "a".repeat(250) + "@b.com"; // 256 characters total
    fireEvent.change(requesterEmailField, { target: { value: longEmail } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(screen.getByText("Max length 255 characters")).toBeInTheDocument();
    });
  });
  
  test("shows max length validation message for professorEmail", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );
  
    await screen.findByTestId(`${testId}-professorEmail`);
    const professorEmailField = screen.getByTestId(`${testId}-professorEmail`);
    const submitButton = screen.getByTestId(`${testId}-submit`);
  
    // Create a valid email format that's longer than 255 characters
    const longEmail = "b".repeat(250) + "@c.com"; // 256 characters total
    fireEvent.change(professorEmailField, { target: { value: longEmail } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      expect(screen.getByText("Max length 255 characters")).toBeInTheDocument();
    });
  });
  
  test("shows ISO format validation message for dateRequested", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );
  
    await screen.findByTestId(`${testId}-dateRequested`);
    const dateRequestedField = screen.getByTestId(`${testId}-dateRequested`);
    const requesterEmailField = screen.getByTestId(`${testId}-requesterEmail`);
    const professorEmailField = screen.getByTestId(`${testId}-professorEmail`);
    const explanationField = screen.getByTestId(`${testId}-explanation`);
    const dateNeededField = screen.getByTestId(`${testId}-dateNeeded`);
    const submitButton = screen.getByTestId(`${testId}-submit`);
  
    // Fill in other required fields with valid data
    fireEvent.change(requesterEmailField, { target: { value: "test@test.com" } });
    fireEvent.change(professorEmailField, { target: { value: "prof@test.com" } });
    fireEvent.change(explanationField, { target: { value: "test explanation" } });
    fireEvent.change(dateNeededField, { target: { value: "2022-01-02T12:00" } });
    
    // Set invalid date format
    fireEvent.change(dateRequestedField, { target: { value: "invalid" } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      // Check if the field has the is-invalid class
      expect(dateRequestedField).toHaveClass("is-invalid");
    });
  });
  
  test("shows ISO format validation message for dateNeeded", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <RecommendationRequestForm />
        </Router>
      </QueryClientProvider>
    );
  
    await screen.findByTestId(`${testId}-dateNeeded`);
    const dateNeededField = screen.getByTestId(`${testId}-dateNeeded`);
    const requesterEmailField = screen.getByTestId(`${testId}-requesterEmail`);
    const professorEmailField = screen.getByTestId(`${testId}-professorEmail`);
    const explanationField = screen.getByTestId(`${testId}-explanation`);
    const dateRequestedField = screen.getByTestId(`${testId}-dateRequested`);
    const submitButton = screen.getByTestId(`${testId}-submit`);
  
    // Fill in other required fields with valid data
    fireEvent.change(requesterEmailField, { target: { value: "test@test.com" } });
    fireEvent.change(professorEmailField, { target: { value: "prof@test.com" } });
    fireEvent.change(explanationField, { target: { value: "test explanation" } });
    fireEvent.change(dateRequestedField, { target: { value: "2022-01-02T12:00" } });
    
    // Set invalid date format
    fireEvent.change(dateNeededField, { target: { value: "invalid" } });
    fireEvent.click(submitButton);
  
    await waitFor(() => {
      // Check if the field has the is-invalid class
      expect(dateNeededField).toHaveClass("is-invalid");
    });
  });
});
