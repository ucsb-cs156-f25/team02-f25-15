import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams, Navigate } from "react-router";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationEditPage({ storybook = false }) {
  const { orgCode: orgCodeParam, id: legacyIdParam } = useParams();
  const orgCode = orgCodeParam ?? legacyIdParam;
  if (!orgCode) {
    toast("Missing route param: orgCode (or id). Check your route path.");
    return <Navigate to="/ucsborganization" />;
  }
  // GET the record by orgCode
  const { data: ucsbOrganization } = useBackend(
    [`/api/ucsborganizations?orgCode=${orgCode}`],
    {
      method: "GET",
      url: "/api/ucsborganizations",
      params: { orgCode },
    },
  );

  // PUT update
  const objectToAxiosPutParams = (form) => ({
    url: "/api/ucsborganizations",
    method: "PUT",
    params: { orgCode },
    data: {
      orgTranslationShort: form.orgTranslationShort,
      orgTranslation: form.orgTranslation,
      inactive: form.inactive,
    },
  });
  const onSuccess = (updated) => {
    toast(`UCSBOrganization Updated - orgCode: ${updated?.orgCode ?? orgCode}`);
  };

  const mutation = useBackendMutation(objectToAxiosPutParams, { onSuccess }, [
    `/api/ucsborganizations?orgCode=${orgCode}`,
  ]);

  const onSubmit = (data) => mutation.mutate(data);

  if (mutation.isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit UCSBOrganization</h1>
        {ucsbOrganization && (
          <UCSBOrganizationForm
            initialContents={ucsbOrganization}
            submitAction={onSubmit}
            buttonLabel="Update"
          />
        )}
      </div>
    </BasicLayout>
  );
}
