'use client';

import { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { VALIDATION_SCHEMA } from '@/lib/validation/code_account_schema';

const wordPool = [
  'thicket', 'garnet', 'velvet', 'hollow', 'ember', 'marble', 'cobble', 'bramble',
  'meadow', 'drizzle', 'willow', 'hazelnut', 'glimmer', 'mulberry', 'flint', 'grove',
  'maple', 'cricket', 'dapple', 'harbor', 'quartz', 'shimmer', 'pebble', 'blossom'
];

const questions = [
  'What is your favorite kind of weather?',
  'Name a fictional place you like.',
  'What’s a word you liked as a kid?',
  'What is your favorite tree or plant?',
  'What’s a sound you find calming?',
  'What is a snack you’d never share?',
  'Name a street you remember (not your own).',
  'What animal do you find funny?',
  'What’s an object you’d take to a desert island?',
  'Name a book you liked but never finished.',
  'What’s a job you’d never want to do?',
  'Name a toy or object you lost as a child.',
  'What’s a dream you remember?',
  'What’s a smell that reminds you of somewhere?',
];

async function sha256Hex(code) {
  const buffer = new TextEncoder().encode(code);
  const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
}

async function getQuestions(code) {
  const hashHex = await sha256Hex(code);
  const indices = new Set();
  let offset = 0;

  while (indices.size < 3 && offset + 4 < hashHex.length) {
    const slice = hashHex.slice(offset, offset + 4);
    const index = parseInt(slice, 16) % questions.length;
    indices.add(index);
    offset += 4;
  }

  const result = Array.from(indices).map((i: number) => questions[i]);

  return result;
}

export default function CodeAccountForm({ onSubmit }) {
  const [questions, setQuestions] = useState([]);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);

  const formikSubmitRef = useRef(null);

  const populateQuestions = async (code) => {
    if (wordPool.includes(code)) {
      setQuestions(await getQuestions(code));
      setIsCodeConfirmed(true);
    } else {
      alert("Code is not recognized");
    }
  }

  return (
    <Formik
      enableReinitialize
      initialValues={{ code: '', answers: ['', '', ''] }}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={async (values, { resetForm }) => {
        try {
          const result = await onSubmit('/api/login_code_account', values);

          if (result) {
            resetForm();
          }
        } catch (error) {
          alert('Login failed. Please try again later.');
        }
      }}
    >
      {({ values, setFieldValue, isValid, isSubmitting, submitForm, setErrors, setTouched }) => {
        formikSubmitRef.current = submitForm;

        return (
          <Form>
            <div className="flex items-center gap-4 mb-6">
              <label className="block text-gray-700 mb-2">Your code</label>
              <Field
                name="code"
                value={values.code || ''}
                className="flex-1 border border-gray-300 rounded-md px-4 py-2 bg-gray-100 text-lg font-mono"
                autoComplete="off"
                autoCorrect="off"
                spellCheck={false}
              />
            </div>

            {!isCodeConfirmed && (
              <button
                type="button"
                onClick={() => {
                  populateQuestions(values.code);
                }}
                disabled={!values.code}
                className={`w-full py-3 rounded-md text-white text-lg font-semibold ${values.code
                  ? 'bg-green-600 hover:bg-green-700'
                  : 'bg-gray-400 cursor-not-allowed'
                  }`}
              >
                Next
              </button>
            )}

            {isCodeConfirmed && (
              <>
                {questions.map((q, i) => (
                  <div key={i} className="mb-5">
                    <label className="block text-gray-700 mb-2">{q}</label>
                    <Field
                      name={`answers[${i}]`}
                      type="text"
                      className="w-full border rounded px-3 py-2"
                      autoComplete="off"
                      autoCorrect="off"
                      spellCheck={false}
                      value={values.answers[i] || ''}
                    />
                    <ErrorMessage
                      name={`answers[${i}]`}
                      component="div"
                      className="text-red-600 text-sm mt-1"
                    />
                  </div>
                ))}

                <div className="flex justify-between mt-6 mb-4">
                  <button
                    type="button"
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                    onClick={() => {
                      setFieldValue('code', '');
                      setFieldValue('answers', ['', '', '']);
                      setQuestions([]);
                      setIsCodeConfirmed(false);
                      setErrors({});
                      setTouched({});
                    }}
                  >
                    Retype code
                  </button>

                  <button
                    type="submit"
                    disabled={!isValid || isSubmitting}
                    className={`px-6 py-3 rounded-md text-white text-lg font-semibold ${isValid && !isSubmitting
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : 'bg-gray-400 cursor-not-allowed'
                      }`}
                  >
                    Login
                  </button>
                </div>
              </>
            )}
          </Form>
        );
      }}
    </Formik>
  );
}
