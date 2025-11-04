import { fireEvent, render, waitFor, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router";
import ArticleEditPage from "main/pages/Articles/ArticleEditPage";

import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import axios from "axios";
import AxiosMockAdapter from "axios-mock-adapter";
import mockConsole from "tests/testutils/mockConsole";

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
describe("ArticleEditPage tests", () => {
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
      axiosMock.onGet(`/api/articles?id=17`).timeout();
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
            <ArticleEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );
      await screen.findByText("Edit Article");
      expect(screen.queryByTestId("Article-title")).not.toBeInTheDocument();
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
      axiosMock.onGet("/api/articles", { params: { id: 17 } }).reply(200, {
        id: 17,
        title: "Freebirds",
        url: "https://freebirds.com",
        email: "info@freebirds.com",
        explanation: "Burritos",
        localDateTime: "2022-01-02T12:00"
      });
      axiosMock.onPut("/api/articles").reply(200, {
        id: 17,
        title: "Freebirds World Burrito",
        url: "https://freebirds.com",
        email: "info@freebirds.com",
        explanation: "Totally Giant Burritos",
        localDateTime: "2022-01-02T12:00"
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
            <ArticleEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");

      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByLabelText("URL");
      const emailField = screen.getByLabelText("Email");
      const explanationField = screen.getByLabelText("Explanation")
      const localDateTimeField = screen.getByLabelText("Date (iso format)");
      const submitButton = screen.getByTestId("ArticleForm-submit");

      expect(idField).toBeInTheDocument();
      expect(idField).toHaveValue("17");
      expect(titleField).toBeInTheDocument();
      expect(titleField).toHaveValue("Freebirds");
      expect(urlField).toBeInTheDocument();
      expect(urlField).toHaveValue("https://freebirds.com");
      expect(emailField).toBeInTheDocument();
      expect(emailField).toHaveValue("info@freebirds.com");
      expect(explanationField).toBeInTheDocument();
      expect(explanationField).toHaveValue("Burritos");
      expect(localDateTimeField).toBeInTheDocument();
      expect(localDateTimeField).toHaveValue("2022-01-02T12:00");
      

      expect(submitButton).toHaveTextContent("Update");

      fireEvent.change(titleField, {
        target: { value: "Freebirds World Burrito" },
      });
      fireEvent.change(explanationField, {
        target: { value: "Totally Giant Burritos" },
      });
      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Freebirds World Burrito",
      );

      expect(mockNavigate).toBeCalledWith({ to: "/articles" });

      expect(axiosMock.history.put.length).toBe(1); // times called
      expect(axiosMock.history.put[0].params).toEqual({ id: 17 });
      expect(axiosMock.history.put[0].data).toBe(
        JSON.stringify({
          title: "Freebirds World Burrito",
          url: "https://freebirds.com",
          email: "info@freebirds.com",
          explanation: "Totally Giant Burritos",
          localDateTime: "2022-01-02T12:00"
        }),
      ); // posted object
    });

    test("Changes when you click Update", async () => {
      render(
        <QueryClientProvider client={queryClient}>
          <MemoryRouter>
            <ArticleEditPage />
          </MemoryRouter>
        </QueryClientProvider>,
      );

      await screen.findByTestId("ArticleForm-id");

      const idField = screen.getByTestId("ArticleForm-id");
      const titleField = screen.getByTestId("ArticleForm-title");
      const urlField = screen.getByLabelText("URL");
      const emailField = screen.getByLabelText("Email");
      const explanationField = screen.getByLabelText("Explanation")
      const localDateTimeField = screen.getByLabelText("Date (iso format)");
      const submitButton = screen.getByTestId("ArticleForm-submit");
    
      expect(idField).toHaveValue("17");
      expect(titleField).toHaveValue("Freebirds");
      expect(urlField).toHaveValue("https://freebirds.com");
      expect(emailField).toHaveValue("info@freebirds.com");
      expect(explanationField).toHaveValue("Burritos");
      expect(localDateTimeField).toHaveValue("2022-01-02T12:00");
      expect(submitButton).toBeInTheDocument();

      fireEvent.change(titleField, {
        target: { value: "Freebirds World Burrito" },
      });
      fireEvent.change(explanationField, { target: { value: "Big Burritos" } });

      fireEvent.click(submitButton);

      await waitFor(() => expect(mockToast).toBeCalled());
      expect(mockToast).toBeCalledWith(
        "Article Updated - id: 17 title: Freebirds World Burrito",
      );
      expect(mockNavigate).toBeCalledWith({ to: "/articles" });
    });
  });
});
