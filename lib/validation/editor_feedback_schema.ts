import * as Yup from 'yup';

export const VALIDATION_SCHEMA = Yup.object({
  accountability: Yup.string(),
  tool: Yup.string(),
  followup: Yup.string(),
}).noUnknown(true);