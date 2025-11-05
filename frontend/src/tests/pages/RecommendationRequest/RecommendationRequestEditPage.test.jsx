import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import RecommendationRequestEditPage from "main/pages/RecommendationRequest/RecommendationRequestEditPage";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";
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
    useParams: vi.fn(() => ({
      id: 17,
    })),
    Navigate: vi.fn((x) => {
      mockNavigate(x);
      return null;
    }),
  };
});

let axiosMock;
describe("RecommendationRequestEditPage tests", () => {
  describe("when the backend doesn't return data", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .timeout();
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();
    test("renders header but table is not present", async () => {
      const restoreConsole = mockConsole();

      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );
      await screen.findByText("Edit Recommendation Request");
      expect(
        screen.queryByTestId("RecommendationRequestForm-requesterEmail")
      ).not.toBeInTheDocument();
      restoreConsole();
    });
  });

  describe("tests where backend is working normally", () => {
    beforeEach(() => {
      axiosMock = new AxiosMockAdapter(axios);
      axiosMock.reset();
      axiosMock.resetHistory();
      axiosMock
        .onGet("/api/currentUser")
        .reply(200, apiCurrentUserFixtures.userOnly);
      axiosMock
        .onGet("/api/systemInfo")
        .reply(200, systemInfoFixtures.showingNeither);
      axiosMock
        .onGet("/api/recommendationrequest", { params: { id: 17 } })
        .reply(200, {
          id: 17,
          requesterEmail: "student@ucsb.edu",
          professorEmail: "professor@ucsb.edu",
          explanation: "Grad School Recommendation",
          dateRequested: "2022-01-02T12:00",
          dateNeeded: "2022-05-01T12:00",
          done: false,
        });
      axiosMock.onPut("/api/recommendationrequest").reply(200, {
        id: "17",
        requesterEmail: "student2@ucsb.edu",
        professorEmail: "professor2@ucsb.edu",
        explanation: "PhD Program Recommendation",
        dateRequested: "2022-02-03T12:00",
        dateNeeded: "2022-06-01T12:00",
        done: true,
      });
    });

    afterEach(() => {
      mockToast.mockClear();
      mockNavigate.mockClear();
      axiosMock.restore();
      axiosMock.resetHistory();
    });

    const queryClient = new QueryClient();

    test("Is populated with the data provided", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail"
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail"
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation"
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested"
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded"
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit"
      );

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toBeInTheDocument();
      expect(requesterEmailField).toHaveValue("student@ucsb.edu");
      expect(professorEmailField).toBeInTheDocument();
      expect(professorEmailField).toHaveValue("professor@ucsb.edu");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("Grad School Recommendation");
      expect(dateRequestedField).toBeInTheDocument();
      expect(dateRequestedField).toHaveValue("2022-01-02T12:00");
      expect(dateNeededField).toBeInTheDocument();
      expect(dateNeededField).toHaveValue("2022-05-01T12:00");
      expect(doneField).not.toBeChecked();

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(requesterEmailField, {
        target: { value: "student2@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "professor2@ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "PhD Program Recommendation" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2022-02-03T12:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2022-06-01T12:00" },
      });
      fireEvent.click(doneField);
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17 requesterEmail: student2@ucsb.edu"
      );

      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "student2@ucsb.edu",
          professorEmail: "professor2@ucsb.edu",
          explanation: "PhD Program Recommendation",
          dateRequested: "2022-02-03T12:00",
          dateNeeded: "2022-06-01T12:00",
          done: true,
        })
      );
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <RecommendationRequestEditPage />
          </MemoryRouter>
        </QueryClientProvider>
      );

      await screen.findByTestId("RecommendationRequestForm-id");

      const idField = screen.getByTestId("RecommendationRequestForm-id");
      const requesterEmailField = screen.getByTestId(
        "RecommendationRequestForm-requesterEmail"
      );
      const professorEmailField = screen.getByTestId(
        "RecommendationRequestForm-professorEmail"
      );
      const explanationField = screen.getByTestId(
        "RecommendationRequestForm-explanation"
      );
      const dateRequestedField = screen.getByTestId(
        "RecommendationRequestForm-dateRequested"
      );
      const dateNeededField = screen.getByTestId(
        "RecommendationRequestForm-dateNeeded"
      );
      const doneField = screen.getByTestId("RecommendationRequestForm-done");
      const submitButton = screen.getByTestId(
        "RecommendationRequestForm-submit"
      );

      expect(idField).toHaveValue("17");
      expect(requesterEmailField).toHaveValue("student@ucsb.edu");
      expect(professorEmailField).toHaveValue("professor@ucsb.edu");
      expect(explanationField).toHaveValue("Grad School Recommendation");
      expect(dateRequestedField).toHaveValue("2022-01-02T12:00");
      expect(dateNeededField).toHaveValue("2022-05-01T12:00");
      expect(doneField).not.toBeChecked();
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(requesterEmailField, {
        target: { value: "student2@ucsb.edu" },
      });
      fireEvent.change(professorEmailField, {
        target: { value: "professor2@ucsb.edu" },
      });
      fireEvent.change(explanationField, {
        target: { value: "PhD Program Recommendation" },
      });
      fireEvent.change(dateRequestedField, {
        target: { value: "2022-02-03T12:00" },
      });
      fireEvent.change(dateNeededField, {
        target: { value: "2022-06-01T12:00" },
      });
      fireEvent.click(doneField);

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "RecommendationRequest Updated - id: 17 requesterEmail: student2@ucsb.edu"
      );
      expect(mockNavigate).toBeCalledWith({ to: "/recommendationrequest" });

      expect(axiosMock.history.put.length).toBe(1);
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          requesterEmail: "student2@ucsb.edu",
          professorEmail: "professor2@ucsb.edu",
          explanation: "PhD Program Recommendation",
          dateRequested: "2022-02-03T12:00",
          dateNeeded: "2022-06-01T12:00",
          done: true,
        })
      );
    });
  });
});