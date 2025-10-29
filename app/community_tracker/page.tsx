"use client";
import React, { useState, useEffect } from "react";

interface Counts {
  submitted: number;
  inProgress: number;
  addressed: number;
}

interface CategoryCounts {
  [category: string]: Counts;
}

const Community_tracker = () => {
  const [summary, setSummary] = useState<Record<string, CategoryCounts>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const req = await fetch("/api/records");
    const recordsData = await req.json();
    summarizeRecords(recordsData);
  };

  const summarizeRecords = (data: any[]) => {
    const summaryObj: Record<string, CategoryCounts> = {};

    data.forEach((record) => {
      const { location, category, status } = record;

      if (!summaryObj[location]) summaryObj[location] = {};
      if (!summaryObj[location][category]) {
        summaryObj[location][category] = { submitted: 0, inProgress: 0, addressed: 0 };
      }

      if (status === "submitted") summaryObj[location][category].submitted += 1;
      else if (status === "received update") summaryObj[location][category].inProgress += 1;
      else if (status === "addressed") summaryObj[location][category].addressed += 1;
    });

    setSummary(summaryObj);
  };

  const toggleDropdown = (location: string) => {
    setOpenDropdown((prev) => (prev === location ? null : location));
  };

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-100">
      <h1 className="text-3xl font-bold text-center mt-12">
        Misconduct Complaint Record From Community
      </h1>

      <p className="w-3/4 text-center bg-gray-200 p-5 text-black text-sm mt-4 rounded-md leading-relaxed">
        This page contains community-reported cases when they filed a police complaint in Allegheny County.
        The data will not be complete since not all community members use this website.
      </p>

      <div className="flex items-center justify-center mt-6 space-x-4">
        <a href="/create_record" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
          + Add Record
        </a>
        <a href="/update_record/update_portal" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
          Update Record
        </a>
      </div>

      <div className="mt-10 w-3/4 overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse border border-gray-300 text-center">
          <thead>
            <tr className="bg-gray-900 text-white">
              <th className="py-3 px-6 border">Location</th>
              <th className="py-3 px-6 border">Submitted Records</th>
              <th className="py-3 px-6 border">Records In Progress</th>
              <th className="py-3 px-6 border">Records Addressed</th>
            </tr>
          </thead>

          <tbody>
            {Object.keys(summary).length > 0 ? (
              Object.entries(summary).map(([location, categories], index) => {
                const total = Object.values(categories).reduce(
                  (acc, c) => ({
                    submitted: acc.submitted + c.submitted,
                    inProgress: acc.inProgress + c.inProgress,
                    addressed: acc.addressed + c.addressed,
                  }),
                  { submitted: 0, inProgress: 0, addressed: 0 }
                );

                return (
                  <React.Fragment key={location}>
                    <tr className={index % 2 === 0 ? "bg-gray-50" : "bg-gray-100"}>
                      <td className="py-4 border">
                        <div className="flex justify-between items-center px-4">
                          <span>{location}</span>
                          <button onClick={() => toggleDropdown(location)}>
                            {openDropdown === location ? "−" : "+"}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 border">{total.submitted}</td>
                      <td className="py-4 border">{total.inProgress}</td>
                      <td className="py-4 border">{total.addressed}</td>
                    </tr>

                    {openDropdown === location &&
                      Object.entries(categories).map(([category, counts]) => (
                        <tr key={category} className="bg-gray-200">
                          <td className="py-4 border pl-8">{category}</td>
                          <td className="py-4 border">{counts.submitted}</td>
                          <td className="py-4 border">{counts.inProgress}</td>
                          <td className="py-4 border">{counts.addressed}</td>
                        </tr>
                      ))}
                  </React.Fragment>
                );
              })
            ) : (
              <tr>
                <td colSpan={4} className="py-4 text-gray-500">
                  No records available.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Community_tracker;