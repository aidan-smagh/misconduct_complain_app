import define1 from "./a33468b95d0b15b0@817.js";

function _1(md){return(
md`<div style="color: grey; font: 13px/25.5px var(--sans-serif); text-transform: uppercase;"><h1 style="display: none;">Grouped bar chart</h1><a href="https://d3js.org/">D3</a> › <a href="/@d3/gallery">Gallery</a></div>

# Grouped bar chart

Compare to a [stacked bar chart](/@d3/stacked-bar-chart/2). Data: [American Community Survey](/@mbostock/working-with-the-census-api)`
)}

function _key(legend,chart){return(
legend({color: chart.scales.color, title: "Age (years)"})
)}

function _chart(d3,data)
{
  // Specify the chart’s dimensions.
  const width = 928;
  const height = 600;
  const marginTop = 10;
  const marginRight = 10;
  const marginBottom = 20;
  const marginLeft = 40;

  // Prepare the scales for positional and color encodings.
  // Fx encodes the state.
  const fx = d3.scaleBand()
      .domain(new Set(data.map(d => d.state)))
      .rangeRound([marginLeft, width - marginRight])
      .paddingInner(0.1);

  // Both x and color encode the age class.
  const ages = new Set(data.map(d => d.age));

  const x = d3.scaleBand()
      .domain(ages)
      .rangeRound([0, fx.bandwidth()])
      .padding(0.05);

  const color = d3.scaleOrdinal()
      .domain(ages)
      .range(d3.schemeSpectral[ages.size])
      .unknown("#ccc");

  // Y encodes the height of the bar.
  const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => d.population)]).nice()
      .rangeRound([height - marginBottom, marginTop]);

  // A function to format the value in the tooltip.
  const formatValue = x => isNaN(x) ? "N/A" : x.toLocaleString("en")

  // Create the SVG container.
  const svg = d3.create("svg")
      .attr("width", width)
      .attr("height", height)
      .attr("viewBox", [0, 0, width, height])
      .attr("style", "max-width: 100%; height: auto;");

  // Append a group for each state, and a rect for each age.
  svg.append("g")
    .selectAll()
    .data(d3.group(data, d => d.state))
    .join("g")
      .attr("transform", ([state]) => `translate(${fx(state)},0)`)
    .selectAll()
    .data(([, d]) => d)
    .join("rect")
      .attr("x", d => x(d.age))
      .attr("y", d => y(d.population))
      .attr("width", x.bandwidth())
      .attr("height", d => y(0) - y(d.population))
      .attr("fill", d => color(d.age));

  // Append the horizontal axis.
  svg.append("g")
      .attr("transform", `translate(0,${height - marginBottom})`)
      .call(d3.axisBottom(fx).tickSizeOuter(0))
      .call(g => g.selectAll(".domain").remove());

  // Append the vertical axis.
  svg.append("g")
      .attr("transform", `translate(${marginLeft},0)`)
      .call(d3.axisLeft(y).ticks(null, "s"))
      .call(g => g.selectAll(".domain").remove());

  // Return the chart with the color scale as a property (for the legend).
  return Object.assign(svg.node(), {scales: {color}});
}


async function _data(FileAttachment,d3)
{
  let data = await FileAttachment("us-population-state-age.csv").csv({typed: true});
  const ages = data.columns.slice(1);
  data = d3.sort(data, d => -d3.sum(ages, age => d[age])).slice(0, 6);
  return ages.flatMap((age) => data.map((d) => ({state: d.name, age, population: d[age]})));
}


function _6(md){return(
md`Using [Observable Plot](https://observablehq.com/plot)’s concise API, you can create a similar chart with a [bar mark](https://observablehq.com/plot/marks/bar). See the [Plot: Grouped bar chart](https://observablehq.com/@observablehq/plot-grouped-bar-chart) example notebook.`
)}

function _7(Plot,data){return(
Plot.plot({
  x: {axis: null},
  y: {tickFormat: "s"},
  fx: {label: null},
  color: {scheme: "spectral"},
  marks: [
    Plot.barY(data, {fx: "state", x:"age", y: "population", fill: "age", sort: {color: null, x: null, fx: {value: "-y", reduce: "sum"}}}),
    Plot.ruleY([0])
  ]
})
)}

export default function define(runtime, observer) {
  const main = runtime.module();
  function toString() { return this.url; }
  const fileAttachments = new Map([
    ["us-population-state-age.csv", {url: new URL("./files/cacf3b872e296fd3cf25b9b8762dc0c3aa1863857ecba3f23e8da269c584a4cea9db2b5d390b103c7b386586a1104ce33e17eee81b5cc04ee86929f1ee599bfe.csv", import.meta.url), mimeType: "text/csv", toString}]
  ]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], _1);
  main.variable(observer("key")).define("key", ["legend","chart"], _key);
  main.variable(observer("chart")).define("chart", ["d3","data"], _chart);
  main.variable(observer("data")).define("data", ["FileAttachment","d3"], _data);
  const child1 = runtime.module(define1);
  main.import("legend", child1);
  main.variable(observer()).define(["md"], _6);
  main.variable(observer()).define(["Plot","data"], _7);
  return main;
}
