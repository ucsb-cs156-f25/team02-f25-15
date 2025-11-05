import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { ucsbDiningCommonsMenuItemsFixtures } from "fixtures/ucsbDiningCommonsMenuItemFixtures";
import { http, HttpResponse } from "msw";

import UCSBDiningCommonsMenuItemEditPage from "main/pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage";

export default {
  title: "pages/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemEditPage",
  component: UCSBDiningCommonsMenuItemEditPage,
};

const Template = () => <UCSBDiningCommonsMenuItemEditPage storybook={true} />;

export const Default = Template.bind({});
Default.parameters = {
  msw: [
    http.get("/api/currentUser", () => {
      return HttpResponse.json(apiCurrentUserFixtures.userOnly, {
        status: 200,
      });
    }),
    http.get("/api/systemInfo", () => {
      return HttpResponse.json(systemInfoFixtures.showingNeither, {
        status: 200,
      });
    }),
    http.get("/api/UCSBDiningCommonsMenuItem", () => {
<<<<<<< HEAD
      return HttpResponse.json(ucsbDiningCommonsMenuItemsFixtures.threeMenuItems[0], {
        status: 200,
      });
=======
      return HttpResponse.json(
        ucsbDiningCommonsMenuItemsFixtures.threeMenuItems[0],
        {
          status: 200,
        },
      );
>>>>>>> origin/jl-menuitemreview-table
    }),
    http.put("/api/UCSBDiningCommonsMenuItem", () => {
      return HttpResponse.json({}, { status: 200 });
    }),
  ],
};
