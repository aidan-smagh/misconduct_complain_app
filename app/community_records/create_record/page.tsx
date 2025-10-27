"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { VALIDATION_SCHEMA } from "@/lib/validation/record_schema";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";

const JurisdictionSelector = dynamic(
  () => import("@/app/editor/[jurisdiction_id]/_components/JurisdictionSelector"),
  { ssr: false }
);

const CATEGORY_OPTIONS = [
  "Use of Force",
  "Discrimination",
  "Harassment",
  "Negligence",
  "Corruption",
  "Other",
];

const STATUS_OPTIONS = [
  "Filed",
  "Under Review",
  "Resolved",
  "Dismissed",
  "Withdrawn",
];

export default function CreateRecordPage() {
  const router = useRouter();
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="py-10 flex justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center w-[600px]">
        <Formik
          initialValues={{
            when: today,
            jurisdiction: "",
            category: "",
            details: "",
            status: "",
            updates: [],
            resolution: {
              date: today,
              details: "",
              satisfaction: 3,
            },
          }}
          validationSchema={VALIDATION_SCHEMA}
          onSubmit={async (values, { resetForm }) => {
            try {
              const res = await fetch("/api/create_record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(values),
              });

              if (!res.ok) {
                alert("Submission failed. Please try again later.");
                return;
              }

              resetForm();
            } catch {
              alert("Submission failed. Please try again later.");
            }
          }}
        >
          {({ values, isSubmitting, setFieldValue }) => (
            <Form className="w-full">
              <h2 className="text-2xl font-bold mb-2 text-center">
                File a Complaint Record
              </h2>
              <p className="mb-8 text-center text-gray-700">
                Please fill out the information to the best of your knowledge.
              </p>

              {/* Filing Section */}
              <div className="mb-8">
                <div className="text-xl font-bold mb-4 text-gray-800">
                  Filing Information
                </div>
                <div className="mb-6">
                  <label className="block font-medium mb-1">When</label>
                  <Field
                    name="when"
                    type="date"
                    className="px-3 py-2 border border-gray-300 rounded"
                    value={values.when || today}
                    max={today}
                  />
                  <ErrorMessage
                    name="when"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                <div className="mb-6">
                  <label className="block font-medium mb-1">Jurisdiction</label>
                  <Field name="jurisdiction">
                    {({ field }) => (
                      <JurisdictionSelector
                        value={field.value}
                        onChange={(option) => {
                          setFieldValue("jurisdiction", option);
                        }}
                        onBlur={field.onBlur}
                      />
                    )}
                  </Field>
                  <ErrorMessage
                    name="jurisdiction"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Category selector */}
                <div className="mb-6">
                  <label className="block font-medium mb-1">Category</label>
                  <Field
                    as="select"
                    name="category"
                    className="w-full px-3 pr-8 py-2 border border-gray-300 rounded"
                  >
                    <option value="" disabled hidden></option>
                    {CATEGORY_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="category"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                {/* Status selector */}
                <div className="mb-6">
                  <label className="block font-medium mb-1">Status</label>
                  <Field
                    as="select"
                    name="status"
                    className="w-full px-3 pr-8 py-2 border border-gray-300 rounded"
                  >
                    <option value="" disabled hidden></option>
                    {STATUS_OPTIONS.map((opt) => (
                      <option key={opt} value={opt}>
                        {opt}
                      </option>
                    ))}
                  </Field>
                  <ErrorMessage
                    name="status"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>
              </div>

              <div className="mb-6">
                <label className="block font-medium mb-1">
                  Provide details{" "}
                  <span className="text-gray-500">(will not be shared)</span>
                </label>
                <Field
                  as="textarea"
                  name="details"
                  className="w-full border rounded px-3 py-2 resize-none"
                  rows={3}
                />
                <ErrorMessage
                  name="details"
                  component="div"
                  className="text-red-500 text-xs"
                />
              </div>

              {/* Updates Section */}
              <div className="mb-8">
                <div className="text-xl font-bold mb-4 text-gray-800">Updates</div>
                <FieldArray name="updates">
                  {({ push, remove }) => (
                    <div>
                      {values.updates.map((update, idx) => (
                        <div key={idx} className="mb-4">
                          <div className="flex gap-2 mb-2 items-start">
                            <Field
                              name={`updates[${idx}].date`}
                              type="date"
                              className="px-3 py-2 border border-gray-300 rounded"
                              value={update.date || today}
                              max={today}
                            />
                            <div className="flex flex-col grow">
                              <Field
                                name={`updates[${idx}].title`}
                                type="text"
                                className="w-full px-3 py-[9px] border border-gray-300 rounded"
                                placeholder="Title"
                              />
                              <ErrorMessage
                                name={`updates[${idx}].title`}
                                component="div"
                                className="text-red-500 text-xs"
                              />
                            </div>
                            <button
                              type="button"
                              className="px-2 py-2 h-11 bg-red-500 text-white rounded min-h-full"
                              onClick={() => remove(idx)}
                            >
                              Remove
                            </button>
                          </div>
                          <Field
                            as="textarea"
                            name={`updates[${idx}].details`}
                            className="w-full border rounded px-3 py-2 resize-y"
                            rows={2}
                            placeholder="Details"
                          />
                          <ErrorMessage
                            name={`updates[${idx}].details`}
                            component="div"
                            className="text-red-500 text-xs"
                          />
                        </div>
                      ))}
                      <button
                        type="button"
                        className="mt-2 px-4 py-2 bg-blue-600 text-white rounded"
                        onClick={() =>
                          push({ date: today, title: "", details: "" })
                        }
                      >
                        {values.updates.length === 0
                          ? "Add update"
                          : "Add another update"}
                      </button>
                    </div>
                  )}
                </FieldArray>
              </div>

              {/* Resolution Section */}
              <div className="mb-8 flex flex-col">
                <div className="text-xl font-bold mb-4 text-gray-800">
                  Resolution
                </div>
                <label className="block font-medium mb-1">Resolution Date</label>
                <Field
                  name={`resolution.date`}
                  type="date"
                  className="w-fit px-3 py-2 mb-4 border border-gray-300 rounded"
                  max={today}
                />
                <Field
                  as="textarea"
                  name="resolution.details"
                  className="w-full border rounded px-3 py-2 resize-y"
                  rows={4}
                  placeholder="Details"
                />
                <ErrorMessage
                  name="resolution.details"
                  component="div"
                  className="text-red-500 text-xs"
                />
                <label className="block font-medium mt-4 mb-2">Satisfaction</label>
                <div className="flex flex-col mb-2">
                  <div className="relative flex items-center justify-between w-48 mb-1">
                    <span className="text-xs text-gray-500">Least</span>
                    <span className="text-xs text-gray-500">Most</span>
                  </div>

                  <div className="relative w-48">
                    <Field
                      name="resolution.satisfaction"
                      type="range"
                      min="1"
                      max="5"
                      step="1"
                      className="w-48"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      {[1, 2, 3, 4, 5].map((num) => (
                        <span key={num}>{num}</span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700 transition cursor-pointer"
                disabled={isSubmitting}
              >
                Submit Record
              </button>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
}
