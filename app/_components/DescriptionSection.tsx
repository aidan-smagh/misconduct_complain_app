"use client";
import React from "react";

const DescriptionSection = ({ expanded, setExpanded }) => {
  return (
    <>
      <div className="w-3/4 hidden lg:block text-center bg-gray-200 p-5 text-black-500 text-sm leading-relaxed rounded-md mt-3">
        This website aimed at building trust and improving communication between
        community members and our law enforcement system in Allegheny County. We
        have gathered data on how to file police complaints across all
        municipalities using public records, direct inquiries, and Right to Know
        requests. This information is now available in the interactive map
        below. You can search for details by location or click 'Locate Me' to
        find complaint procedures specific to your area.
      </div>
      <div className="w-3/4 lg:hidden bg-gray-300 p-3 text-black text-sm leading-relaxed rounded-lg mt-3 text-left">
        <div>
          This website aims to build trust and improve communication
          {expanded && (
            <p>
              between community members and our law enforcement system in
              Allegheny County. We have gathered data on how to file police
              complaints across all municipalities using public records, direct
              inquiries, and Right to Know requests. This information is now
              available in the interactive map below. You can search for details
              by location or click 'Locate Me' to find complaint procedures
              specific to your area.
            </p>
          )}
          {!expanded && "..."}{" "}
          <span
            className="text-blue-600 cursor-pointer underline"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? "read less" : "read more"}
          </span>
        </div>
      </div>
    </>
  );
};

export default DescriptionSection;
