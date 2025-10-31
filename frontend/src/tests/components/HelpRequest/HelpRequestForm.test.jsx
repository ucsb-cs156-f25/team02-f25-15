import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { BrowserRouter as Router } from "react-router";

import HelpRequestForm from "main/components/HelpRequest/HelpRequestForm";
import { helpRequestFixtures } from "fixtures/helpRequestFixtures";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const originalModule = await vi.importActual("react-router");
  return {
    ...originalModule,
    useNavigate: () => mockedNavigate,
  };
});

describe("HelpRequestForm tests", () => {
  const queryClient = new QueryClient();

  const expectedHeaders = [
    "Requester Email",
    "Team Id",
    "Table Or Breakout Room",
    "Request Time (iso format)",
    "Explanation",
    "Solved",
  ];
  const testId = "HelpRequestForm";

  test("renders correctly with no initialContents", async () => {
    render(
      <QueryClientProvider client={queryClient}>
        <Router>
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
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
          <HelpRequestForm
            initialContents={helpRequestFixtures.oneHelpRequest}
          />
        </Router>
      </QueryClientProvider>,
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
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
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
          <HelpRequestForm />
        </Router>
      </QueryClientProvider>,
    );

    expect(await screen.findByText(/Create/)).toBeInTheDocument();
    const submitButton = screen.getByText(/Create/);
    fireEvent.click(submitButton);

    await screen.findByText(/requesterEmail is required/);
    expect(screen.getByText(/teamId is required/)).toBeInTheDocument();
    expect(
      screen.getByText(/tableOrBreakoutRoom is required/),
    ).toBeInTheDocument();
    expect(screen.getByText(/requestTime is required/)).toBeInTheDocument();
    expect(screen.getByText(/explanation is required/)).toBeInTheDocument();
    expect(screen.getByText(/solved is required/)).toBeInTheDocument();

    const requesterEmailInput = screen.getByTestId(`${testId}-requesterEmail`);
    fireEvent.change(requesterEmailInput, {
      target: { value: "a".repeat(31) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Max length 30 characters/)).toBeInTheDocument();
    });

    const tableOrBreakoutRoomInput = screen.getByTestId(
      `${testId}-tableOrBreakoutRoom`,
    );

    fireEvent.change(tableOrBreakoutRoomInput, {
      target: { value: "a".repeat(31) },
    });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getAllByText(/Max length 30 characters/).length).toBe(2);
    });
  });
});
