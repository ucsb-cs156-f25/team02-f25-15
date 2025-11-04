import BasicLayout from "main/layouts/BasicLayout/BasicLayout";
import { useParams } from "react-router";
import ArticleForm from "main/components/Articles/ArticleForm";
import { Navigate } from "react-router";
import { useBackend, useBackendMutation } from "main/utils/useBackend";
import { toast } from "react-toastify";

export default function ArticleEditPage({ storybook = false }) {
  let { id } = useParams();

  const {
    data: article,
    _error,
    _status,
  } = useBackend(
    // Stryker disable next-line all : don't test internal caching of React Query
    [`/api/articles?id=${id}`],
    {
      // Stryker disable next-line all : GET is the default, so mutating this to "" doesn't introduce a bug

      method: "GET",
      url: `/api/articles`,
      params: { id },
    },
  );

  // ✅ FIXED: use the correct article fields, including localDateTime
  const objectToAxiosPutParams = (article) => ({
    url: "/api/articles",
    method: "PUT",
    params: { id: article.id },
    data: {
      title: article.title,
      url: article.url,
      email: article.email,
      explanation: article.explanation,
      localDateTime: article.localDateTime,
    },
  });

  // ✅ FIXED: toast message now references title (not name)
  const onSuccess = (article) => {
    toast(`Article Updated - id: ${article.id} title: ${article.title}`);
  };

  const mutation = useBackendMutation(
    objectToAxiosPutParams,
    { onSuccess },
            // Stryker disable next-line all : hard to set up test for caching
    [`/api/articles?id=${id}`],
  );

  const { isSuccess } = mutation;

  const onSubmit = async (data) => {
    mutation.mutate(data);
  };

  if (isSuccess && !storybook) {
    return <Navigate to="/articles" />;
  }

  return (
    <BasicLayout>
      <div className="pt-2">
        <h1>Edit Article</h1>
        {article && (
          <ArticleForm
            submitAction={onSubmit}
            buttonLabel={"Update"}
            initialContents={article}
          />
        )}
      </div>
    </BasicLayout>
  );
}
