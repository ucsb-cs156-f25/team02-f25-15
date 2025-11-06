import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import UCSBOrganizationForm from "main/components/UCSBOrganization/UCSBOrganizationForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function UCSBOrganizationCreatePage({ storybook = false }) {
  const objectToAxiosParams = (ucsbOrg) => ({
    url: "/api/ucsborganizations/post",
    method: "POST",
    params: {
      orgCode: ucsbOrg.orgCode,
      orgTranslationShort: ucsbOrg.orgTranslationShort,
      orgTranslation: ucsbOrg.orgTranslation,
      inactive: ucsbOrg.inactive,
    },
  });
  const onSuccess = (created) => {
    toast(
      `New UCSBOrganization Created - id: ${created.id} orgCode: ${created.orgCode}`,
    );
  };
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : cache invalidation hard to test
    ["/api/ucsborganizations/all"],
  );
  const { isSuccess } = mutation;
  const onSubmit = (data) => {
    mutation.mutate(data);
  };
  if (isSuccess && !storybook) {
    return <Navigate to="/ucsborganization" />;
  }
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New UCSBOrganization</h1>
        <UCSBOrganizationForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
