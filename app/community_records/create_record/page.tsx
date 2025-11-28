"use client";

import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { VALIDATION_SCHEMA } from "@/lib/validation/complaint_record_schema";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { AuthenticatedSubmission } from "@/lib/types/account";
import { ComplaintRecord } from "@/lib/types/community_tracker";
import { auth } from "@/lib/client/firebaseConfig";
import { useState } from "react";

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

// Convert date to value compatible with date input (local time)
function toDateOnly(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function CreateRecordPage() {
  const router = useRouter();
  const today = toDateOnly(new Date());

  // Check if logged in
  const [authReady, setAuthReady] = useState(false);

  // Wait until auth is ready
  if (!authReady) {
    auth.authStateReady().then(() => {
      setAuthReady(true);
    });

    return null;
  }

  if (!auth.currentUser) {
    router.push("/login?redirect=/community_records/create_record");
  }

  return (
    <div className="py-10 flex justify-center">
      <div className="bg-white rounded-xl shadow-lg p-8 flex flex-col items-center justify-center w-[600px]">
        <Formik
          initialValues={{
            when: today,
            jurisdiction: null,
            category: "",
            details: "",
            status: "",
            updates: [],
            resolution: {
              date: "",
              details: "",
              satisfaction: 3,
            },
          }}
          validationSchema={VALIDATION_SCHEMA}
          onSubmit={async (values, { resetForm }) => {
            try {
              const body: AuthenticatedSubmission<ComplaintRecord> = {
                idToken: await auth.currentUser.getIdToken(),
                data: values,
              };

              const res = await fetch("/api/create_complaint_record", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(body),
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
                    value={values.when}
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
                              value={update.date}
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
                <div className="mb-6">
                  <label className="block font-medium mb-1">Resolution Date</label>
                  <Field
                    name={`resolution.date`}
                    type="date"
                    className="w-fit px-3 py-2 border border-gray-300 rounded"
                    max={today}
                  />
                  <ErrorMessage
                    name="resolution.date"
                    component="div"
                    className="text-red-500 text-xs"
                  />
                </div>

                <div className="mb-6">
                  <label className="block font-medium mb-1">Resolution Details</label>
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
                </div>
                
                <label className="block font-medium mb-2">Satisfaction</label>
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
