
"use client";

import Link from 'next/link';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function FilingWizard() {
  const router = useRouter();
  
  // Dummy login state for now
  const isLoggedIn = false;

  useEffect(() => {
    if (isLoggedIn) {
      // router.replace(redirectPath);
    }
  }, [isLoggedIn, router]);

  if (isLoggedIn) {
    return null;
  }

  return (
    <div className="w-full h-full flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-xl border border-gray-300 rounded-xl bg-white p-10 shadow-sm">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold">File an Anonymous Record</h1>
          <p className="text-gray-600 mt-4 text-lg">
            Have you filed a record before?
          </p>
        </div>

        <div className="flex gap-6 justify-center">
          <Link
            href="/login?redirect=%2Fcommunity_records%2Fcreate_record"
            className="bg-gray-100 hover:bg-gray-200 text-center px-8 py-5 rounded-lg text-lg font-medium border border-gray-300"
          >
            Yes, I’ve filed before
          </Link>
          <Link
            href="/register?redirect=%2Fcommunity_records%2Fcreate_record"
            className="bg-gray-100 hover:bg-gray-200 text-center px-8 py-5 rounded-lg text-lg font-medium border border-gray-300"
          >
            No, I’m new here
          </Link>
        </div>
      </div>
    </div>
  );
}