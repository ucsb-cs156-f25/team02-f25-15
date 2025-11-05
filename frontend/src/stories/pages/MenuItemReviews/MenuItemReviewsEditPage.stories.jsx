import React from "react";
import { apiCurrentUserFixtures } from "fixtures/currentUserFixtures";
import { systemInfoFixtures } from "fixtures/systemInfoFixtures";
import { http, HttpResponse } from "msw";

import MenuItemReviewsEditPage from "main/pages/MenuItemReviews/MenuItemReviewsEditPage";
import { menuItemReviewFixtures } from "fixtures/menuItemReviewFixtures";

export default {
  title: "pages/MenuItemReviews/MenuItemReviewsEditPage",
  component: MenuItemReviewsEditPage,
};

const Template = () => <MenuItemReviewsEditPage storybook={true} />;

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
    http.get("/api/menuitemreviews", () => {
      return HttpResponse.json(menuItemReviewFixtures.threeMenuItemReviews[0], {
        status: 200,
      });
    }),
    http.put("/api/menuitemreviews", () => {
      return HttpResponse.json(
        {
          id: "17",
          itemId: "4",
          reviewerEmail: "me@ucsb.edu",
          stars: "2",
          dateReviewed: "2025-11-05T12:29",
          comments: "disgusting food!",
        },
        { status: 200 }
      );
    }),
  ],
};
