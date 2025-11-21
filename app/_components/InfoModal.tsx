// File: /components/map/InfoModal.tsx
"use client";
import React from "react";

const InfoModal = ({ onClose }) => {
  return (
    <div className="fixed top-20 left-1/2 transform -translate-x-1/2 z-50 w-3/4 max-w-md p-6 bg-white border border-gray-300 rounded-lg shadow-lg text-center">
      <h2 className="text-lg font-semibold text-gray-800">
        About This Website
      </h2>
      <p className="text-sm text-gray-600 mt-2">
        This website allows users to search for locations, view complaint
        information, and track status updates for reported issues.
      </p>
      <button
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
        onClick={onClose}
      >
        Close
      </button>
    </div>
  );
};

export default InfoModal;
