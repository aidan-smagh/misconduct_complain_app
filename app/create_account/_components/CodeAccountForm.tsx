'use client';

import { useState, useRef } from 'react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import Modal from '@/components/Modal';
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

function generateCode(currentCode = '') {
  let newCode;
  do {
    newCode = wordPool[Math.floor(Math.random() * wordPool.length)];
  } while (newCode === currentCode);
  return newCode;
}

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

export default function CodeAccountForm({ onAccountCreated }) {
  const [showConfirmChangeModal, setShowConfirmChangeModal] = useState(false);
  const [showFinalConfirmation, setShowFinalConfirmation] = useState(false);
  const [questions, setQuestions] = useState([]);
  const [isCodeConfirmed, setIsCodeConfirmed] = useState(false);

  const formikSubmitRef = useRef(null);

  return (
    <Formik
      enableReinitialize
      initialValues={{ code: '', answers: ['', '', ''] }}
      validationSchema={VALIDATION_SCHEMA}
      onSubmit={async (values, { resetForm }) => {
        try {
          const res = await fetch('/api/create_code_account', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(values),
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
      {({ values, setFieldValue, isValid, isSubmitting, submitForm, setErrors, setTouched }) => {
        formikSubmitRef.current = submitForm;

        return (
          <Form>
            <p className="text-gray-700 mb-4">
              Press 'Generate code' until you find one you like. The questions will be based off this secret code.
            </p>

            <div className="flex items-stretch gap-4 mb-6">
              {!isCodeConfirmed && (
                <button
                  type="button"
                  onClick={async () => {
                    const newCode = generateCode(values.code || '');
                    const qs = await getQuestions(newCode);
                    setQuestions(qs);
                    setFieldValue('code', newCode || '');
                    setFieldValue('answers', Array(qs.length).fill(''));
                    setErrors({});
                  }}
                  className="px-4 rounded-md text-white text-sm font-medium bg-blue-600 hover:bg-blue-700"
                >
                  Generate code
                </button>
              )}

              <Field
                name="code"
                readOnly
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
                onClick={() => setIsCodeConfirmed(true)}
                disabled={!values.code}
                className={`w-full py-3 rounded-md text-white text-lg font-semibold ${
                  values.code
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
                    onClick={() => setShowConfirmChangeModal(true)}
                    disabled={isSubmitting}
                    className="px-4 py-2 rounded-md text-white bg-yellow-600 hover:bg-yellow-700"
                  >
                    Change code
                  </button>

                  <button
                    type="button"
                    disabled={!isValid || isSubmitting}
                    onClick={() => setShowFinalConfirmation(true)}
                    className={`px-6 py-3 rounded-md text-white text-lg font-semibold ${
                      isValid && !isSubmitting
                        ? 'bg-blue-600 hover:bg-blue-700'
                        : 'bg-gray-400 cursor-not-allowed'
                    }`}
                  >
                    Create account
                  </button>
                </div>
              </>
            )}

            <Modal
              open={showConfirmChangeModal}
              onOpenChange={setShowConfirmChangeModal}
            >
              <div className="max-w-lg w-full">
                <p className="text-gray-700">
                  Changing the secret code will reset your questions and answers. Are you sure you want to proceed?
                </p>
                <div className="mt-6 flex gap-4 justify-center">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => setShowConfirmChangeModal(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    className="px-6 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                    onClick={() => {
                      setFieldValue('code', '');
                      setFieldValue('answers', []);
                      setQuestions([]);
                      setIsCodeConfirmed(false);
                      setShowConfirmChangeModal(false);
                      setErrors({});
                      setTouched({});
                    }}
                  >
                    Confirm
                  </button>
                </div>
              </div>
            </Modal>

            <Modal
              open={showFinalConfirmation}
              onOpenChange={setShowFinalConfirmation}
            >
              <div className="max-w-lg w-full">
                <p className="text-gray-700">
                  <span>Your secret code is </span>
                  <span className="font-mono font-bold">{values.code}</span>.
                  <span> Make sure to remember your code and the exact answers to the questions (not case-sensitive), as you will need it to access or update your records.</span>
                </p>
                <p className="mt-2"><b>Note: Since we do not collect contact information, it will be impossible to recover your account.</b></p>
                <div className="mt-6 flex gap-4 justify-center">
                  <button
                    type="button"
                    className="px-6 py-2 bg-gray-300 rounded-md hover:bg-gray-400"
                    onClick={() => setShowFinalConfirmation(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      formikSubmitRef.current?.();
                      setShowFinalConfirmation(false);
                    }}
                    className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium"
                  >
                    Confirm and create account
                  </button>
                </div>
              </div>
            </Modal>
          </Form>
        );
      }}
    </Formik>
  );
}
