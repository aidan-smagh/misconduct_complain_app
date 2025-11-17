import * as d3 from "d3";

export interface LineDatum {
  date: Date;
  submitted: number;
  inProgress: number;
  addressed: number;
}

interface LineChartProps {
  selector: string;
  data: LineDatum[];
  width?: number;
  height?: number;
}

export function drawLineChart({
  selector,
  data,
  width = 800,
  height = 400,
}: LineChartProps) {
  const margin = { top: 40, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Create SVG
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
  .domain(d3.extent(data, d => d.date) as [Date, Date])
  .range([0, chartWidth]);

  // Y scale (numeric values)
const y = d3
  .scaleLinear()
  .domain([0, d3.max(data, d => Math.max(d.submitted, d.inProgress, d.addressed))!])
  .nice()
  .range([chartHeight, 0]);

  // Color scale
  const color = d3
    .scaleOrdinal<string>()
    .domain(["submitted", "inProgress", "addressed"])
    .range(["#f56565", "#ed8936", "#48bb78"]);

  // Axes
g.append("g")
  .attr("transform", `translate(0,${chartHeight})`)
  .call(d3.axisBottom(x).ticks(d3.timeDay.every(1)).tickFormat(d3.timeFormat("%b %d")));

g.append("g")
  .call(
    d3.axisLeft(y)
      .tickValues(d3.range(0, Math.ceil(d3.max(data, d => Math.max(d.submitted, d.inProgress, d.addressed))!) + 1))
      .tickFormat(d3.format("d"))
  );

  // Line generator for numeric keys
const line = (key: keyof Omit<LineDatum, "date">) =>
  d3.line<LineDatum>()
    .x(d => x(d.date))
    .y(d => y(d[key]));

["submitted", "inProgress", "addressed"].forEach((key: keyof Omit<LineDatum, "date">) => {
  g.append("path")
    .datum(data)
    .attr("fill", "none")
    .attr("stroke", color(key)!)
    .attr("stroke-width", 2)
    .attr("d", line(key)!);
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
    .style("border-radius", "4px");

  // Points and interactivity
  ["submitted", "inProgress", "addressed"].forEach((key: keyof Omit<LineDatum, "location">) => {
    g.selectAll(`circle.${key}`)
      .data(data)
      .join("circle")
      .attr("class", key)
      .attr("cx", d => x(d.date))
      .attr("cy", d => y(d[key]))
      .attr("r", 4)
      .attr("fill", color(key)!)
      .on("mouseover", (event, d) => {
        tooltip.style("opacity", 1)
               .html(`<strong>${key}</strong><br/>${d.location}: ${d[key]}`);
      })
      .on("mousemove", (event) => {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", () => {
        tooltip.style("opacity", 0);
      });
  });

  // Legend
  const legend = svg.append("g")
    .attr("transform", `translate(${margin.left}, ${height - margin.bottom + 20})`);

  ["submitted", "inProgress", "addressed"].forEach((key, i) => {
    const xOffset = i * 120;
    legend.append("rect")
      .attr("x", xOffset)
      .attr("y", 0)
      .attr("width", 15)
      .attr("height", 15)
      .attr("fill", color(key)!);

    legend.append("text")
      .attr("x", xOffset + 20)
      .attr("y", 12)
      .text(key)
      .style("font-size", "12px")
      .style("fill", "#000");
  });
}
