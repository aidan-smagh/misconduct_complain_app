import * as d3 from "d3";

interface LineDataByLocationAndStatus {
  date: Date;
  location: string;
  status: string;
  value: number;
}

interface LineChartByLocationAndStatusProps {
  selector: string;
  data: LineDataByLocationAndStatus[];
  locations: string[];
  width?: number;
  height?: number;
}

export function drawLineChartByLocationAndStatus({
  selector,
  data,
  locations,
  width = 1000,
  height = 500,
}: LineChartByLocationAndStatusProps) {
  const margin = { top: 40, right: 30, bottom: 80, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const sortedData = [...data].sort((a, b) => a.date.getTime() - b.date.getTime());

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // X scale (dates)
  const x = d3.scaleTime()
    .domain(d3.extent(sortedData, d => d.date) as [Date, Date])
    .range([0, chartWidth]);

  // Y scale (numeric values)
  const y = d3
    .scaleLinear()
    .domain([0, d3.max(sortedData, d => d.value)!])
    .nice()
    .range([chartHeight, 0]);

  // Color scale - same as original
  const color = d3
    .scaleOrdinal<string>()
    .domain(["submitted", "inProgress", "addressed"])
    .range(["#f56565", "#ed8936", "#48bb78"]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(
      d3.axisBottom(x)
        .ticks(Math.min(sortedData.length, 10))
        .tickFormat(d3.timeFormat("%b %d"))
    )
    .selectAll("text")
    .style("text-anchor", "end")
    .attr("dx", "-.8em")
    .attr("dy", ".15em")
    .attr("transform", "rotate(-45)");

  g.append("g")
  .call(
    d3.axisLeft(y)
      .tickValues(d3.range(0, Math.ceil(d3.max(sortedData, d => d.value)!) + 1))
      .tickFormat(d3.format("d"))
  );

  // Group data by location and status
  const dataByLocationAndStatus = d3.group(sortedData, d => d.location, d => d.status);

  // Line generator
  const line = d3.line<LineDataByLocationAndStatus>()
    .x(d => x(d.date))
    .y(d => y(d.value));

  // Draw lines for each location and status combination
  dataByLocationAndStatus.forEach((statusMap, location) => {
    statusMap.forEach((values, status) => {
      g.append("path")
        .datum(values)
        .attr("fill", "none")
        .attr("stroke", color(status)!)
        .attr("stroke-width", 2)
        .attr("d", line);

      // Add points
      g.selectAll(`circle.${location.replace(/\s+/g, '-')}-${status}`)
        .data(values)
        .join("circle")
        .attr("class", `${location.replace(/\s+/g, '-')}-${status}`)
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 4)
        .attr("fill", color(status)!)
        .style("cursor", "pointer");
    });
  });

  // Tooltip
  const tooltip = d3.select("body")
    .append("div")
    .style("position", "absolute")
    .style("pointer-events", "none")
    .style("opacity", 0)
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("z-index", "1000");

  // Add tooltip to all points
  g.selectAll("circle")
    .on("mouseover", (event, d: any) => {
      const statusLabel = d.status === 'inProgress' ? 'In Progress' : 
                         d.status.charAt(0).toUpperCase() + d.status.slice(1);
      tooltip.style("opacity", 1)
        .html(`<strong>${d.location}</strong><br/>Status: ${statusLabel}<br/>Date: ${d3.timeFormat("%b %d, %Y")(d.date)}<br/>Count: ${d.value}`);
    })
    .on("mousemove", (event) => {
      tooltip.style("left", (event.pageX + 10) + "px")
        .style("top", (event.pageY - 20) + "px");
    })
    .on("mouseout", () => {
      tooltip.style("opacity", 0);
    });

  // Legend - same as original
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${height - 30})`);

  const labels = {
    submitted: "Submitted",
    inProgress: "In Progress", 
    addressed: "Addressed"
  };

  (["submitted", "inProgress", "addressed"] as const).forEach((key, i) => {
    const xOffset = i * 140;
    legend.append("rect")
      .attr("x", xOffset)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(key)!);

    legend.append("text")
      .attr("x", xOffset + 20)
      .attr("y", 12)
      .text(labels[key])
      .style("font-size", "12px")
      .style("fill", "#000");
  });

}