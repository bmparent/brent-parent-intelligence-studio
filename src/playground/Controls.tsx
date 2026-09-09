import { safeHref } from "./model";
import { useId, useState, type ReactNode } from "react";
export function Field({
  label,
  value,
  onChange,
  multiline = false,
  hint,
  maxLength = 2000,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  multiline?: boolean;
  hint?: string;
  maxLength?: number;
}) {
  const id = useId();
  return (
    <div className="pg-field">
      <label htmlFor={id}>{label}</label>
      {multiline ? (
        <textarea
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={3}
          maxLength={maxLength}
        />
      ) : (
        <input
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          maxLength={maxLength}
        />
      )}
      {hint && <small>{hint}</small>}
    </div>
  );
}
export function Range({
  label,
  value,
  min,
  max,
  step = 1,
  unit = "",
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  onChange: (v: number) => void;
}) {
  const id = useId();
  return (
    <div className="pg-range">
      <div>
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>
          {Number(value.toFixed(2))}
          {unit}
        </output>
      </div>
      <input
        id={id}
        style={{
          background: `linear-gradient(to right, #97d23a ${((value - min) / (max - min)) * 100}%, #e5e8ec ${((value - min) / (max - min)) * 100}%)`,
        }}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
      />
    </div>
  );
}
export function Toggle({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="pg-toggle">
      <span>{label}</span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
      />
      <span className="pg-switch" aria-hidden="true" />
    </label>
  );
}
export function Color({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="pg-color">
      <span>{label}</span>
      <span>
        <input
          aria-label={label}
          type="color"
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
        <code>{value}</code>
      </span>
    </label>
  );
}
export function Icon({ name }: { name: string }) {
  const paths: Record<string, ReactNode> = {
    header: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 9h18" />
      </>
    ),
    hero: (
      <>
        <rect x="3" y="3" width="18" height="18" rx="2" />
        <path d="m3 17 6-6 4 4 3-3 5 5" />
        <circle cx="16" cy="8" r="1" />
      </>
    ),
    services: (
      <>
        <rect x="3" y="3" width="6" height="6" />
        <rect x="15" y="3" width="6" height="6" />
        <rect x="3" y="15" width="6" height="6" />
        <rect x="15" y="15" width="6" height="6" />
      </>
    ),
    work: <rect x="3" y="3" width="18" height="18" rx="1" />,
    contact: (
      <>
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m3 6 9 7 9-7" />
      </>
    ),
    footer: (
      <>
        <rect x="3" y="4" width="18" height="16" rx="2" />
        <path d="M3 15h18" />
      </>
    ),
    desktop: (
      <>
        <rect x="2" y="3" width="20" height="14" rx="2" />
        <path d="M12 17v4m-5 0h10" />
      </>
    ),
    mobile: (
      <>
        <rect x="6" y="2" width="12" height="20" rx="2" />
        <path d="M10 18h4" />
      </>
    ),
    undo: (
      <>
        <path d="m9 4-6 6 6 6M3 10h12a6 6 0 0 1 0 12" />
      </>
    ),
    redo: (
      <>
        <path d="m15 4 6 6-6 6m6-6H9a6 6 0 0 0 0 12" />
      </>
    ),
    eye: (
      <>
        <path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    check: <path d="m5 12 4 4L19 6" />,
    export: (
      <>
        <path d="M12 3v12m-5-5 5 5 5-5M4 16v5h16v-5" />
      </>
    ),
  };
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.work}
    </svg>
  );
}

export function Destination({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  const [draft, setDraft] = useState(value);
  const id = useId();
  const invalid = !!draft && safeHref(draft) === "#" && draft !== "#";
  return (
    <div className="pg-field">
      <label htmlFor={id}>Button destination</label>
      <input
        id={id}
        value={draft}
        maxLength={1000}
        aria-invalid={invalid}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={() => {
          if (!invalid) onChange(draft);
        }}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !invalid) onChange(draft);
          if (e.key === "Escape") setDraft(value);
        }}
      />
      <small>
        {invalid
          ? "Use a complete link. Your last valid destination is kept."
          : "Use https://, #work, #contact, mailto:, or tel:. Press Enter to apply."}
      </small>
    </div>
  );
}
