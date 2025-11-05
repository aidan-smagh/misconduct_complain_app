import * as d3 from "d3";

export interface BarData {
  group: string;
  category: string;
  value: number;
}

interface ChartOptions {
  selector: string;
  data: BarData[];
  width?: number;
  height?: number;
}

export function drawGroupedBarChart({
  selector,
  data,
  width = 800,
  height = 400,
}: ChartOptions) {
  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", height);

  const margin = { top: 40, right: 30, bottom: 40, left: 60 };
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  const g = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  // Extract groups and categories
  const groups = Array.from(new Set(data.map(d => d.group)));
  const subgroups = Array.from(new Set(data.map(d => d.category)));

  const x0 = d3.scaleBand().domain(groups).range([0, chartWidth]).padding(0.1);
  const x1 = d3.scaleBand().domain(subgroups).range([0, x0.bandwidth()]).padding(0.05);
  const y = d3.scaleLinear().domain([0, d3.max(data, d => d.value)!]).nice().range([chartHeight, 0]);
  const color = d3.scaleOrdinal<string>().domain(subgroups).range(["#f56565", "#ed8936", "#48bb78"]);

  // Axes
  g.append("g")
    .attr("transform", `translate(0,${chartHeight})`)
    .call(d3.axisBottom(x0));

  g.append("g").call(d3.axisLeft(y));

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

  // Draw bars inside the inner group (g)
  g.selectAll("g.bar-group")
    .data(groups)
    .join("g")
    .attr("class", "bar-group")
    .attr("transform", d => `translate(${x0(d)},0)`)
    .selectAll("rect")
    .data(d => data.filter(item => item.group === d))
    .join("rect")
      .attr("x", d => x1(d.category)!)
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => y(0) - y(d.value))
      .attr("fill", d => color(d.category)!)
      .on("mouseover", function (event, d) {
        tooltip.style("opacity", 1)
               .html(`<strong>${d.category}</strong><br/>Count: ${d.value}`);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function () {
        tooltip.style("opacity", 0);
      });
}