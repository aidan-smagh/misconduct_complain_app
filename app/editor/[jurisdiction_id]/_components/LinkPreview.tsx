import React, { useState, useEffect } from "react";

export default function LinkPreview({ hide, url, onConfirm, onChange }) {
  const [confirmEnabled, setConfirmEnabled] = useState(false);

  // Reset confirm state when url or open changes
  useEffect(() => {
    const coolDown = setTimeout(() => setConfirmEnabled(true), 3000);
    
    return () => clearTimeout(coolDown);
  });

  return (
    <div className="w-[60rem]">
      <h2 className="text-xl font-bold mb-4 text-center">Link Preview</h2>
      <div className="w-full h-[60vh] border border-gray-500">
        <iframe
          src={url}
          className="w-full h-full" />
      </div>
      <div className="w-full flex justify-center mt-2 min-h-[1.5rem]">
        {confirmEnabled ? (
          <div className="text-red-600 text-center">
            Preview failed to load?{" "}
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 underline hover:text-blue-800 cursor-pointer"
            >
              Open link in new tab
            </a>
          </div>
        ) : null}
      </div>
      <div className="w-full mt-2 flex gap-4 justify-center">
        {
          confirmEnabled ?
          <button
            className="px-4 py-2 rounded transition bg-blue-600 text-white hover:bg-blue-700 cursor-pointer"
            onClick={() => { onConfirm(); hide(); }}
            disabled={false}
          >
            Confirm
          </button> :
          <button
            className="px-4 py-2 rounded transition bg-blue-200 text-white cursor-not-allowed"
            disabled={true}
          >
            Confirm
          </button>
        }
        <button
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded hover:bg-gray-300 transition cursor-pointer"
          onClick={() => { onChange(); hide(); }}
        >
          Change
        </button>
      </div>
    </div>
  );
}
