"use client";
import React, { useState, useEffect, useRef, useMemo } from "react";
import { drawGroupedBarChart, BarData } from "./groupedBarChart";
import { drawLineChartByLocationAndStatus } from "./lineGraph";
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

interface MultiSelectDropdownProps {
  options: string[];
  selected: string[];
  onChange: (selected: string[]) => void;
  placeholder?: string;
}

const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  options,
  selected,
  onChange,
  placeholder = "Select locations..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selected.includes(option)) {
      onChange(selected.filter(item => item !== option));
    } else {
      onChange([...selected, option]);
    }
  };

  const removeOption = (option: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(selected.filter(item => item !== option));
  };

    return (
    <div className="relative w-full" ref={dropdownRef}>
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="min-h-[42px] w-full px-4 py-2 bg-white border border-gray-300 rounded-md cursor-pointer flex items-center justify-between hover:border-gray-400"
      >
        <div className="flex flex-wrap gap-1 flex-1">
          {selected.length === 0 ? (
            <span className="text-gray-500">{placeholder}</span>
          ) : (
            selected.map(item => (
              <span key={item} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm">
                {item}
                <span className="cursor-pointer hover:text-blue-900" onClick={(e) => removeOption(item, e)}>×</span>
              </span>
            ))
          )}
        </div>
        <span className={`ml-2 ${isOpen ? 'transform rotate-180' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="flex items-center justify-between px-4 py-2 border-b border-gray-200 bg-gray-50">
            <button onClick={() => onChange(options)} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Select All
            </button>
            <button onClick={() => onChange([])} className="text-sm text-blue-600 hover:text-blue-800 font-medium">
              Clear All
            </button>
          </div>
          {options.map(option => (
            <div
              key={option}
              onClick={() => toggleOption(option)}
              className="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span className="text-sm">{option}</span>
              {selected.includes(option) && <span className="text-blue-600">✓</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface TimeRangeFilterProps {
  selectedRange: string;
  onRangeChange: (range: string) => void;
}

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
  const [records, setRecords] = useState<RecordType[]>([]);
  const [summary, setSummary] = useState<Record<string, CategoryCounts>>({});
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

useEffect(() => {
  fetchRecords();
}, []);

useEffect(() => {
  summarizeRecords(records);
}, [records]);

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

const filteredRecords = React.useMemo(() => {
  return records.filter(record => {
    if (selectedTimeRange === 'all') return true;
    
    const recordDate = new Date(record.date);
    const now = new Date();
    const monthsAgo = new Date();
    monthsAgo.setMonth(now.getMonth() - parseInt(selectedTimeRange));
    
    // Reset time to start of day for accurate comparison
    recordDate.setHours(0, 0, 0, 0);
    monthsAgo.setHours(0, 0, 0, 0);
    
    return recordDate >= monthsAgo;
  });
}, [records, selectedTimeRange]);

// Draw grouped bar chart
useEffect(() => {
  d3.select("#chart").selectAll("*").remove();
  
  if (Object.keys(summary).length > 0) {
    const chartData: BarData[] = [];

    // Create filtered summary from filteredRecords
    const filteredSummary: Record<string, CategoryCounts> = {};
    filteredRecords.forEach((record) => {
      const { location, category, status } = record;
      if (!selectedLocations.includes(location)) return;
      
      if (!filteredSummary[location]) filteredSummary[location] = {};
      if (!filteredSummary[location][category]) {
        filteredSummary[location][category] = { submitted: 0, inProgress: 0, addressed: 0 };
      }
      if (status === "submitted") filteredSummary[location][category].submitted += 1;
      else if (status === "received update") filteredSummary[location][category].inProgress += 1;
      else if (status === "addressed") filteredSummary[location][category].addressed += 1;
    });

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

    Object.entries(filteredSummary).forEach(([location, categories]) => {
      Object.entries(categories).forEach(([category, counts]) => {
        chartData.push({ group: location, category: "submitted", value: counts.submitted });
        chartData.push({ group: location, category: "inProgress", value: counts.inProgress });
        chartData.push({ group: location, category: "addressed", value: counts.addressed });
      });
    });

    drawGroupedBarChart({ selector: "#chart", data: chartData });
  }
}, [summary, selectedLocations, filteredRecords]);


// Draw line chart with date-based x-axis
// Draw line chart with date-based x-axis
useEffect(() => {
  // Always clear the chart first
  d3.select("#linechart").selectAll("*").remove();
  
  if (filteredRecords.length > 0 && selectedLocations.length > 0) {
    const lineData = filteredRecords
      .filter(r => selectedLocations.includes(r.location))
      .map(r => ({
        date: new Date(r.date),
        location: r.location,
        status: r.status === "submitted" ? "submitted" : r.status === "received update" ? "inProgress" : "addressed"
      }));

    if (lineData.length === 0) {
      d3.select("#linechart")
        .append("div")
        .attr("class", "flex items-center justify-center h-40")
        .append("p")
        .attr("class", "text-gray-500 text-lg")
        .text("No data available for the selected time range and locations");
      return;
    }

    // Aggregate by date, location, and status
    const aggregated: Record<string, Record<string, Record<string, number>>> = {};
    lineData.forEach(d => {
      const key = d.date.toISOString().split("T")[0];
      if (!aggregated[key]) aggregated[key] = {};
      if (!aggregated[key][d.location]) aggregated[key][d.location] = { submitted: 0, inProgress: 0, addressed: 0 };
      aggregated[key][d.location][d.status] = (aggregated[key][d.location][d.status] || 0) + 1;
    });

    const finalLineData = Object.entries(aggregated).flatMap(([date, locations]) =>
      Object.entries(locations).flatMap(([location, statuses]) =>
        Object.entries(statuses).map(([status, count]) => ({
          date: new Date(date),
          location,
          status,
          value: count
        }))
      )
    );

    // Sort by date
    finalLineData.sort((a, b) => a.date.getTime() - b.date.getTime());

    drawLineChartByLocationAndStatus({ 
      selector: "#linechart", 
      data: finalLineData, 
      locations: selectedLocations 
    });
  } else {
    d3.select("#linechart")
      .append("div")
      .attr("class", "flex items-center justify-center h-40")
      .append("p")
      .attr("class", "text-gray-500 text-lg")
      .text(filteredRecords.length === 0 
        ? "No data available for the selected time range" 
        : "Please select at least one location to view the chart");
  }
}, [filteredRecords, selectedLocations]);

  return (
    <div className="flex flex-col items-center bg-gray-100">
      <h1 className="text-3xl font-bold text-center mt-12">
        Misconduct Complaint Record From Community
      </h1>
      <p className="w-3/4 text-center bg-gray-200 p-5 text-black text-sm mt-4 rounded-md leading-relaxed">
        This page contains community-reported cases when they filed a police complaint in Allegheny County. The data will not be complete since not all community members use this website. We show only the counts, and nothing personal is collected or shown here. We also show data from the last one year.
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

        <div className="mt-4 max-w-md mx-auto">
          <label className="block text-sm font-medium text-gray-700 mb-2 align=middle">
            Filter Locations
          </label>
          <MultiSelectDropdown
            options={Object.keys(summary)}
            selected={selectedLocations}
            onChange={setSelectedLocations}
            placeholder="Select locations to display..."
          />
          <p className="mt-2 text-sm text-gray-600 text-center">
            Showing {selectedLocations.length} of {Object.keys(summary).length} location(s)
          </p>
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
