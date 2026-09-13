import { useId, useState, useEffect, useRef } from "react";
import { useStore } from "../lib/store";
import {
  series,
  metricInfo,
  formatValue,
  dateLabel,
  weekday,
} from "../lib/data";
import type { Metric } from "../lib/types";
import { Icon } from "./Icon";
export function MetricTabs({
  value,
  onChange,
}: {
  value: Metric;
  onChange: (value: Metric) => void;
}) {
  return (
    <div className="segmented" aria-label="Measurement">
      {(["sleep", "steps", "energy"] as Metric[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          aria-pressed={value === m}
          className={value === m ? "active" : ""}
        >
          {metricInfo[m].name}
        </button>
      ))}
    </div>
  );
}
export function MiniChart({ metric }: { metric: Metric }) {
  const { state } = useStore();
  const data = series(state, metric);
  const max = Math.max(...data.map((d) => d.value ?? 0), 1);
  const path = data
    .map((d, i) =>
      d.value == null
        ? ""
        : `${i === 0 || data[i - 1].value == null ? "M" : "L"}${i * 17 + 3},${40 - (d.value / max) * 32}`,
    )
    .join(" ");
  return (
    <svg viewBox="0 0 112 45" className="mini-chart" aria-hidden="true">
      {metric === "steps" ? (
        data.map((d, i) => (
          <rect
            key={d.date}
            x={i * 15}
            y={40 - ((d.value ?? 0) / max) * 32}
            width="7"
            height={((d.value ?? 0) / max) * 32}
            rx="1"
            fill="currentColor"
            opacity={0.25 + i * 0.1}
          />
        ))
      ) : (
        <path d={path} fill="none" stroke="currentColor" strokeWidth="2" />
      )}
    </svg>
  );
}
export function Chart({
  metric,
  days = 7,
  compact = false,
}: {
  metric: Metric;
  days?: number;
  compact?: boolean;
}) {
  const { state } = useStore();
  const rows = series(state, metric, days);
  const [selected, setSelected] = useState<string | null>(null);
  const [table, setTable] = useState(false);
  const [hover, setHover] = useState<string | null>(null);
  const uid = useId().replaceAll(":", "");
  const info = metricInfo[metric];
  const [width, setWidth] = useState(720);
  const chartRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = chartRef.current;
    if (!el) return;
    const update = () => {
      if (el.clientWidth > 0) setWidth(Math.max(250, el.clientWidth));
    };
    update();
    if (typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, []);
  const height = 230,
    left = 44,
    right = 22,
    top = 14,
    bottom = 34;
  const rawMax = Math.max(...rows.map((r) => r.value ?? 0));
  const tickStep =
    metric === "steps"
      ? Math.max(4000, Math.ceil(rawMax / 4 / 4000) * 4000)
      : metric === "sleep"
        ? Math.max(2, Math.ceil(rawMax / 5 / 2) * 2)
        : 1;
  const max =
    metric === "energy"
      ? 5
      : Math.max(
          metric === "sleep" ? 10 : 12000,
          Math.ceil(rawMax / tickStep) * tickStep,
        );
  const ticks = Array.from(
    { length: max / tickStep + 1 },
    (_, i) => i * tickStep,
  );
  const labelCount = Math.max(
    3,
    Math.min(7, Math.floor((width - left - right) / 65)),
  );
  const labelIndexes = new Set(
    Array.from({ length: labelCount }, (_, i) =>
      Math.round((i * (days - 1)) / (labelCount - 1)),
    ),
  );
  const x = (i: number) => left + (i * (width - left - right)) / (days - 1);
  const y = (v: number) => top + ((max - v) / max) * (height - top - bottom);
  const segments: string[] = [];
  let segment = "";
  rows.forEach((r, i) => {
    if (r.value == null) {
      if (segment) segments.push(segment);
      segment = "";
    } else segment += `${segment ? " L" : "M"}${x(i)} ${y(r.value)}`;
  });
  if (segment) segments.push(segment);
  const chosen = rows.find((r) => r.date === (hover || selected));
  const current = rows.find((r) => r.date === selected);
  return (
    <div
      className="chart"
      style={{ "--chart-color": info.color } as React.CSSProperties}
    >
      <div className="chart-meta">
        <span>
          {info.name} ({info.unit})
        </span>
        <span>
          {dateLabel(rows[0].date, true)} – {dateLabel(rows.at(-1)!.date, true)}
        </span>
      </div>
      <div className="chart-canvas" ref={chartRef}>
        <svg
          viewBox={`0 0 ${width} ${height}`}
          aria-label={`${info.name} across ${days} days. Select a day or use View values for the data table.`}
          role="group"
        >
          <defs>
            <linearGradient id={uid} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={info.color} stopOpacity=".17" />
              <stop offset="100%" stopColor={info.color} stopOpacity=".015" />
            </linearGradient>
          </defs>
          {ticks.map((v) => (
            <g key={v}>
              <line
                x1={left}
                y1={y(v)}
                x2={width - right}
                y2={y(v)}
                className="grid-line"
              />
              <text x={left - 12} y={y(v) + 4} textAnchor="end">
                {metric === "steps"
                  ? `${Math.round(v / 1000)}k`
                  : Number(v.toFixed(1))}
                {metric === "sleep" ? "h" : ""}
              </text>
            </g>
          ))}
          {segments.map((d, i) => {
            const coords = d.match(/[\d.]+/g)!;
            const first = coords[0],
              last = coords.at(-2);
            return (
              <g key={i}>
                <path
                  d={`${d} L${last} ${y(0)} L${first} ${y(0)} Z`}
                  fill={`url(#${uid})`}
                />
                <path
                  d={d}
                  fill="none"
                  stroke={info.color}
                  strokeWidth="2.7"
                  strokeLinejoin="round"
                />
              </g>
            );
          })}
          {rows.map((r, i) => (
            <g key={r.date}>
              <line
                x1={x(i)}
                x2={x(i)}
                y1={top}
                y2={height - bottom}
                stroke="#e9eef2"
                strokeDasharray={r.value == null ? "3 5" : undefined}
              />
              {r.value != null && (
                <circle
                  cx={x(i)}
                  cy={y(r.value)}
                  r={selected === r.date ? 6 : 3.7}
                  fill={info.color}
                  stroke="white"
                  strokeWidth="1.5"
                />
              )}
              {(days === 7 || labelIndexes.has(i)) && (
                <text x={x(i)} y={height - 10} textAnchor="middle">
                  {days === 7 ? weekday(r.date) : dateLabel(r.date, true)}
                </text>
              )}
              <rect
                x={Math.max(
                  left - 8,
                  x(i) - (width - left - right) / (days - 1) / 2,
                )}
                y={top}
                width={(width - left - right) / (days - 1)}
                height={height - top - bottom}
                fill="transparent"
                role="button"
                tabIndex={0}
                aria-label={`${dateLabel(r.date)}: ${formatValue(r.value, metric)}. Show source.`}
                onClick={() => setSelected(r.date)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setSelected(r.date);
                  }
                }}
                onMouseEnter={() => setHover(r.date)}
                onMouseLeave={() => setHover(null)}
              >
                <title>
                  {dateLabel(r.date)} · {formatValue(r.value, metric)}
                </title>
              </rect>
            </g>
          ))}
        </svg>
        {chosen && hover && (
          <div className="chart-tooltip" role="status">
            <strong>{formatValue(chosen.value, metric)}</strong>
            <span>{dateLabel(chosen.date, true)}</span>
          </div>
        )}
      </div>
      <div className="chart-legend">
        <span>
          <i />
          Recorded {metric === "steps" ? "steps" : metric}
        </span>
        <span className="chart-instruction">
          Select a day to see the source. Gaps mean no record.
        </span>
        <button className="text-button" onClick={() => setTable(!table)}>
          {table ? "Hide values" : "View values"}
        </button>
      </div>
      {current && (
        <div className="source-detail" role="status">
          <Icon name="file" size={20} />
          <div>
            <strong>
              {dateLabel(current.date)} · {formatValue(current.value, metric)}
            </strong>
            <p>
              {current.record
                ? `${state.connections.find((c) => c.id === current.record!.sourceId)?.name || current.record.sourceId} · ${current.record.unit} · Fictional demo record`
                : "No observation is available for this day. It is excluded from averages."}
            </p>
            {current.record && (
              <small>
                Record {current.record.id}
                {current.alternatives > 0
                  ? ` · ${current.alternatives} additional source(s); preferred source shown, not added together.`
                  : ""}
              </small>
            )}
          </div>
          <button
            className="icon-button"
            aria-label="Close source details"
            onClick={() => setSelected(null)}
          >
            <Icon name="close" size={16} />
          </button>
        </div>
      )}
      {table && (
        <div className={`table-wrap ${compact ? "table-compact" : ""}`}>
          <table>
            <caption className="sr-only">{info.name} data and sources</caption>
            <thead>
              <tr>
                <th>Date</th>
                <th>Value</th>
                <th>Source</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.date}>
                  <td>{dateLabel(r.date, true)}</td>
                  <td>{formatValue(r.value, metric)}</td>
                  <td>
                    {r.record
                      ? state.connections.find(
                          (c) => c.id === r.record!.sourceId,
                        )?.name || r.record.sourceId
                      : "No record"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
