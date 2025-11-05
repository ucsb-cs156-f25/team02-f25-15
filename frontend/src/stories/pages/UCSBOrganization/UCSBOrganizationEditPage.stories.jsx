// src/stories/pages/UCSBOrganization/UCSBOrganizationEditPage.stories.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router";
import { http, HttpResponse } from "msw";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import UCSBOrganizationEditPage from "main/pages/UCSBOrganization/UCSBOrganizationEditPage";

export default {
  title: "pages/UCSBOrganization/UCSBOrganizationEditPage",
  component: UCSBOrganizationEditPage,
};

const Template = ({ initialPath = "/ucsborganization/edit/ZBT" }) => (
  <Routes>
    <Route path="/" element={<Navigate to={initialPath} replace />} />
    <Route
      path="/ucsborganization/edit/:orgCode"
      element={<UCSBOrganizationEditPage storybook={true} />}
    />
    <Route
      path="/ucsborganization/edit-legacy/:id"
      element={<UCSBOrganizationEditPage storybook={true} />}
    />
  </Routes>
);

export const Default = Template.bind({});
Default.args = { initialPath: "/ucsborganization/edit/ZBT" };

Default.parameters = {
  msw: [
    http.get("/api/currentUser", () =>
      HttpResponse.json(apiCurrentUserFixtures.userOnly, { status: 200 }),
    ),
    http.get("/api/systemInfo", () =>
      HttpResponse.json(systemInfoFixtures.showingNeither, { status: 200 }),
    ),
    http.get("/api/ucsborganizations", ({ request }) => {
      const url = new URL(request.url);
      const code = url.searchParams.get("orgCode");
      if (code !== "ZBT") {
        return HttpResponse.json(
          { message: `Org ${code} not found` },
          { status: 404 },
        );
      }
      return HttpResponse.json(
        {
          orgCode: "ZBT",
          orgTranslationShort: "Zeta Beta Tau",
          orgTranslation: "Zeta Beta Tau Fraternity",
          inactive: false,
        },
        { status: 200 },
      );
    }),
    // PUT 
    http.put("/api/ucsborganizations", async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json(
        {
          orgCode: "ZBT",
          orgTranslationShort: body.orgTranslationShort ?? "ZBT (Updated)",
          orgTranslation: body.orgTranslation ?? "Zeta Beta Tau — Updated",
          inactive: body.inactive ?? true,
        },
        { status: 200 },
      );
    }),
  ],
};
