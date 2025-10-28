"use client";
import React, { useEffect, useState, Fragment, useRef } from "react";
import { useParams } from "next/navigation";
import { Formik, Form, Field, FieldArray, ErrorMessage } from "formik";
import { DragDropContext, Droppable, Draggable, DropResult } from "@hello-pangea/dnd";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import * as Yup from "yup";

import { VALIDATION_SCHEMA } from "@/lib/validation/jurisdiction_info_schema";

import JurisdictionSelector from "@/app/editor/[jurisdiction_id]/_components/JurisdictionSelector";
import LinkPreview from "@/app/editor/[jurisdiction_id]/_components/LinkPreview";
import FeedbackForm from "@/app/editor/[jurisdiction_id]/_components/FeedbackForm";
import Modal from "@/components/Modal";
import LinkVerificationButton from "@/app/editor/[jurisdiction_id]/_components/LinkVerificationButton";
import JurisdicionCreationForm from "./_components/JurisdictionCreationForm";
import { JurisdictionFilingInfo } from "@/lib/types/jurisdiction";
import { JurisidictionGisInfo } from "@/lib/types/jurisdiction";
import { isUrlValid } from "@/lib/validation/validation_rules";

const COMMON_METHODS_META = {
  "online form": {
    label: "Online Form",
    icon: "/icons/contact/online-form.svg",
    placeholder: "Form link",
    addLabel: "Add another form link",
    defaultValue: {
      value: "",
      verified: false
    }
  },
  email: {
    label: "Email",
    icon: "/icons/contact/email.svg",
    placeholder: "Email address",
    addLabel: "Add another email address",
    defaultValue: ""
  },
  phone: {
    label: "Phone",
    icon: "/icons/contact/phone.svg",
    placeholder: "Phone number",
    addLabel: "Add another phone number",
    defaultValue: ""
  },
  mail: {
    label: "Mail",
    icon: "/icons/contact/mail.svg",
    placeholder: "Mailing address",
    addLabel: "Add another mailing address",
    defaultValue: ""
  },
  "in person": {
    label: "In Person",
    icon: "/icons/contact/in-person.svg",
    placeholder: "Address",
    addLabel: "Add another address",
    defaultValue: ""
  },
};

const OTHER_METHOD_META = {
  label: "Other",
  icon: "/icons/contact/other.svg",
  placeholder: "Social media handle, messaging app, etc",
  addLabel: "Add another contact",
  defaultValue: ""
};

const ACCEPTS_OPTIONS = [
  { value: "complaints", label: "Complaints" },
  { value: "right_to_know", label: "Right-to-know" },
  { value: "tips", label: "Tips" },
];

// Utility functions
function getDefaultFilingInfo() {
  return {
    last_updated: null,
    defer: null,
    methods: [],
    documents: [],
  }
}

function reorder(list, startIndex, endIndex) {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);

  return result;
}

export default function JurisdictionInfoForm() {
  const params = useParams();
  const jurisdictionId = params.jurisdiction_id;

  const [filingInfo, setFilingInfo] = useState<JurisdictionFilingInfo>();
  const [gisInfo, setGisInfo] = useState<JurisidictionGisInfo>();
  const [isPending, setIsPending] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data
  useEffect(() => {
    setIsPending(true);
    setError(null);

    const loadData = async () => {
      try {
        const res = await fetch(`/api/get_jurisdiction_info?id=${jurisdictionId}`);

        if (!res.ok) {
          throw new Error("Failed to fetch jurisdiction info");
        }

        const data = await res.json();
        const gisInfo = data.gisInfo;
        const filingInfo = data.filingInfo ?? getDefaultFilingInfo();

        // Mark all existing URLs are verified
        for (let doc of filingInfo.documents) {
          doc.verified = true;
        }

        for (let method of filingInfo.methods) {
          if (method.method === "online form") {
            for (let vIdx = 0; vIdx < method.values.length; vIdx++) {
              method.values[vIdx] = {
                value: method.values[vIdx],
                verified: true
              }
            }
          }
        }

        setGisInfo(gisInfo);
        setFilingInfo(filingInfo);
        setIsPending(false);
      } catch (error) {
        setError(error);
        setIsPending(false);
      }
    };

    loadData();
  }, [jurisdictionId]);

  // Needed for section error handling
  const [lastDocAddSubmitCount, setLastDocAddSubmitCount] = useState(0);
  const [lastMethodAddSubmitCount, setLastMethodAddSubmitCount] = useState(0);
  const prevSubmitCount = useRef(0); // Used for scrolling to first error

  const [jurisdictionCreatorOpen, setJurisdictionCreatorOpen] = useState(false);

  const [linkPreviewOpen, setLinkPreviewOpen] = useState(false);
  const [linkPreview, setLinkPreview] = useState({ url: "", fieldPath: null, attachedField: null });

  const [feedbackFormOpen, setFeedbackFormOpen] = useState(false);

  if (!jurisdictionId || isPending) {
    return <></>;
  }

  if (error) {
    return <div className="min-w-screen min-h-screen flex justify-center items-center bg-gray-50">
      Failed to load page.
    </div>
  }

  document.title = `Info Editor - ${gisInfo.name}`;

  return (
    <div className="min-h-screen flex justify-center bg-gray-50">
      <Formik
        initialValues={filingInfo}
        validationSchema={VALIDATION_SCHEMA}
        onSubmit={async (values) => {
          try {
            const res = await fetch(`/api/update_jurisdiction_info?id=${jurisdictionId}`, {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify(values),
            });

            // Submission error
            if (!res.ok) {
              alert("Failed to update info. Please try again later.");
              return;
            }

            // Submission success
            setFeedbackFormOpen(true);
          } catch (error) {
            alert("Failed to update info. Please try again later.");
          }
        }}
      >
        {({ values, setFieldValue, errors, submitCount }) => {
          // Scroll to first error message if validation fails
          useEffect(() => {
            if (submitCount > prevSubmitCount.current) {
              const errors = document.getElementsByClassName("form-error-message");

              if (errors.length > 0) {
                errors[0].scrollIntoView({ behavior: "smooth", block: "center" });
              }

              prevSubmitCount.current = submitCount;
            }
          }, [submitCount]);

          // Track when a document is added after a submit
          useEffect(() => {
            if (submitCount !== lastDocAddSubmitCount) {
              setLastDocAddSubmitCount(submitCount);
            }
          }, [values.documents.length]);

          // Track when a method is added after a submit
          useEffect(() => {
            if (submitCount !== lastMethodAddSubmitCount) {
              setLastMethodAddSubmitCount(submitCount);
            }
          }, [values.methods.length]);

          return (
            <>
              <Form className="space-y-6 mt-10 mb-10">
                <div className="flex gap-8 flex-col max-xl:items-center xl:flex-row">
                  {/* Left static section */}
                  <div className="bg-white rounded-xl shadow p-8 min-w-[28rem] max-w-[28rem] h-fit xl:sticky top-10">
                    {/* Title */}
                    <h1 className="text-2xl font-bold mb-1">{gisInfo.name}</h1>
                    <div className="mb-6 text-sm text-gray-500">
                      Not the right jurisdiction?{" "}
                      <a
                        href="/editor"
                        className="text-blue-600 hover:text-blue-800 underline"
                      >
                        Click here
                      </a>
                    </div>
                    {/* Jurisdiction deferment */}
                    <div className="mb-4 text-xl font-bold text-gray-800">
                      Jurisdiction Deferment
                    </div>
                    <div className="flex items-center gap-4">
                      {(() => {
                        // Change defer
                        const updateDefer = async (deferId) => {
                          const res = await fetch(`/api/update_jurisdiction_defer?id=${jurisdictionId}`, {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(deferId),
                          });

                          // Submission error
                          if (!res.ok) {
                            alert("Failed to update info. Please try again later.");
                            return;
                          }
                        };

                        return (
                          <>
                            <div className="w-full">
                              <Field name="defer">
                                {({ field }) => (
                                  <JurisdictionSelector
                                    value={field.value}
                                    exclude={jurisdictionId}
                                    onChange={(option) => {
                                      setFieldValue("defer", option);
                                      updateDefer(option.value);
                                    }}
                                    onBlur={field.onBlur}
                                  />
                                )}
                              </Field>
                            </div>
                            <div
                              onClick={() => {
                                setFieldValue("defer", null);
                                updateDefer(null);
                              }}
                              className="text-blue-700 hover:text-blue-900 text-m ml-2 cursor-pointer"
                            >
                              Clear
                            </div>
                          </>
                        )
                      })()}
                    </div>
                    <div className="text-sm mt-2">
                      <span className="text-gray-500">Select another jurisdiction if this one is managed by another police department. </span>
                      <span className="text-gray-600 font-medium">Don't see your jurisdiction? </span>
                      <span
                        onClick={() => {
                          setJurisdictionCreatorOpen(true);
                        }}
                        className="inline font-medium text-blue-700 hover:text-blue-900 text-m cursor-pointer"
                      >
                        Add it
                      </span>
                    </div>
                    {/* Fill progress */}
                    <div className="mt-4">
                      <div className="text-lg font-bold text-gray-800 mb-4 text-center">
                        Progress
                      </div>
                      {(() => {
                        const presentTypes = new Set(
                          values.methods.map(m => m.method)
                        );

                        return (
                          <div className="flex justify-between items-center">
                            {Object.entries(COMMON_METHODS_META).map(([key, type]) => (
                              <div key={key} className="flex flex-col items-center flex-1">
                                <img src={type.icon} alt={type.label} className="w-7 h-7 mb-2 mx-auto" />
                                <span className="text-sm mb-2 text-center w-full">{type.label}</span>
                                <span className="flex items-center justify-center w-full">
                                  <span className={`inline-flex w-8 h-8 rounded-full items-center justify-center
                                    ${presentTypes.has(key) ? "bg-green-100" : "bg-gray-200"}
                                  `}>
                                    <svg
                                      className={`w-5 h-5 ${presentTypes.has(key) ? "text-green-600" : "text-gray-400"}`}
                                      fill="none"
                                      stroke="currentColor"
                                      strokeWidth="3"
                                      viewBox="0 0 24 24"
                                    >
                                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                    </svg>
                                  </span>
                                </span>
                              </div>
                            ))}
                          </div>
                        );
                      })()}
                    </div>
                  </div>
                  {/* Main form */}
                  <div className="bg-white rounded-xl shadow p-8 max-w-[48rem] h-fit">
                    {/* Documents */}
                    <div className="mb-6">
                      <div className="mb-1 text-xl font-bold text-gray-800 flex items-center gap-2">
                        Documents
                        {
                          submitCount > lastDocAddSubmitCount &&
                          // Check for at least one verification error
                          Array.isArray(errors?.documents) &&
                          errors.documents.some(error => error.verified)
                          && (
                            <span className="text-red-500 text-xs font-bold ml-3 form-error-message">
                              All links must be verified.
                            </span>
                          )
                        }
                      </div>
                      <div className="text-base mb-4">
                        Add links to any relevant documents, such as complaint forms or right-to-know forms.
                      </div>
                      <FieldArray name="documents">
                        {({ remove, push }) => {
                          return (
                            <div>
                              {values.documents.map((doc, idx) => {
                                const url = doc.url.trim();
                                let urlFieldRef;

                                return (
                                  <div key={idx} className="flex items-start mb-2 gap-2">
                                    <div className="flex flex-col w-60">
                                      <Field
                                        name={`documents[${idx}].name`}
                                        type="text"
                                        placeholder="Description"
                                        className="px-3 py-2 border border-gray-300 rounded"
                                        maxLength={40}
                                      />
                                      <ErrorMessage
                                        name={`documents[${idx}].name`}
                                        component="div"
                                        className="text-red-500 text-xs form-error-message"
                                      />
                                    </div>
                                    <div className="flex flex-col flex-1">
                                      <Field
                                        name={`documents[${idx}].url`}
                                        type="text"
                                        placeholder="Link"
                                        className="px-3 py-2 border border-gray-300 rounded"
                                        innerRef={el => { urlFieldRef = el }}
                                        onChange={e => {
                                          setFieldValue(`documents[${idx}].url`, e.target.value);
                                          setFieldValue(`documents[${idx}].verified`, false);
                                        }}
                                      />
                                      <ErrorMessage
                                        name={`documents[${idx}].url`}
                                        component="div"
                                        className="text-red-500 text-xs form-error-message"
                                      />
                                    </div>
                                    <div className="flex items-center">
                                      <LinkVerificationButton
                                        enabled={isUrlValid(url)}
                                        verified={doc.verified}
                                        onClick={() => {
                                          setLinkPreviewOpen(true);
                                          setLinkPreview({ url: url, fieldPath: `documents[${idx}].verified`, attachedField: urlFieldRef });
                                        }}
                                      />
                                      <button
                                        type="button"
                                        onClick={() => remove(idx)}
                                        className="ml-4 text-red-500 hover:text-red-700 text-xl font-bold rounded transition cursor-pointer"
                                        title="Remove link"
                                      >
                                        ×
                                      </button>
                                    </div>
                                  </div>
                                );
                              })}
                              <button
                                type="button"
                                className="mt-4 bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition flex items-center hover:cursor-pointer"
                                onClick={() => push({ url: "", name: "", verified: false })}
                              >
                                + Add another link
                              </button>
                            </div>
                          );
                        }}
                      </FieldArray>
                    </div>
                    {/* Methods */}
                    <div className="mb-6">
                      <div className="flex items-center gap-4 mb-1">
                        <div className="text-xl font-bold text-gray-800">Methods</div>
                        {
                          submitCount > lastMethodAddSubmitCount &&
                          typeof errors?.methods === "string" && (
                            <span className="text-red-500 text-xs font-bold ml-3 form-error-message">
                              {errors.methods}
                            </span>
                          )
                        }
                      </div>
                      <div className="text-base mb-4">
                        Add contact methods for submitting complaints, right-to-know requests, and tips. You may drag the cards to arrange them in order of preference.
                      </div>
                      {/* Methods list */}
                      <FieldArray name="methods">
                        {({ remove, push }) => (
                          <DragDropContext
                            onDragEnd={result => {
                              if (!result.destination || result.destination.index === result.source.index) {
                                return;
                              }

                              const newMethods = reorder(
                                values.methods,
                                result.source.index,
                                result.destination.index
                              );

                              setFieldValue("methods", newMethods);
                            }}
                          >
                            <Droppable droppableId="methods-droppable">
                              {(provided) => (
                                <div ref={provided.innerRef} {...provided.droppableProps}>
                                  {values.methods.length > 0
                                    ? values.methods.map((method, idx) => {
                                      const methodMeta = COMMON_METHODS_META[method.method] || OTHER_METHOD_META;

                                      return (
                                        <Draggable
                                          key={idx}
                                          draggableId={idx.toString()}
                                          index={idx}
                                        >
                                          {(dragProvided, dragSnapshot) => (
                                            <div
                                              ref={dragProvided.innerRef}
                                              {...dragProvided.draggableProps}
                                              className={`border rounded mb-4 relative bg-white ${dragSnapshot.isDragging ? "shadow-lg" : ""
                                                }`}
                                            >
                                              <div
                                                {...dragProvided.dragHandleProps}
                                                className="flex items-center px-6 py-2 rounded relative cursor-grab bg-gray-100 border-b border-gray-200"
                                              >
                                                {/* Drag handle */}
                                                <span
                                                  className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
                                                >
                                                  <img src="/icons/ui/reorder.svg" alt="Reorder" className="w-6 h-6 opacity-70" />
                                                </span>
                                                <span className="mr-3 flex-shrink-0">
                                                  <img src={methodMeta.icon} alt={methodMeta.label} className="w-7 h-7" />
                                                </span>
                                                <span className="text-lg font-normal">{methodMeta.label}</span>
                                                <button
                                                  type="button"
                                                  onClick={() => remove(idx)}
                                                  className="ml-auto text-red-500 hover:text-red-700 text-2xl font-bold rounded transition cursor-pointer"
                                                  title="Remove method"
                                                >
                                                  ×
                                                </button>
                                              </div>
                                              <div className="p-4">
                                                <FieldArray name={`methods[${idx}].values`}>
                                                  {({ push: pushValue, remove: removeValue }) => (
                                                    <div className="mb-2 space-y-2">
                                                      {method.values.map((val, vIdx) => {
                                                        let fieldName;
                                                        let fieldElement;

                                                        if (method.method === "online form") {
                                                          // Online form
                                                          fieldName = `methods[${idx}].values[${vIdx}].value`;
                                                          let url = val.value.trim();
                                                          let urlFieldRef;

                                                          fieldElement = (
                                                            <>
                                                              <Field
                                                                key={vIdx}
                                                                name={fieldName}
                                                                type="text"
                                                                className="w-full px-3 py-2 border border-gray-300 rounded [&:not(:first-child)]:mt-1"
                                                                onChange={e => {
                                                                  setFieldValue(`methods[${idx}].values[${vIdx}].value`, e.target.value);
                                                                  setFieldValue(`methods[${idx}].values[${vIdx}].verified`, false);
                                                                }}
                                                                innerRef={el => { urlFieldRef = el }}
                                                                placeholder={methodMeta.placeholder}
                                                              />
                                                              <LinkVerificationButton
                                                                enabled={isUrlValid(url)}
                                                                verified={val.verified}
                                                                onClick={() => {
                                                                  setLinkPreviewOpen(true);
                                                                  setLinkPreview({ url: url, fieldPath: `methods[${idx}].values[${vIdx}].verified`, attachedField: urlFieldRef });
                                                                }}
                                                              />
                                                            </>
                                                          )
                                                        } else if (method.method === "phone") {
                                                          // Phone
                                                          fieldName = `methods[${idx}].values[${vIdx}]`;

                                                          fieldElement = (
                                                            <Field name={fieldName} key={vIdx}>
                                                              {({ field, form }) => (
                                                                <PhoneInput
                                                                  country={"us"}
                                                                  value={field.value || ""}
                                                                  onChange={value => form.setFieldValue(field.name, value || "")}
                                                                  containerClass="!w-auto"
                                                                />
                                                              )}
                                                            </Field>
                                                          );
                                                        } else {
                                                          // Everything else
                                                          fieldName = `methods[${idx}].values[${vIdx}]`;

                                                          fieldElement = (
                                                            <Field
                                                              key={vIdx}
                                                              name={fieldName}
                                                              type="text"
                                                              className="w-full px-3 py-2 border border-gray-300 rounded [&:not(:first-child)]:mt-1"
                                                              placeholder={methodMeta.placeholder}
                                                            />
                                                          );
                                                        }

                                                        return (
                                                          <Fragment key={vIdx}>
                                                            <div className="flex items-center gap-2">
                                                              {fieldElement}
                                                              {method.values.length > 1 && (
                                                                <button
                                                                  type="button"
                                                                  className="text-red-500 hover:text-red-700 text-lg font-bold rounded transition cursor-pointer px-2"
                                                                  onClick={() => removeValue(vIdx)}
                                                                  title="Remove this value"
                                                                >
                                                                  ×
                                                                </button>
                                                              )}
                                                            </div>
                                                            <ErrorMessage
                                                              name={fieldName}
                                                              component="div"
                                                              className="text-red-500 text-xs form-error-message"
                                                            />
                                                          </Fragment>
                                                        );
                                                      })}
                                                      <div className="flex mt-2 items-center">
                                                        <button
                                                          type="button"
                                                          className="bg-blue-50 text-blue-700 px-3 py-1 rounded hover:bg-blue-100 transition text-sm flex items-center hover:cursor-pointer"
                                                          onClick={() => pushValue(methodMeta.defaultValue)}
                                                          title={methodMeta.addLabel}
                                                        >
                                                          + {methodMeta.addLabel}
                                                        </button>
                                                        {/* URL verification error for online forms */}
                                                        {method.method === "online form" &&
                                                          submitCount > lastMethodAddSubmitCount &&
                                                          typeof errors.methods[idx] === "object" &&
                                                          Array.isArray(errors.methods[idx].values) &&
                                                          errors.methods[idx].values.some(error => error.verified)
                                                          && (
                                                            <span className="text-red-500 text-xs font-bold ml-3 form-error-message">
                                                              All links must be verified.
                                                            </span>
                                                          )
                                                        }
                                                      </div>
                                                    </div>
                                                  )}
                                                </FieldArray>
                                                <div className="flex flex-row gap-4 mb-1 items-center">
                                                  <span className="font-medium text-sm">Accepts:</span>
                                                  {ACCEPTS_OPTIONS.map(opt => (
                                                    <label key={opt.value} className="flex items-center space-x-1">
                                                      <Field
                                                        type="checkbox"
                                                        name={`methods[${idx}].accepts`}
                                                        value={opt.value}
                                                      />
                                                      <span className="text-sm">{opt.label}</span>
                                                    </label>
                                                  ))}
                                                </div>
                                                <ErrorMessage
                                                  name={`methods[${idx}].accepts`}
                                                  component="div"
                                                  className="text-red-500 text-xs form-error-message"
                                                />
                                                <Field
                                                  name={`methods[${idx}].notes`}
                                                  as="textarea"
                                                  placeholder="Notes"
                                                  className="mt-2 w-full border rounded px-3 py-2 resize-none overflow-y-auto"
                                                  rows={2}
                                                />
                                              </div>
                                            </div>
                                          )}
                                        </Draggable>
                                      );
                                    })
                                    : null}
                                  {provided.placeholder}
                                </div>
                              )}
                            </Droppable>
                            {/* Add buttons */}
                            <div className="flex flex-wrap gap-2 mt-4">
                              {Object.entries(COMMON_METHODS_META).map(([methodType, type]) => (
                                <button
                                  key={methodType}
                                  type="button"
                                  className="bg-blue-100 text-blue-700 px-4 py-2 rounded hover:bg-blue-200 transition flex items-center hover:cursor-pointer"
                                  onClick={() =>
                                    push({
                                      method: methodType,
                                      values: [type.defaultValue], // Shallow copy?
                                      notes: "",
                                      accepts: [],
                                    })
                                  }
                                >
                                  <span className="mr-2 text-xl">
                                    <img src={type.icon} alt={type.label} className="w-6 h-6" />
                                  </span>
                                  Add {type.label}
                                </button>
                              ))}
                              <button
                                type="button"
                                className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition flex items-center hover:cursor-pointer"
                                onClick={() =>
                                  push({
                                    method: "other",
                                    values: [OTHER_METHOD_META.defaultValue],
                                    notes: "",
                                    accepts: [],
                                  })
                                }
                              >
                                <span className="mr-2 text-xl">
                                  <img src="/icons/contact/other.svg" alt="Other" className="w-6 h-6" />
                                </span>
                                Add Other
                              </button>
                            </div>
                          </DragDropContext>
                        )}
                      </FieldArray>
                    </div>
                    <button
                      type="submit"
                      className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition hover:cursor-pointer"
                    >
                      Submit
                    </button>
                  </div>
                </div>
              </Form>
              <Modal
                open={jurisdictionCreatorOpen}
                onOpenChange={setJurisdictionCreatorOpen}>
                <JurisdicionCreationForm hide={() => setJurisdictionCreatorOpen(false)} />
              </Modal>
              <Modal
                open={linkPreviewOpen}
                onOpenChange={setLinkPreviewOpen}>
                <LinkPreview
                  url={linkPreview.url}
                  hide={() => { setLinkPreviewOpen(false) }}
                  onConfirm={() => {
                    const { fieldPath } = linkPreview;
                    setFieldValue(fieldPath, true);
                  }}
                  onChange={() => {
                    // Focus URL field
                    const { attachedField } = linkPreview;

                    setTimeout(() => {
                      attachedField.focus();
                    }, 0);
                  }}
                />
              </Modal>
              <Modal
                open={feedbackFormOpen}
                onOpenChange={setFeedbackFormOpen}>
                <FeedbackForm hide={() => setFeedbackFormOpen(false)} />
              </Modal>
            </>
          )
        }}
      </Formik>
    </div>
  );
}
