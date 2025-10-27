import * as Yup from 'yup';

export const VALIDATION_SCHEMA = Yup.object({
  code: Yup.string().trim().required(),
  answers: Yup.array()
    .of(Yup.string().trim().required('Required'))
    .length(3)
}).noUnknown();