"use client";
import React, { useState, useEffect } from "react";
import { drawGroupedBarChart, BarData } from "./groupedBarChart";
import { drawLineChart } from "./lineGraph";
import * as d3 from "d3";

interface Counts {
  submitted: number;
  inProgress: number;
  addressed: number;
}

interface CategoryCounts {
  [category: string]: Counts;
}

interface RecordType {
  location: string;
  category: string;
  status: string;
  date: string; // ISO string
}

interface LegendProps {
  colors: Record<string, string>;
}

const Legend: React.FC<LegendProps> = ({ colors }) => (
  <div className="flex space-x-4 mt-4">
    {Object.entries(colors).map(([key, color]) => (
      <div key={key} className="flex items-center space-x-1">
        <div style={{ backgroundColor: color }} className="w-4 h-4"></div>
        <span className="text-sm">{key}</span>
      </div>
    ))}
  </div>
);

const colorScale = d3.scaleOrdinal()
  .domain(["submitted", "inProgress", "addressed"])
  .range(["#f56565", "#ed8936", "#48bb78"]);

const Community_tracker = () => {
  const [records, setRecords] = useState<RecordType[]>([]);
  const [summary, setSummary] = useState<Record<string, CategoryCounts>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);

  useEffect(() => {
    fetchRecords();
  }, []);

  const fetchRecords = async () => {
    const req = await fetch("/api/records");
    const recordsData: RecordType[] = await req.json();
    setRecords(recordsData);
    summarizeRecords(recordsData);
  };

  const summarizeRecords = (data: RecordType[]) => {
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
    setSelectedLocations(Object.keys(summaryObj));
  };

  const toggleDropdown = (location: string) => {
    setOpenDropdown(prev => (prev === location ? null : location));
  };

  // Draw grouped bar chart
  useEffect(() => {
    if (Object.keys(summary).length > 0) {
      const chartData: BarData[] = [];

      Object.entries(summary)
        .filter(([location]) => selectedLocations.includes(location))
        .forEach(([location, categories]) => {
          Object.entries(categories).forEach(([category, counts]) => {
            chartData.push({ group: location, category: "submitted", value: counts.submitted });
            chartData.push({ group: location, category: "inProgress", value: counts.inProgress });
            chartData.push({ group: location, category: "addressed", value: counts.addressed });
          });
        });

      d3.select("#chart").selectAll("*").remove();
      drawGroupedBarChart({ selector: "#chart", data: chartData });
    }
  }, [summary, selectedLocations]);

  // Draw line chart with date-based x-axis
  useEffect(() => {
    if (records.length > 0 && selectedLocations.length > 0) {
      const lineData = records
        .filter(r => selectedLocations.includes(r.location))
        .map(r => ({
          date: new Date(r.date),
          submitted: r.status === "submitted" ? 1 : 0,
          inProgress: r.status === "received update" ? 1 : 0,
          addressed: r.status === "addressed" ? 1 : 0,
        }));

      // Aggregate by date
      const aggregated: Record<string, { submitted: number; inProgress: number; addressed: number }> = {};
      lineData.forEach(d => {
        const key = d.date.toISOString().split("T")[0];
        if (!aggregated[key]) aggregated[key] = { submitted: 0, inProgress: 0, addressed: 0 };
        aggregated[key].submitted += d.submitted;
        aggregated[key].inProgress += d.inProgress;
        aggregated[key].addressed += d.addressed;
      });

      const finalLineData = Object.entries(aggregated).map(([date, counts]) => ({
        date: new Date(date),
        ...counts,
      }));

      d3.select("#linechart").selectAll("*").remove();
      drawLineChart({ selector: "#linechart", data: finalLineData });
    }
  }, [records, selectedLocations]);

  return (
    <div className="flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold text-center mt-12">
        Misconduct Complaint Record From Community
      </h1>
      <p className="w-3/4 text-center bg-gray-200 p-5 text-black text-sm mt-4 rounded-md leading-relaxed">
        This page contains community-reported cases when they filed a police complaint in Allegheny County.
      </p>
      <div className="flex items-center justify-center mt-6 space-x-4">
        <a href="/create_record" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
          + Add Record
        </a>
        <a href="/update_record/update_portal" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
          Update Record
        </a>
      </div>

      <div className="mt-10 w-3/4">
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
                      <td className="py-4 border flex justify-between items-center px-4">
                        <span>{location}</span>
                        <button onClick={() => toggleDropdown(location)}>
                          {openDropdown === location ? "−" : "+"}
                        </button>
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

        <div id="chart" className="mt-12 bg-white shadow-md p-4 rounded-md"></div>

        <div className="flex flex-wrap gap-4 mt-4">
          {Object.keys(summary).map(location => (
            <label key={location} className="flex items-center space-x-1">
              <input
                type="checkbox"
                checked={selectedLocations.includes(location)}
                onChange={() => {
                  setSelectedLocations(prev =>
                    prev.includes(location) ? prev.filter(l => l !== location) : [...prev, location]
                  );
                }}
              />
              <span>{location}</span>
            </label>
          ))}
        </div>

        <div id="linechart" className="mt-12 bg-white shadow-md p-4 rounded-md"></div>
      </div>
      <br />
    </div>
  );
};

export default Community_tracker;
