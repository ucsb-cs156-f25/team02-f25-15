<<<<<<< HEAD
import BasicLayout from "main/layouts/BasicLayout/BasicLayout";

export default function HelpRequestIndexPage() {
  // Stryker disable all : placeholder for future implementation
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Index page not yet implemented</h1>
        <p>
          <a href="/helprequests/create">Create</a>
        </p>
        <p>
          <a href="/helprequests/edit/1">Edit</a>
        </p>
=======
import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import HelpRequestTable from "main/components/HelpRequest/HelpRequestTable";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";
import { Button } from "react-bootstrap";

export default function RestaurantIndexPage() {
  const currentUser = useCurrentUser();

  const {
    data: helprequests,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/helprequests/all"],
    { method: "GET", url: "/api/helprequests/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/helprequests/create"
          style={{ float: "right" }}
        >
          Create Help Request
        </Button>
      );
    }
  };

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>Help Requests</h1>
        <HelpRequestTable helprequests={helprequests} currentUser={currentUser} />
>>>>>>> origin/jl-menuitemreview-table
      </div>
    </BasicLayout>
  );
}
