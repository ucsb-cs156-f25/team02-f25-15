import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";
import UCSBOrganizationCreatePage from "main/pages/UCSBOrganization/UCSBOrganizationCreatePage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationCreatePage",
  component: UCSBOrganizationCreatePage,
};

const Template = () => <UCSBOrganizationCreatePage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 }),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
    ),
    http.post("/api/ucsborganizations/post", () =>
      HttpResponse.json({ id: 1, orgCode: "ABC" }, { status: 200 }),
    ),
  ],
};
