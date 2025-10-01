import { Formik, Form, Field, ErrorMessage } from 'formik';
import { VALIDATION_SCHEMA } from '@/lib/standard_account_schema';

export default function StandardAccountForm({ onAccountCreated }) {
  return (
    <Formik
      initialValues={{ identifier: '', password: '' }}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={async (values, { resetForm }) => {
        try {
          const res = await fetch('/api/create_account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'standard', data: values }),
          });

          if (!res.ok) {
            alert('Submission failed. Please try again later.');
            return;
          }

          resetForm();
          onAccountCreated(await res.json());
        } catch (error) {
          alert('Submission failed. Please try again later.');
        }
      }}
    >
      {({ isSubmitting, isValid }) => (
        <Form className="space-y-4">
          <div>
            <label className="block mb-1 font-medium">Username or Email</label>
            <Field
              type="text"
              name="identifier"
              className="w-full border border-gray-300 rounded px-3 py-2"
              autoComplete="off"
              autoCorrect="off"
              spellCheck={false}
            />
            <ErrorMessage name="identifier" component="div" className="text-red-600 text-sm mt-1" />
          </div>

          <div>
            <label className="block mb-1 font-medium">Password</label>
            <Field
              type="password"
              name="password"
              className="w-full border border-gray-300 rounded px-3 py-2"
              autoComplete="new-password"
              autoCorrect="off"
              spellCheck={false}
            />
            <ErrorMessage name="password" component="div" className="text-red-600 text-sm mt-1" />
          </div>

          <button
            type="submit"
            className="w-full bg-green-600 text-white py-2 rounded hover:bg-green-700"
            disabled={!isValid || isSubmitting}
          >
            Create Account
          </button>
        </Form>
      )}
    </Formik>
  );
}
