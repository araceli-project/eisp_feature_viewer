import * as d3 from "d3";
import type { FeatureData, RenderFeatureDataOptions } from "./feature_data";
import {
  ColorTypeForProxyTask,
  getColorForValue,
  getLabelOrderForProxyTask,
  getReadableTextColor,
} from "./proxy_colors";

const MAX_VISIBLE_CATEGORIES = 10;
type ChartDatum = { label: string; count: number };

function limitToTopCategories(orderedData: ChartDatum[]): ChartDatum[] {
  if (orderedData.length <= MAX_VISIBLE_CATEGORIES) {
    return orderedData;
  }

  const topLabels = new Set(
    [...orderedData]
      .sort((a, b) => b.count - a.count)
      .slice(0, MAX_VISIBLE_CATEGORIES)
      .map(({ label }) => label),
  );

  return orderedData.filter(({ label }) => topLabels.has(label));
}

export function multipleDataBarChart(
  featureData: FeatureData,
  proxyTaskName: string,
  selected_points: number[],
  options: RenderFeatureDataOptions = {},
): SVGSVGElement {
  const multipleResults = featureData.multiple_results[proxyTaskName];
  if (!multipleResults) {
    throw new Error(
      `Proxy task "${proxyTaskName}" was not found in multiple results.`,
    );
  }

  const selectedLabels = selected_points.map((index) =>
    index < multipleResults.length ? multipleResults[index] : "Unknown",
  );
  const flattenedLabels = selectedLabels.flat();
  const labelCounts: Record<string, number> = {};
  flattenedLabels.forEach((label) => {
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  const data = Object.entries(labelCounts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .filter((d) => d.label !== "no_faces");
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
  const limitedData = limitToTopCategories(orderedData);

  const width = options.width ?? 400;
  const height = options.height ?? 300;
  const margin = { top: 32, right: 36, bottom: 120, left: 72 };

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const x = d3
    .scaleBand()
    .domain(limitedData.map((d) => d.label))
    .range([margin.left, width - margin.right])
    .padding(0.1);

  const y = d3
    .scaleLinear()
    .domain([0, d3.max(limitedData, (d) => d.count) ?? 0])
    .nice()
    .range([height - margin.bottom, margin.top]);

  svg
    .append("g")
    .selectAll("rect")
    .data(limitedData)
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

export function multipleDataPieChart(
  featureData: FeatureData,
  proxyTaskName: string,
  selected_points: number[],
  options: RenderFeatureDataOptions = {},
): SVGSVGElement {
  const multipleResults = featureData.multiple_results[proxyTaskName];
  if (!multipleResults) {
    throw new Error(
      `Proxy task "${proxyTaskName}" was not found in multiple results.`,
    );
  }

  const selectedLabels = selected_points.map((index) =>
    index < multipleResults.length ? multipleResults[index] : "Unknown",
  );
  const flattenedLabels = selectedLabels.flat();
  const labelCounts: Record<string, number> = {};
  flattenedLabels.forEach((label) => {
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  const data = Object.entries(labelCounts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .filter((d) => d.label !== "no_faces");
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
  const limitedData = limitToTopCategories(orderedData);

  const width = options.width ?? 400;
  const height = options.height ?? 300;
  const margin = { top: 32, right: 36, bottom: 56, left: 72 };

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const radius =
    Math.min(width, height) / 2 - Math.max(...Object.values(margin));

  const pie = d3.pie<{ label: string; count: number }>().value((d) => d.count);
  const arcs = pie(limitedData);

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
    .attr("fill", (d) =>
      getReadableTextColor(
        getColorForValue(d.data.label, labelOrder, colorSchemeType),
      ),
    )
    .attr("font-size", 11)
    .text((d) => d.data.label);

  return svg.node() as SVGSVGElement;
}

export function multipleDataStackedBarChart(
  featureData: FeatureData,
  proxyTaskName: string,
  selected_points: number[],
  options: RenderFeatureDataOptions = {},
): SVGSVGElement {
  const multipleResults = featureData.multiple_results[proxyTaskName];
  if (!multipleResults) {
    throw new Error(
      `Proxy task "${proxyTaskName}" was not found in multiple results.`,
    );
  }

  const selectedLabels = selected_points.map((index) =>
    index < multipleResults.length ? multipleResults[index] : "Unknown",
  );
  const flattenedLabels = selectedLabels.flat();
  const labelCounts: Record<string, number> = {};
  flattenedLabels.forEach((label) => {
    labelCounts[label] = (labelCounts[label] || 0) + 1;
  });

  const data = Object.entries(labelCounts)
    .map(([label, count]) => ({
      label,
      count,
    }))
    .filter((d) => d.label !== "no_faces");
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
  const limitedData = limitToTopCategories(orderedData);

  const width = options.width ?? 400;
  const height = options.height ?? 300;
  const margin = { top: 32, right: 36, bottom: 56, left: 72 };

  const svg = d3.create("svg").attr("width", width).attr("height", height);

  const totalCount = d3.sum(limitedData, (d) => d.count);
  const stackedData = limitedData.reduce<
    { label: string; count: number; start: number; end: number }[]
  >((acc, d) => {
    const start = acc.length > 0 ? acc[acc.length - 1].end : 0;
    acc.push({ ...d, start, end: start + d.count });
    return acc;
  }, []);

  const x = d3
    .scaleLinear()
    .domain([0, Math.max(totalCount, 1)])
    .range([margin.left, width - margin.right])
    .nice();

  const y = d3
    .scaleBand()
    .domain(["Selected"])
    .range([margin.top, height - margin.bottom])
    .paddingInner(0.2);
  const barY = y("Selected");
  if (barY === undefined) {
    throw new Error(`Stacked bar category could not be mapped to the y axis.`);
  }

  svg
    .append("g")
    .selectAll("rect")
    .data(stackedData)
    .join("rect")
    .attr("x", (d) => x(d.start))
    .attr("y", barY)
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d.end) - x(d.start))
    .attr("fill", (d) =>
      getColorForValue(d.label, labelOrder, colorSchemeType),
    );

  svg
    .append("g")
    .selectAll("text")
    .data(stackedData)
    .join("text")
    .attr(
      "transform",
      (d) =>
        `translate(${(x(d.start) + x(d.end)) / 2},${barY + y.bandwidth() / 2}) rotate(-45)`,
    )
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "middle")
    .attr("fill", (d) =>
      getReadableTextColor(
        getColorForValue(d.label, labelOrder, colorSchemeType),
      ),
    )
    .attr("font-size", 11)
    .text((d) => d.label)
    .style("display", (d) => (x(d.end) - x(d.start) >= 30 ? null : "none"));

  svg
    .append("g")
    .attr("transform", `translate(0,${height - margin.bottom})`)
    .call(d3.axisBottom(x).ticks(Math.min(10, totalCount || 1), "d"));

  svg
    .append("g")
    .attr("transform", `translate(${margin.left},0)`)
    .call(d3.axisLeft(y));

  return svg.node() as SVGSVGElement;
}
