import { Button, Form, Row, Col } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";

function UCSBOrganizationForm({
    initialContents,
    submitAction,
    buttonLabel = "Create",
}) {
    // Stryker disable all
    const {
        register,
        formState: { errors },
        handleSubmit,
    } = useForm({ defaultValues: initialContents || {} });
    // Stryker restore all

    const navigate = useNavigate();

    // Stryker disable Regex
    //all caps 2-10
    const orgCodeRegex = /^[A-Z0-9]{2,10}$/;
    // Stryker restore Regex

    return (
        <Form onSubmit={handleSubmit(submitAction)}>
        <Row>
            {initialContents && (
            <Col>
                <Form.Group className="mb-3">
                <Form.Label htmlFor="id">Id</Form.Label>
                <Form.Control
                    data-testid="UCSBOrganizationForm-id"
                    id="id"
                    type="text"
                    {...register("id")}
                    value={initialContents.id}
                    disabled
                />
                </Form.Group>
            </Col>
            )}
            <Col>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="orgCode">Code</Form.Label>
                <Form.Control
                data-testid="UCSBOrganizationForm-orgCode"
                id="orgCode"
                type="text"
                placeholder="e.g., SKY"
                isInvalid={Boolean(errors.orgCode)}
                {...register("orgCode", {
                    required: true,
                    pattern: orgCodeRegex,
                })}
                />
                <Form.Control.Feedback type="invalid">
                {errors.orgCode && "Code is required. "}
                {errors.orgCode?.type === "pattern" &&
                    "Code must be 2–10 uppercase letters/numbers (e.g.,SKY, ZPR)."}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>

            <Col>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="orgTranslationShort">Short Name</Form.Label>
                <Form.Control
                data-testid="UCSBOrganizationForm-orgTranslationShort"
                id="orgTranslationShort"
                type="text"
                placeholder="e.g., SKYDIVING CLUB"
                isInvalid={Boolean(errors.orgTranslationShort)}
                {...register("orgTranslationShort", {
                    required: true,
                })}
                />
                <Form.Control.Feedback type="invalid">
                {errors.orgTranslationShort && "Short name is required. "}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>

            <Col>
            <Form.Group className="mb-3">
                <Form.Label htmlFor="orgTranslation">Full Name</Form.Label>
                <Form.Control
                data-testid="UCSBOrganizationForm-orgTranslation"
                id="orgTranslation"
                type="text"
                placeholder="e.g., SKYDIVING CLUB AT UCSB"
                isInvalid={Boolean(errors.orgTranslation)}
                {...register("orgTranslation", {
                    required: true,
                })}
                />
                <Form.Control.Feedback type="invalid">
                {errors.orgTranslation && "Full name is required. "}
                </Form.Control.Feedback>
            </Form.Group>
            </Col>
        </Row>

        <Row>
            <Col>
            <Form.Group className="mb-3">
                <Form.Check
                type="checkbox"
                id="inactive"
                label="Inactive"
                data-testid="UCSBOrganizationForm-inactive"
                {...register("inactive")}
                />
            </Form.Group>
            </Col>
        </Row>

        <Row>
            <Col>
            <Button type="submit" data-testid="UCSBOrganizationForm-submit">
                {buttonLabel}
            </Button>{" "}
            <Button
                variant="secondary"
                onClick={() => navigate(-1)}
                data-testid="UCSBOrganizationForm-cancel"
            >
                Cancel
            </Button>
            </Col>
        </Row>
        </Form>
    );
}

export default UCSBOrganizationForm;
