import * as Yup from 'yup'

export const VALIDATION_SCHEMA = Yup.object({
  when: Yup.date().required("Required"),
  jurisdiction: Yup.object({
    value: Yup.string(),
    label: Yup.string(),
  }).noUnknown().nullable(),
  category: Yup.string().required("Required"),
  details: Yup.string(),
  status: Yup.string(),
  updates: Yup.array().of(
    Yup.object({
      date: Yup.date().required("Required"),
      title: Yup.string().required("Required"),
      details: Yup.string().required("Required")
    }).noUnknown()
  ),
  resolution: Yup.object({
    date: Yup.date().required("Required"),
    details: Yup.string().required("Required"),
    satisfaction: Yup.number().min(1).max(5).required("Required"),
  }).noUnknown().required("Required"),
}).noUnknown();
