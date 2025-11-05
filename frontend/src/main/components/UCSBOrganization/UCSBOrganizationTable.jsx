import React from "react";
import OurTable, { ButtonColumn } from "main/components/OurTable";
import { useBackendMutation } from "main/utils/useBackend";
import {
  cellToAxiosParamsDelete,
  onDeleteSuccess,
} from "main/utils/UCSBOrganizationUtils";
import { useNavigate } from "react-router";
import { hasRole } from "main/utils/useCurrentUser";

export default function UCSBOrganizationTable({ organizations, currentUser }) {
  const navigate = useNavigate();
  const editCallback = (cell) => {
    const orgCode = cell.row.original.orgCode;
    navigate(`/ucsborganization/edit/${orgCode}`);
  };
  const deleteMutation = useBackendMutation(
    cellToAxiosParamsDelete,
    { onSuccess: onDeleteSuccess },
    ["/api/ucsborganizations/all"],
  );

  const deleteCallback = (cell) => deleteMutation.mutate(cell);

  const columns = [
    { header: "Code", accessorKey: "orgCode" },
    { header: "Short Name", accessorKey: "orgTranslationShort" },
    { header: "Full Name", accessorKey: "orgTranslation" },
    { header: "Inactive?", accessorKey: "inactive" },
  ];

  if (hasRole(currentUser, "ROLE_ADMIN")) {
    columns.push(
      ButtonColumn("Edit", "primary", editCallback, "UCSBOrganizationTable"),
    );
    columns.push(
      ButtonColumn("Delete", "danger", deleteCallback, "UCSBOrganizationTable"),
    );
  }
  return (
    <OurTable
      data={organizations}
      columns={columns}
      testid={"UCSBOrganizationTable"}
    />
  );
}
