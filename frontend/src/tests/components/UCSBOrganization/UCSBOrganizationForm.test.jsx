import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { BrowserRouter as Router } from "react-router";
import { vi, expect, describe, test } from "vitest";

const mockedNavigate = vi.fn();
vi.mock("react-router", async () => {
  const original = await vi.importActual("react-router");
  return {
    ...original,
    useNavigate: () => mockedNavigate,
  };
});

describe("UCSBOrganizationForm", () => {
  const testId = "UCSBOrganizationForm";

  const renderCreate = (props = {}) =>
    render(
      <Router>
        <UCSBOrganizationForm submitAction={() => {}} {...props} />
      </Router>,
    );

  const renderUpdate = (props = {}) =>
    render(
      <Router>
        <UCSBOrganizationForm
          initialContents={{
            id: 7,
            orgCode: "ZPR",
            orgTranslationShort: "ZETA PHI RHO",
            orgTranslation: "ZETA PHI RHO",
            inactive: true,
          }}
          submitAction={() => {}}
          buttonLabel="Update"
          {...props}
        />
      </Router>,
    );

  //render: Create
  test("renders create form: orgCode visible, id hidden, button says Create", () => {
    renderCreate();
    expect(screen.queryByTestId(`${testId}-id`)).not.toBeInTheDocument();
    // fields present
    expect(screen.getByTestId(`${testId}-orgCode`)).toBeInTheDocument();
    expect(
      screen.getByTestId(`${testId}-orgTranslationShort`),
    ).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-inactive`)).toBeInTheDocument();
    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Create");
  });

  //render: Update
  test("renders update form: id read-only, fields prefilled, orgCode editable", () => {
    renderUpdate();
    expect(screen.getByTestId(`${testId}-id`)).toHaveValue("7");
    expect(screen.getByTestId(`${testId}-orgCode`)).toHaveValue("ZPR");
    expect(screen.getByTestId(`${testId}-orgTranslationShort`)).toHaveValue(
      "ZETA PHI RHO",
    );
    expect(screen.getByTestId(`${testId}-orgTranslation`)).toHaveValue(
      "ZETA PHI RHO",
    );
    expect(screen.getByTestId(`${testId}-inactive`)).toBeChecked();
    expect(screen.getByTestId(`${testId}-submit`)).toHaveTextContent("Update");
  });

  test("required validations prevent submit (create)", async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn();
    renderCreate({ submitAction });
    await user.click(screen.getByTestId(`${testId}-submit`));
    expect(submitAction).not.toHaveBeenCalled();
    expect(screen.getByText("Code is required.")).toBeInTheDocument();
    expect(screen.getByText("Short name is required.")).toBeInTheDocument();
    expect(screen.getByText("Full name is required.")).toBeInTheDocument();
    await user.type(screen.getByTestId(`${testId}-orgCode`), "AS");
    await user.type(
      screen.getByTestId(`${testId}-orgTranslationShort`),
      "Associated Students",
    );
    await user.type(
      screen.getByTestId(`${testId}-orgTranslation`),
      "Associated Students UCSB",
    );
    await user.click(screen.getByTestId(`${testId}-submit`));
    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
  });

  //Pattern validation on orgCode
  test("orgCode must match pattern (uppercase A–Z/0–9, 2–10 chars); shows pattern message on bad input", async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn();

    render(
      <Router>
        <UCSBOrganizationForm submitAction={submitAction} />
      </Router>,
    );
    await user.type(screen.getByTestId("UCSBOrganizationForm-orgCode"), "sky");
    await user.type(
      screen.getByTestId("UCSBOrganizationForm-orgTranslationShort"),
      "Skydiving Club",
    );
    await user.type(
      screen.getByTestId("UCSBOrganizationForm-orgTranslation"),
      "UCSB Skydiving Club",
    );
    await user.click(screen.getByTestId("UCSBOrganizationForm-submit"));
    const patternMsg =
      /Code must be 2(?:–|-)?10 uppercase letters\/numbers \(e\.g\.,?\s*SKY, ZPR\)\.?/i;
    expect(await screen.findByText(patternMsg)).toBeInTheDocument();
    expect(submitAction).not.toHaveBeenCalled();
    const orgCode = screen.getByTestId("UCSBOrganizationForm-orgCode");
    await user.clear(orgCode);
    await user.type(orgCode, "SKY");
    await user.click(screen.getByTestId("UCSBOrganizationForm-submit"));
    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
  });

  // submit action
  test("calls submitAction with correct payload on create", async () => {
    const user = userEvent.setup();
    const submitAction = vi.fn();

    renderCreate({ submitAction });

    await user.type(screen.getByTestId(`${testId}-orgCode`), "SKY");
    await user.type(
      screen.getByTestId(`${testId}-orgTranslationShort`),
      "Skydiving Club",
    );
    await user.type(
      screen.getByTestId(`${testId}-orgTranslation`),
      "UCSB Skydiving Club",
    );
    const inactive = screen.getByTestId(`${testId}-inactive`);
    await user.click(inactive);

    await user.click(screen.getByTestId(`${testId}-submit`));

    await waitFor(() => expect(submitAction).toHaveBeenCalledTimes(1));
    const [payload] = submitAction.mock.calls[0];
    expect(payload).toEqual({
      orgCode: "SKY",
      orgTranslationShort: "Skydiving Club",
      orgTranslation: "UCSB Skydiving Club",
      inactive: true,
    });
  });

  // cancel
  test("cancel button navigates back", async () => {
    const user = userEvent.setup();
    renderCreate();
    await user.click(screen.getByTestId(`${testId}-cancel`));
    expect(mockedNavigate).toHaveBeenCalledWith(-1);
  });
});
