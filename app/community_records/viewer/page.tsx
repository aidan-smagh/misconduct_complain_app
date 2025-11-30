"use client";
import React, { useState, useEffect, useMemo } from "react";
import { drawGroupedBarChart, BarData } from "@/lib/client/visualization/groupedBarChart";
import { drawLineChartByLocationAndStatus } from "@/lib/client/visualization/lineGraph";
import * as d3 from "d3";
import JurisdictionSelector from "@/app/editor/[jurisdiction_id]/_components/JurisdictionSelector";
import { ComplaintRecord } from "@/lib/types/community_tracker";

interface Counts {
  submitted: number;
  inProgress: number;
  addressed: number;
}

interface CategoryCounts {
  [category: string]: Counts;
}

interface LegendProps {
  colors: Record<string, string>;
}

interface TimeRangeFilterProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

function getCategoryFromStatus(status: string) {
  switch (status) {
    case "Filed":
    case "Withdrawn":
      return "submitted";
    case "Under Review":
      return "inProgress";
    case "Resolved":
    case "Dismissed":
      return "addressed";
    default:
      return undefined;
  }
}

function summarizeRecords(data: ComplaintRecord[]) {
  const summary: Record<string, CategoryCounts> = {};

  data.forEach((record) => {
    const jurisdictionId = record.jurisdiction?.value;
    const category = record.category;
    const status = record.status;

    // Categorize by jurisdiction
    if (!summary[jurisdictionId]) {
      summary[jurisdictionId] = {};
    }

    // Categorize by status
    const categorySummary = summary[jurisdictionId];

    if (!categorySummary[category]) {
      categorySummary[category] = { submitted: 0, inProgress: 0, addressed: 0 };
    }

    const categoryKey = getCategoryFromStatus(status);

    if (categoryKey) {
      categorySummary[category][categoryKey] += 1;
    }
  });

  return summary;
};

const LoadingScreen: React.FC = () => (
  <div className="flex flex-col items-center justify-center h-screen">
    <div className="text-lg text-gray-600">Loading data...</div>
  </div>
);

const TimeRangeFilter: React.FC<TimeRangeFilterProps> = ({
  selectedRange,
  onRangeChange,
}) => {
  const options = [
    { value: 'all', label: 'All Time' },
    { value: '6', label: 'Last 6 Months' },
    { value: '12', label: 'Last 12 Months' },
    { value: '18', label: 'Last 18 Months' },
    { value: '24', label: 'Last 24 Months' },
  ];

  return (
    <div className="max-w-xs mx-auto">
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Time Range
      </label>
      <select
        value={selectedRange}
        onChange={(e) => onRangeChange(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
};

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
  const [records, setRecords] = useState<ComplaintRecord[]>([]);
  const [gisIndex, setGisIndex] = useState<Record<string, { name: string }>>({});

  const [openLocationDetails, setOpenLocationDetails] = useState<string | null>(null);

  const [selectedLocations, setSelectedLocations] = useState<{ value: string; label: string }[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  const [loading, setLoading] = useState(true);

  const summary = useMemo(() => summarizeRecords(records), [records]);

  const filteredRecords = useMemo(() => {
    let filtered = records;

    if (selectedLocations.length > 0) {
      const locationIds = new Set(selectedLocations.map(loc => loc.value));
      filtered = filtered.filter(record => locationIds.has(record.jurisdiction.value));
    }

    if (selectedTimeRange !== 'all') {
      filtered = filtered.filter(record => {
        const recordDate = new Date(record.when);
        const now = new Date();
        const monthsAgo = new Date();
        monthsAgo.setMonth(now.getMonth() - parseInt(selectedTimeRange));
        // Reset time to start of day for accurate comparison
        recordDate.setHours(0, 0, 0, 0);
        monthsAgo.setHours(0, 0, 0, 0);

        return recordDate >= monthsAgo;
      });
    }

    return filtered;
  }, [records, selectedLocations, selectedTimeRange]);

  const toggleLocationCategories = (location: string) => {
    setOpenLocationDetails(prev => (prev === location ? null : location));
  };

  // Draw grouped bar chart
  const drawSummaryChart = () => {
    // Clear chart
    d3.select("#chart").selectAll("*").remove();

    if (Object.keys(summary).length > 0) {
      const chartData: BarData[] = [];

      // Create filtered summary from filteredRecords
      const filteredSummary: Record<string, CategoryCounts> = summarizeRecords(filteredRecords);

      if (Object.keys(filteredSummary).length === 0) {
        // Display "no data" message
        d3.select("#chart")
          .append("div")
          .attr("class", "flex items-center justify-center h-40")
          .append("p")
          .attr("class", "text-gray-500 text-lg")
          .text("No data available for the selected time range and locations");
        return;
      }

      Object.entries(filteredSummary).forEach(([locationId, categories]) => {
        const locationName = gisIndex[locationId]?.name || locationId;
        Object.entries(categories).forEach(([category, counts]) => {
          chartData.push({ group: locationName, category: "Submitted", value: counts.submitted });
          chartData.push({ group: locationName, category: "In Progress", value: counts.inProgress });
          chartData.push({ group: locationName, category: "Addressed", value: counts.addressed });
        });
      });

      drawGroupedBarChart({ selector: "#chart", data: chartData });
    }
  };

  // Draw line chart with date-based x-axis
  const drawLineChart = () => {
    // Clear chart
    d3.select("#linechart").selectAll("*").remove();

    if (filteredRecords.length > 0) {
      // Aggregate by date, location, and status
      const aggregated: Record<string, Record<string, Record<string, number>>> = {};

      for (const record of filteredRecords) {
        const key = new Date(record.when).toISOString().split("T")[0];
        const locId = record.jurisdiction.value;
        const category = getCategoryFromStatus(record.status);

        // Date bins
        if (!aggregated[key]) {
          aggregated[key] = {};
        }

        // Location bins
        if (!aggregated[key][locId]) {
          aggregated[key][locId] = { submitted: 0, inProgress: 0, addressed: 0 };
        }

        // Status bins
        aggregated[key][locId][category] = (aggregated[key][locId][category] || 0) + 1;
      };

      const finalLineData = Object.entries(aggregated).flatMap(([date, locations]) =>
        Object.entries(locations).flatMap(([locationId, statuses]) =>
          Object.entries(statuses).map(([status, count]) => ({
            date: new Date(date),
            location: gisIndex[locationId]?.name || locationId,
            status,
            value: count
          }))
        )
      );

      // Sort by date
      finalLineData.sort((a, b) => a.date.getTime() - b.date.getTime());

      console.log(finalLineData);

      drawLineChartByLocationAndStatus({
        selector: "#linechart",
        data: finalLineData,
        locations: selectedLocations.map(loc => loc.value)
      });
    } else {
      d3.select("#linechart")
        .append("div")
        .attr("class", "flex items-center justify-center h-40")
        .append("p")
        .attr("class", "text-gray-500 text-lg")
        .text("No data available for the selected time range and locations");
      return;
    }
  };

  // Load data
  useEffect(() => {
    setLoading(true);

    Promise.all([
      fetch("/api/get_gis_index").then(res => res.json()),
      fetch("/api/get_complaint_records").then(res => res.json())
    ]).then(([indexData, recordsData]) => {
      setGisIndex(indexData);
      setRecords(recordsData);
      setSelectedLocations([]); // Show all data by default
      setLoading(false);
    });
  }, []);

  // Draw charts
  useEffect(() => {
    drawSummaryChart();
    drawLineChart();
  }, [selectedLocations, selectedTimeRange]);

  // Loading screen
  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <div className="flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold text-center mt-12">
        Misconduct Complaint Record From Community
      </h1>
      <p className="w-3/4 text-center bg-gray-200 p-5 text-black text-sm mt-4 rounded-md leading-relaxed">
        This page contains community-reported cases when they filed a police complaint in Allegheny County. The data will not be complete since not all community members use this website. We show only the counts, and nothing personal is collected or shown here. We also show data from the last one year.
      </p>
      <div className="flex items-center justify-center mt-6 space-x-4">
        <a href="/community_records/file" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
          + Add Record
        </a>
        <a href="/community_records/update" className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-6 rounded-md">
          Update Record
        </a>
      </div>

      <div className="text-xl text-red-600 font-bold mt-8">The following records are not real and only for demonstration purposes</div>

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
                        <span>{gisIndex[location]?.name || location}</span>
                        <button onClick={() => toggleLocationCategories(location)}>
                          {openLocationDetails === location ? "−" : "+"}
                        </button>
                      </td>
                      <td className="py-4 border">{total.submitted}</td>
                      <td className="py-4 border">{total.inProgress}</td>
                      <td className="py-4 border">{total.addressed}</td>
                    </tr>
                    {openLocationDetails === location &&
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

        <div className="mt-4 max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2 align=middle">
            Filter Locations
          </label>
          <div>
            <JurisdictionSelector
              value={selectedLocations}
              isMulti={true}
              onChange={options => setSelectedLocations(options as { value: string; label: string }[])}
            />
          </div>
        </div>
        <div className="mt-6">
          <TimeRangeFilter
            selectedRange={selectedTimeRange}
            onRangeChange={setSelectedTimeRange}
          />
        </div>

        <div id="linechart" className="mt-12 bg-white shadow-md p-4 rounded-md"></div>
      </div>
      <br />
    </div>
  );
};

export default Community_tracker;
