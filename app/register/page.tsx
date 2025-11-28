
"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from 'next/navigation';
import { isValidRedirect } from '@/lib/validation/validation_rules';
import StandardAccountForm from "@/app/register/_components/StandardAccountForm";
import CodeAccountForm from "@/app/register/_components/CodeAccountForm";
import { signInWithCustomToken } from "firebase/auth";
import { auth } from "@/lib/client/firebaseConfig";
import Link from "next/link";

export default function RegisterPage() {
  return (
    <Suspense>
      <RegisterContent />
    </Suspense>
  );
}

function RegisterContent() {
  const [accountType, setAccountType] = useState(null);

  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');

  const createAccount = async (path: string, values: object) => {
    const res = await fetch(path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(values),
    });

    if (res.status === 409) {
      alert('An account with this username or email already exists.');
      return false;
    } else if (!res.ok) {
      alert('Submission failed. Please try again later.');
      return false;
    }

    const token = await res.json();
    await signInWithCustomToken(auth, token);

    if (isValidRedirect(redirect)) {
      window.location.replace(redirect);
    } else {
      window.location.replace("/");
      setAccountType(null);
    }
  }

  return (
    <div className="w-[500px] mx-auto bg-white border border-gray-300 rounded-xl shadow-sm p-10 mt-12">
      <h1 className="text-2xl font-bold mb-6">Create account</h1>
      {accountType === null ? (
        <div>
          <p className="mb-4">What type of account would you like to create?</p>
          <div className="flex flex-row gap-4 justify-center">
            <button
              className="w-[150px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              onClick={() => setAccountType('standard')}
            >
              Username or Email
            </button>
            <button
              className="w-[150px] px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-center"
              onClick={() => setAccountType('code')}
            >
              Secret Code & Questions
            </button>
          </div>
          <Link href={`/login?redirect=${redirect}`}>
            <div className="mt-4 text-blue-700">Login</div>
          </Link>
        </div>
      ) : (
        <>
          <button className="mb-4 flex items-center text-blue-600 underline" onClick={() => setAccountType(null)}>
            &larr; Back
          </button>
          {{
            'standard': <StandardAccountForm onSubmit={createAccount} />,
            'code': <CodeAccountForm onSubmit={createAccount} />,
          }[accountType]}
        </>
      )}
    </div>
  );
}