import * as d3 from "d3";
import type { FeatureData, RenderFeatureDataOptions } from "./feature_data";
import {
  ColorTypeForProxyTask,
  getColorForValue,
  getLabelOrderForProxyTask,
} from "./proxy_colors";

// Bar chart showing the count of points in each class for a selected proxy task, based on the selected points in the scatter plot.
export function classificationBarChart(
  featureData: FeatureData,
  proxyTaskName: string,
  selected_points: number[],
  options: RenderFeatureDataOptions = {},
): SVGSVGElement {
  const classificationResults =
    featureData.classification_results[proxyTaskName];
  if (!classificationResults) {
    throw new Error(
      `Proxy task "${proxyTaskName}" was not found in classification results.`,
    );
  }

  const selectedLabels = selected_points
    .map((index) =>
      index < classificationResults.length
        ? String(classificationResults[index])
        : "Unknown",
    )
    .filter((label) => label !== "Unknown");
  const labelCounts: Record<string, number> = {};
  selectedLabels.forEach((label) => {
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  const data = Object.entries(labelCounts).map(([label, count]) => ({
    label,
    count,
  }));
  const labelOrder = getLabelOrderForProxyTask(
    proxyTaskName,
    data.map(({ label }) => label),
  );
  const colorSchemeType = ColorTypeForProxyTask[proxyTaskName];
  const labelOrderIndex = new Map(
    labelOrder.map((label, index) => [label, index]),
  );
  const orderedData = [...data].sort(
    (a, b) =>
      (labelOrderIndex.get(a.label) ?? Number.MAX_SAFE_INTEGER) -
      (labelOrderIndex.get(b.label) ?? Number.MAX_SAFE_INTEGER),
  );

  const width = options.width ?? 400;
  const height = options.height ?? 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const x = d3
    .scaleBand()
    .domain(orderedData.map((d) => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(orderedData, (d) => d.count) ?? 0])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .append("g")
    .selectAll("rect")
    .data(orderedData)
    .join("rect")
    .attr("x", (d) => {
      const xValue = x(d.label);
      if (xValue === undefined) {
        throw new Error(
          `Label "${d.label}" could not be mapped to the x axis.`,
        );
      }
      return xValue;
    })
    .attr("y", (d) => y(d.count))
    .attr("height", (d) => y(0) - y(d.count))
    .attr("width", x.bandwidth())
    .attr("fill", (d) =>
      getColorForValue(d.label, labelOrder, colorSchemeType),
    );

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x))
    .selectAll("text")
    .attr("transform", "rotate(-45)")
    .style("text-anchor", "end");

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  return svg.node() as SVGSVGElement;
}

export function classificationPieChart(
  featureData: FeatureData,
  proxyTaskName: string,
  selected_points: number[],
  options: RenderFeatureDataOptions = {},
): SVGSVGElement {
  // Similar to the bar chart, but creates a pie chart instead.

  const classificationResults =
    featureData.classification_results[proxyTaskName];
  if (!classificationResults) {
    throw new Error(
      `Proxy task "${proxyTaskName}" was not found in classification results.`,
    );
  }

  const selectedLabels = selected_points
    .map((index) =>
      index < classificationResults.length
        ? String(classificationResults[index])
        : "Unknown",
    )
    .filter((label) => label !== "Unknown");
  const labelCounts: Record<string, number> = {};
  selectedLabels.forEach((label) => {
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  const data = Object.entries(labelCounts).map(([label, count]) => ({
    label,
    count,
  }));
  const labelOrder = getLabelOrderForProxyTask(
    proxyTaskName,
    data.map(({ label }) => label),
  );
  const colorSchemeType = ColorTypeForProxyTask[proxyTaskName];
  const labelOrderIndex = new Map(
    labelOrder.map((label, index) => [label, index]),
  );
  const orderedData = [...data].sort(
    (a, b) =>
      (labelOrderIndex.get(a.label) ?? Number.MAX_SAFE_INTEGER) -
      (labelOrderIndex.get(b.label) ?? Number.MAX_SAFE_INTEGER),
  );

  const width = options.width ?? 400;
  const height = options.height ?? 300;
  const margin = { top: 20, right: 20, bottom: 50, left: 60 };

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const radius =
    Math.min(width, height) / 2 - Math.max(...Object.values(margin));

  const pie = d3.pie<{ label: string; count: number }>().value((d) => d.count);
  const arcs = pie(orderedData);

  const arcGenerator = d3
    .arc<d3.PieArcDatum<{ label: string; count: number }>>()
    .innerRadius(0)
    .outerRadius(radius);
  const labelArcGenerator = d3
    .arc<d3.PieArcDatum<{ label: string; count: number }>>()
    .innerRadius(radius * 0.65)
    .outerRadius(radius * 0.65);

  const g = svg
    .append("g")
    .attr("transform", `translate(${width / 2},${height / 2})`);

  g.selectAll("path")
    .data(arcs)
    .join("path")
    .attr("d", arcGenerator)
    .attr("fill", (d) =>
      getColorForValue(d.data.label, labelOrder, colorSchemeType),
    );

  g.selectAll(".slice-label")
    .data(arcs)
    .join("text")
    .attr("class", "slice-label")
    .attr("transform", (d) => `translate(${labelArcGenerator.centroid(d)})`)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", "#ffffff")
    .attr("font-size", 11)
    .text((d) => d.data.label);

  return svg.node() as SVGSVGElement;
}
