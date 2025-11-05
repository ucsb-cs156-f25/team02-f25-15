import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import RecommendationRequestForm from "main/components/RecommendationRequest/RecommendationRequestForm";
import { Navigate } from "react-router";
import { useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function RecommendationRequestCreatePage({ storybook = false }) {
  // Convert form input into API request params
  const objectToAxiosParams = (recommendationRequest) => ({
    url: "/api/recommendationrequest/post", // ✅ update endpoint as needed
    method: "POST",
    params: {
      requesterEmail: recommendationRequest.requesterEmail,
      professorEmail: recommendationRequest.professorEmail,
      explanation: recommendationRequest.explanation,
      dateRequested: recommendationRequest.dateRequested,
      dateNeeded: recommendationRequest.dateNeeded,
      done: recommendationRequest.done,
    },
  });

  // Toast message on success
  const onSuccess = (recommendationRequest) => {
    toast(
      `New RecommendationRequest Created - id: ${recommendationRequest.id}`,
    );
  };

  // Backend mutation hook
  const mutation = useBackendMutation(
    objectToAxiosParams,
    { onSuccess },
    // Stryker disable next-line all : hard to set up test for caching
    ["/api/recommendationrequest/all"], // ✅ invalidate cache
  );

  const { isSuccess } = mutation;

  // Handle form submit
  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  // Redirect after success (if not in Storybook)
  if (isSuccess && !storybook) {
    return <Navigate to="/recommendationrequest" />;
  }

  // Render
  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Create New Recommendation Request</h1>
        <RecommendationRequestForm submitAction={onSubmit} />
      </div>
    </BasicLayout>
  );
}
