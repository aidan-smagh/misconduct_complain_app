"use client";
import parsePhoneNumber from 'libphonenumber-js'
import { JurisdictionFilingInfo, JurisdictionInfo } from "@/lib/types/jurisdiction";
import React from "react";

interface CoordinateInfoModalProps {
  nominatimData: any;
  jurisdictionInfo?: JurisdictionInfo;
};

interface MethodMetadata {
  icon: string;
  name: string;
  urlPrefix?: string;
}

const METHOD_METADATA: Record<string, MethodMetadata> = {
  "online form": {
    icon: "/icons/contact/online-form.svg",
    name: "Online form",
    urlPrefix: "",
  },
  email: {
    icon: "/icons/contact/email.svg",
    name: "Email",
    urlPrefix: "mailto:",
  },
  phone: {
    icon: "/icons/contact/phone.svg",
    name: "Phone",
    urlPrefix: "tel:",
  },
  mail: {
    icon: "/icons/contact/mail.svg",
    name: "Mail",
    urlPrefix: null,
  },
  "in person": {
    icon: "/icons/contact/in-person.svg",
    name: "In person",
    urlPrefix: null,
  },
  other: {
    icon: "/icons/contact/other.svg",
    name: "Other",
    urlPrefix: null,
  },
};

export default function CoordinateInfoModal({ nominatimData, jurisdictionInfo }: CoordinateInfoModalProps) {
  return (
    <div>
      {/* Jurisdiction name */}
      <div className="mt-2 text-base">
        {jurisdictionInfo ? (
          <div className="font-semibold">{jurisdictionInfo.gis.name}</div>
        ) : (
          <div className="text-gray-500">Jurisdiction not found</div>
        )}
      </div>

      {/* Address */}
      <div className="mt-2" style={{
        overflowWrap: "anywhere"
      }}>
        <span className="font-bold">Address: </span>
        {nominatimData ? (
          nominatimData.display_name
        ) : (
          <span className="text-gray-500">No address available</span>
        )}
      </div>

      {jurisdictionInfo && (jurisdictionInfo.filing ? (
        <>
          {/* Methods summary */}
          {jurisdictionInfo.filing.methods.length > 0 && (
            <div className="mt-2">
              <div className="font-bold text-sm">Contact methods</div>
              {jurisdictionInfo.filing.methods.map((m: any, i: number) => {
                const method_metadata = METHOD_METADATA[m.method] || METHOD_METADATA["other"];

                return (
                  <div key={i} className="flex items-start gap-3 mt-2">
                    <img src={method_metadata.icon} alt={m.method} className="w-5 h-5 mt-0.5 flex-shrink-0" />
                    <div className="flex-col">
                      <div className="font-medium text-sm mb-1">{method_metadata.name}</div>
                      {method_metadata.urlPrefix === null ? (
                        m.values.map((value: string, vi: number) => (
                          <div key={vi} className="mt-1">
                            {value}
                          </div>
                        ))
                      ) : (
                        m.values.map((value: string, vi: number) => {
                          return (
                            <div key={vi} className="mt-1">
                              <a href={method_metadata.urlPrefix + value} style={{
                                overflowWrap: "anywhere"
                              }}>{m.method === "phone" ? parsePhoneNumber(`+${value}`)?.formatNational() : value}</a>
                            </div>
                          )
                        })
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Documents */}
          {jurisdictionInfo.filing.documents.length > 0 && (
            <div className="mt-2">
              <div className="font-bold text-sm">Documents</div>
              {jurisdictionInfo.filing.documents.map((d: any, i: number) => (
                <div key={i} className="mt-1 mb-1">
                  <a href={d.url} target="_blank" rel="noreferrer" style={{
                    overflowWrap: "anywhere"
                  }}>
                    {d.name}
                  </a>
                </div>
              ))}
            </div>
          )}
        </>
      ) : (
        <div className="mt-2 font-bold text-base">No filing information found. <a href={`/editor/${jurisdictionInfo.id}`}>Contribute</a></div>
      ))}
    </div>
  );
}