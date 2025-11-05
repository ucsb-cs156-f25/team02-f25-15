import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationTable from "main/components/UCSBOrganization/UCSBOrganizationTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";

export default function UCSBOrganizationIndexPage() {
  const currentUser = useCurrentUser();

  const { data: organizations } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/ucsborganizations/all"],
    // Stryker disable next-line all : HTTP method and URL are tested elsewhere
    { method: "GET", url: "/api/ucsborganizations/all" },
    // Stryker disable next-line all : don't test default value of empty list
    [],
  );

  const rows = Array.isArray(organizations)
    ? organizations
    : Array.isArray(organizations?.content)
    ? organizations.content
    : [];

  const createButton = () =>
    hasRole(currentUser, "ROLE_ADMIN") ? (
      <Button
        variant="primary"
        href="/ucsborganization/create"
        style={{ float: "right" }}
      >
        Create UCSBOrganization
      </Button>
    ) : null;
  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
        <h1>UCSBOrganization</h1>
        <UCSBOrganizationTable organizations={rows} currentUser={currentUser} />
      </div>
    </BasicLayout>
  );
}
