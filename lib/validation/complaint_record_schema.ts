import * as Yup from 'yup'

const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

// Check if a date is on or before today in Anywhere on Earth time
function isOnOrBeforeTodayAoE(input: string): boolean {
  const given = new Date(input);
  const now = new Date();
  const currentAoE = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate()
    )
  );

  currentAoE.setUTCDate(currentAoE.getUTCDate() + 1);

  return given.getTime() <= currentAoE.getTime();
}

function isValidDate(value: string, ctx: Yup.TestContext) {
  if (!value) {
    return true;
  }
  
  if (!dateRegex.test(value)) {
    return false;
  }

  return isOnOrBeforeTodayAoE(value);
}

export const VALIDATION_SCHEMA = Yup.object({
  dateCreated: Yup.date(),
  lastModified: Yup.date(),
  authorId: Yup.string(),
  when: Yup.string()
    .required("Required")
    .test("valid-date", "Invalid date format", isValidDate),
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
        .required("Required")
        .test("valid-date", "Invalid date format", isValidDate),
      title: Yup.string().required("Required"),
      details: Yup.string().required("Required")
    }).noUnknown()
  ),
  resolution: Yup.object({
    date: Yup.string()
      .test("valid-date", "Invalid date format", isValidDate),
    details: Yup.string(),
    satisfaction: Yup.number().min(1).max(5),
  })
    .noUnknown()
    .test(
      "resolution-check",
      function (value, ctx) {
        if (!value) {
          return true;
        }

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
    )
}).noUnknown();
