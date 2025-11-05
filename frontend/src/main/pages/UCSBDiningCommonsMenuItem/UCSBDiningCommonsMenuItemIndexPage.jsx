import React from "react";
import { useBackend } from "main/utils/useBackend";

import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBDiningCommonsMenuItemTable from "main/components/UCSBDiningCommonsMenuItem/UCSBDiningCommonsMenuItemTable";
import { Button } from "react-bootstrap";
import { useCurrentUser, hasRole } from "main/utils/useCurrentUser";

export default function UCSBDiningCommonsMenuItemIndexPage() {
  const currentUser = useCurrentUser();

  const createButton = () => {
    if (hasRole(currentUser, "ROLE_ADMIN")) {
      return (
        <Button
          variant="primary"
          href="/UCSBDiningCommonsMenuItem/create"
          style={{ float: "right" }}
        >
          Create Menu Item
        </Button>
      );
    }
  };

  const {
    data: menuItems,
    error: _error,
    status: _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    ["/api/UCSBDiningCommonsMenuItem/all"],
    { method: "GET", url: "/api/UCSBDiningCommonsMenuItem/all" },
    [],
  );

  return (
    <BasicLayout>
      <div className="pt-2">
        {createButton()}
<<<<<<< HEAD
        <h1>Menu Items</h1>
        <UCSBDiningCommonsMenuItemTable menuItems={menuItems} currentUser={currentUser} />
=======
        <h1>UCSBDiningCommonsMenuItem</h1>
        <UCSBDiningCommonsMenuItemTable
          menuItems={menuItems}
          currentUser={currentUser}
        />
>>>>>>> origin/jl-menuitemreview-table
      </div>
    </BasicLayout>
  );
}
