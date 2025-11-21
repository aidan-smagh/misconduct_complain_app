import * as Yup from 'yup';

function doesNotIncludeNull(value) {
  return value == null || !/\u0000/.test(value);
}

export const VALIDATION_SCHEMA = Yup.object({
  code: Yup.string().trim().required().test("no-null-char", doesNotIncludeNull),
  answers: Yup.array()
    .of(
      Yup.string().trim().required('Required').test("no-null-char", doesNotIncludeNull)
  )
  .length(3)
}).noUnknown();