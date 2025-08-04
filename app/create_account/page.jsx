
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from 'next/navigation';
import { isValidRedirect } from '@/lib/validation_rules';
import StandardAccountForm from "@/components/community_records/StandardAccountForm";
import CodeAccountForm from "@/components/community_records/CodeAccountForm";

export default function CreateAccountPage() {
  const [accountType, setAccountType] = useState(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams?.get('redirect');

  // Called by forms after successful account creation
  const handleAccountCreated = (token) => {
    if (isValidRedirect(redirect)) {
      router.replace(redirect);
    } else {
      setAccountType(null);
    }
  };

  return (
    <div className="w-[500px] mx-auto bg-white border border-gray-300 rounded-xl shadow-sm p-10 mt-12">
      <h1 className="text-2xl font-bold mb-6">Create new profile</h1>
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
        </div>
      ) : (
        <>
          <button className="mb-4 flex items-center text-blue-600 underline" onClick={() => setAccountType(null)}>
            &larr; Back
          </button>
          {{
            'standard': <StandardAccountForm onAccountCreated={handleAccountCreated} />,
            'code': <CodeAccountForm onAccountCreated={handleAccountCreated} />,
          }[accountType]}
        </>
      )}
    </div>
  );
}