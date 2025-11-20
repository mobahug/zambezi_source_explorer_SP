import { useEffect, useRef } from "react";
import * as d3 from "d3";

interface TelemetryPoint {
  time: number;
  hr: number;
  ph: number;
}

interface TelemetryChartProps {
  data: TelemetryPoint[];
}

const TelemetryChart = ({ data }: TelemetryChartProps) => {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = svgRef.current?.clientWidth ?? 320;
    const height = 220;
    svg.attr("viewBox", `0 0 ${width} ${height}`);

    svg.selectAll("*").remove();

    const margin = { top: 12, right: 32, bottom: 28, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const timeExtent = d3.extent(data, (d) => d.time);
    const xDomain: [number, number] = [timeExtent[0] ?? 0, timeExtent[1] ?? 1];

    const hrExtent = d3.extent(data, (d) => d.hr);
    const phExtent = d3.extent(data, (d) => d.ph);

    const yDomainHr: [number, number] = [
      Math.min(hrExtent[0] ?? 80, 80),
      Math.max(hrExtent[1] ?? 160, 160),
    ];
    const yDomainPh: [number, number] = [
      Math.min(phExtent[0] ?? 6.6, 6.4),
      Math.max(phExtent[1] ?? 7.4, 7.6),
    ];

    const xScale = d3.scaleLinear().domain(xDomain).range([0, innerWidth]);
    const yScaleHr = d3
      .scaleLinear()
      .domain(yDomainHr)
      .nice()
      .range([innerHeight, 0]);
    const yScalePh = d3.scaleLinear().domain(yDomainPh).range([innerHeight, 0]);

    const xAxis = d3
      .axisBottom(xScale)
      .ticks(5)
      .tickFormat((d) => `${d}s`);
    const yAxis = d3
      .axisLeft(yScaleHr)
      .ticks(4)
      .tickSize(-innerWidth)
      .tickFormat((d) => `${d} bpm` as string);

    g.append("g")
      .attr("transform", `translate(0,${innerHeight})`)
      .call(xAxis)
      .selectAll("text")
      .style("fill", "#94a3b8");

    g.append("g").call(yAxis).selectAll("text").style("fill", "#94a3b8");

    g.selectAll(".tick line")
      .attr("stroke", "rgba(255,255,255,0.05)")
      .attr("stroke-dasharray", "2,4");

    g.selectAll(".domain").attr("stroke", "rgba(255,255,255,0.2)");

    const lineHr = d3
      .line<TelemetryPoint>()
      .defined((d) => Number.isFinite(d.hr))
      .x((d) => xScale(d.time))
      .y((d) => yScaleHr(d.hr));

    const linePh = d3
      .line<TelemetryPoint>()
      .defined((d) => Number.isFinite(d.ph))
      .x((d) => xScale(d.time))
      .y((d) => yScalePh(d.ph));

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#f97316")
      .attr("stroke-width", 2.5)
      .attr("d", lineHr);

    g.append("path")
      .datum(data)
      .attr("fill", "none")
      .attr("stroke", "#22c55e")
      .attr("stroke-width", 2)
      .attr("stroke-dasharray", "6,4")
      .attr("d", linePh);

    g.append("text")
      .attr("x", innerWidth - 4)
      .attr("y", 12)
      .attr("text-anchor", "end")
      .attr("fill", "#f97316")
      .attr("font-size", 11)
      .text("Heart rate");

    g.append("text")
      .attr("x", innerWidth - 4)
      .attr("y", 28)
      .attr("text-anchor", "end")
      .attr("fill", "#22c55e")
      .attr("font-size", 11)
      .text("Water pH");
  }, [data]);

  return (
    <svg
      ref={svgRef}
      role="img"
      aria-label="Telemetry chart"
      width="100%"
      height={240}
    />
  );
};

export default TelemetryChart;
