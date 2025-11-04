import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function RecommendationRequestForm({
  initialContents,
  submitAction,
  buttonLabel = "Create",
}) {
  const {
    register,
    formState: { errors },
    handleSubmit,
  } = useForm({ defaultValues: initialContents || {} });

  const navigate = useNavigate();

  // Stryker disable next-line all: Regex tested separately
  const isodate_regex = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

  // Stryker disable next-line all: Regex tested separately
  const email_regex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

  return (
    <Form onSubmit={handleSubmit(submitAction)}>
      <Row>
        {initialContents && (
          <Col>
            <Form.Group className="mb-3">
              <Form.Label htmlFor="id">Id</Form.Label>
              <Form.Control
                data-testid="RecommendationRequestForm-id"
                id="id"
                type="text"
                value={initialContents.id}
                disabled
              />
            </Form.Group>
          </Col>
        )}

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="requesterEmail">Requester Email</Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-requesterEmail"
              id="requesterEmail"
              type="email"
              isInvalid={Boolean(errors.requesterEmail)}
              {...register("requesterEmail", {
                required: "Requester Email is required",
                /* Stryker disable next-line all */
                pattern: {
                  /* Stryker disable next-line all */
                  value: email_regex,
                  /* Stryker disable next-line all */
                  message: 'Email should contain one "@" and one "."',
                },
                maxLength: {
                  value: 255,
                  message: "Max length 255 characters",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.requesterEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="professorEmail">Professor Email</Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-professorEmail"
              id="professorEmail"
              type="email"
              isInvalid={Boolean(errors.professorEmail)}
              {...register("professorEmail", {
                required: "Professor Email is required",
                /* Stryker disable next-line all */
                pattern: {
                  /* Stryker disable next-line all */
                  value: email_regex,
                  /* Stryker disable next-line all */
                  message: 'Email should contain one "@" and one "."',
                },
                maxLength: {
                  value: 255,
                  message: "Max length 255 characters",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.professorEmail?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="explanation">Explanation</Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-explanation"
              id="explanation"
              type="text"
              as="textarea"
              rows={3}
              isInvalid={Boolean(errors.explanation)}
              {...register("explanation", {
                required: "Explanation is required",
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.explanation?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateRequested">
              Date Requested (iso format)
            </Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-dateRequested"
              id="dateRequested"
              type="datetime-local"
              isInvalid={Boolean(errors.dateRequested)}
              {...register("dateRequested", {
                required: "Date Requested is required",
                /* Stryker disable next-line all */
                pattern: {
                  /* Stryker disable next-line all */
                  value: isodate_regex,
                  /* Stryker disable next-line all */
                  message: "Date must be in ISO format",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateRequested?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>

        <Col>
          <Form.Group className="mb-3">
            <Form.Label htmlFor="dateNeeded">
              Date Needed (iso format)
            </Form.Label>
            <Form.Control
              data-testid="RecommendationRequestForm-dateNeeded"
              id="dateNeeded"
              type="datetime-local"
              isInvalid={Boolean(errors.dateNeeded)}
              {...register("dateNeeded", {
                required: "Date Needed is required",
                /* Stryker disable next-line all */
                pattern: {
                  /* Stryker disable next-line all */
                  value: isodate_regex,
                  /* Stryker disable next-line all */
                  message: "Date must be in ISO format",
                },
              })}
            />
            <Form.Control.Feedback type="invalid">
              {errors.dateNeeded?.message}
            </Form.Control.Feedback>
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Form.Group className="mb-3">
            <Form.Check
              data-testid="RecommendationRequestForm-done"
              type="checkbox"
              id="done"
              label="Done"
              {...register("done")}
            />
          </Form.Group>
        </Col>
      </Row>

      <Row>
        <Col>
          <Button type="submit" data-testid="RecommendationRequestForm-submit">
            {buttonLabel}
          </Button>
          <Button
            variant="Secondary"
            onClick={() => navigate(-1)}
            data-testid="RecommendationRequestForm-cancel"
          >
            Cancel
          </Button>
        </Col>
      </Row>
    </Form>
  );
}

export default RecommendationRequestForm;