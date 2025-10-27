import { Formik, Form, Field } from "formik";

export default function FeedbackForm({ hide }) {
  return (
    <Formik
      initialValues={{ accountability: "", tool: "", followup: "" }}
      onSubmit={async (values, { resetForm }) => {
        try {
          const res = await fetch(`/api/submit_feedback`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values),
          });

          // Submission error
          if (!res.ok) {
            alert("Submission failed. Please try again later.");
            return;
          }

          // Submission success
          resetForm();
          hide();
          alert("Thank you for your feedback!");
        } catch (error) {
          alert("Submission failed. Please try again later.");
        }
      }}
    >
      {({ isSubmitting }) => (
        <div className="w-[600px]">
          <Form>
            <h2 className="text-2xl font-bold mb-2 text-center">Thank you for your contribution!</h2>
            <p className="mb-6 text-center text-gray-700">
              If you have the time, we welcome your feedback.
            </p>
            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="accountability">
                What are your thoughts about law enforcement accountability? What do you see as barriers?
              </label>
              <Field
                as="textarea"
                name="accountability"
                className="w-full border rounded px-3 py-2 resize-none"
                rows={4}
              />
            </div>
            <div className="mb-4">
              <label className="block font-medium mb-1" htmlFor="tool">
                What are your thoughts on this tool?
              </label>
              <Field
                as="textarea"
                name="tool"
                className="w-full border rounded px-3 py-2 resize-none"
                rows={4}
              />
            </div>
            <div className="mb-6">
              <label className="block font-medium mb-1" htmlFor="followup">
                Would you be open to a short follow-up interview? If so, please share your contact details (phone or email) where we can reach you.
              </label>
              <Field
                as="textarea"
                name="followup"
                className="w-full border rounded px-3 py-2 resize-none"
                rows={2}
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer"
              disabled={isSubmitting}
            >
              Submit Feedback
            </button>
          </Form>
        </div>
      )}
    </Formik>
  );
}
