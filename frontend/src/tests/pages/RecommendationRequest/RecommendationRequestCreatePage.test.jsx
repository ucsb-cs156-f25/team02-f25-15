import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import RecommendationRequestCreatePage from "main/pages/RecommendationRequest/RecommendationRequestCreatePage";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import { vi } from "vitest";

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

describe("RecommendationRequestCreatePage tests", () => {
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
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });
  });

  test("on submit, makes request to backend, and redirects to /recommendationrequest", async () => {
    const queryClient = new QueryClient();
    const recommendationRequest = {
      id: 3,
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "Grad School Recommendation",
      dateRequested: "2022-01-02T12:00",
      dateNeeded: "2022-05-01T12:00",
      done: false,
    };

    axiosMock
      .onPost("/api/recommendationrequest/post")
      .reply(202, recommendationRequest);

    render(
      <QueryClientProvider client={queryClient}>
        <MemoryRouter>
          <RecommendationRequestCreatePage />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    await waitFor(() => {
      expect(screen.getByLabelText("Requester Email")).toBeInTheDocument();
    });

    const requesterEmailInput = screen.getByLabelText("Requester Email");
    expect(requesterEmailInput).toBeInTheDocument();

    const professorEmailInput = screen.getByLabelText("Professor Email");
    expect(professorEmailInput).toBeInTheDocument();

    const explanationInput = screen.getByLabelText("Explanation");
    expect(explanationInput).toBeInTheDocument();

    const dateRequestedInput = screen.getByLabelText(
      "Date Requested (iso format)",
    );
    expect(dateRequestedInput).toBeInTheDocument();

    const dateNeededInput = screen.getByLabelText("Date Needed (iso format)");
    expect(dateNeededInput).toBeInTheDocument();

    const doneInput = screen.getByLabelText("Done");
    expect(doneInput).toBeInTheDocument();

    const createButton = screen.getByText("Create");
    expect(createButton).toBeInTheDocument();

    fireEvent.change(requesterEmailInput, {
      target: { value: "student@ucsb.edu" },
    });
    fireEvent.change(professorEmailInput, {
      target: { value: "professor@ucsb.edu" },
    });
    fireEvent.change(explanationInput, {
      target: { value: "Grad School Recommendation" },
    });
    fireEvent.change(dateRequestedInput, {
      target: { value: "2022-01-02T12:00" },
    });
    fireEvent.change(dateNeededInput, {
      target: { value: "2022-05-01T12:00" },
    });
    fireEvent.click(createButton);

    await waitFor(() => expect(axiosMock.history.post.length).toBe(1));

    expect(axiosMock.history.post[0].params).toEqual({
      requesterEmail: "student@ucsb.edu",
      professorEmail: "professor@ucsb.edu",
      explanation: "Grad School Recommendation",
      dateRequested: "2022-01-02T12:00",
      dateNeeded: "2022-05-01T12:00",
      done: false,
    });

    expect(mockToast).toBeCalledWith(
      "New RecommendationRequest Created - id: 3",
    );
    expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });
  });
});
