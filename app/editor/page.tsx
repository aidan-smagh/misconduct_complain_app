'use client';
import { useRouter } from "next/navigation";
import dynamic from "next/dynamic";
import { useState } from "react";
import Modal from "@/components/Modal";
import JurisdicionCreationForm from "@/app/editor/[jurisdiction_id]/_components/JurisdictionCreationForm";

const JurisdictionSelector = dynamic(
  () => import("@/app/editor/[jurisdiction_id]/_components/JurisdictionSelector"),
  { ssr: false }
);

export default function JurisdictionSearch() {
  const router = useRouter();

  const [jurisdictionCreatorOpen, setJurisdictionCreatorOpen] = useState(false);

  const navigate = (option) => {
    if (option && option.value) {
      router.push(`/editor/${option.value}`);
    }
  };

  return (
    <>
      <div className="w-full h-full flex items-center justify-center px-4">
        <div className="bg-white rounded-xl shadow-lg border border-gray-200 p-8">
          <div className="mb-4 text-lg font-semibold text-gray-700 text-center">
            Update filing information for your jurisdiction
          </div>
          <div className="h-[49px]">
            <JurisdictionSelector
              onChange={navigate}
            />
          </div>
          <div className="mt-2">
            <span className="text-gray-600 font-medium">Don't see your jurisdiction? </span>
            <span
              onClick={() => {
                setJurisdictionCreatorOpen(true);
              }}
              className="inline font-medium text-blue-700 hover:text-blue-900 text-m cursor-pointer"
            >
              Add it
            </span>
          </div>
        </div>
      </div>
      <Modal
        open={jurisdictionCreatorOpen}
        onOpenChange={setJurisdictionCreatorOpen}>
          <JurisdicionCreationForm hide={() => setJurisdictionCreatorOpen(false)}/>
      </Modal>
    </>
  );
}
