import * as Yup from 'yup'

// Does not validate date is today or before
const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

export const VALIDATION_SCHEMA = Yup.object({
  dateCreated: Yup.date(),
  lastModified: Yup.date(),
  authorId: Yup.string(),
  when: Yup.string()
    .matches(dateRegex, "Required")
    .required("Required"),
  jurisdiction: Yup.object({
    value: Yup.string().required("Required"),
    label: Yup.string(),
  }).noUnknown().required("Required"),
  category: Yup.string().required("Required"),
  status: Yup.string().required("Required"),
  details: Yup.string(),
  updates: Yup.array().of(
    Yup.object({
      date: Yup.string()
        .matches(dateRegex, "Required")
        .required("Required"),
      title: Yup.string().required("Required"),
      details: Yup.string().required("Required")
    }).noUnknown()
  ),
  resolution: Yup.object({
    date: Yup.string(),
    details: Yup.string(),
    satisfaction: Yup.number().min(1).max(5).required("Required"),
  })
    .noUnknown()
    .required("Required")
    .test(
      "resolution-check",
      function (value, ctx) {
        // Require other fields if user has started filling out section
        const hasDate = !!value.date;
        const hasDetails = !!value.details && value.details.trim() !== "";

        if (hasDate && !hasDetails) {
          return ctx.createError({ path: `${ctx.path}.details`, message: "Required" });
        }

        if (hasDetails && !hasDate) {
          return ctx.createError({ path: `${ctx.path}.date`, message: "Required" });
        }

        return true;
      }
    ),
}).noUnknown();
