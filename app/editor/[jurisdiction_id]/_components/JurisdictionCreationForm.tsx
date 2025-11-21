import { VALIDATION_SCHEMA } from "@/lib/validation/jurisdiction_creator_schema";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { useRouter } from "next/navigation";

export default function JurisdicionCreationForm({ hide }) {
  const router = useRouter();

  return (
    <Formik
      initialValues={{ name: "" }}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={async (values, { resetForm }) => {
        try {
          const res = await fetch(`/api/create_jurisdiction`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify(values.name),
          });

          // Submission error
          if (!res.ok) {
            alert("Submission failed. Please try again later.");
            return;
          }

          // Submission success
          resetForm();
          hide();

          let newId = await res.json();
          router.push(`/editor/${newId}`)
        } catch (error) {
          alert("Submission failed. Please try again later.");
        }
      }}
    >
      {({ isSubmitting }) => (
        <div className="w-[450px]">
          <Form>
            <h2 className="text-2xl font-bold mb-2 text-center">Add New Jurisdiction</h2>
            <p className="mb-6 text-center text-gray-700">
              Use this form if your jurisdiction is not listed (i.e. a regional police department)
            </p>
            <div className="mb-6">
              <Field
                name="name"
                type="text"
                placeholder="Name"
                className="w-full px-3 py-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name={"name"}
                component="div"
                className="text-red-500 text-xs form-error-message"
              />
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition cursor-pointer"
              disabled={isSubmitting}
            >
              Create
            </button>
          </Form>
        </div>
      )}
    </Formik>
  );
}
