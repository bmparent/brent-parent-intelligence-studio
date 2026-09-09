import { useState } from "react";
import { labels, createProject, type Project, type SectionType } from "./model";
import { Color, Destination, Field, Range, Toggle } from "./Controls";
import { imageData } from "./storage";
export function Inspector({
  project: p,
  selected,
  edit,
  notify,
}: {
  project: Project;
  selected: SectionType;
  edit: (p: Project, group?: string) => void;
  notify: (message: string) => void;
}) {
  const [tab, setTab] = useState<"content" | "appearance">("appearance");
  const s = p.sections.find((s) => s.id === selected)!;
  const section = (key: string, value: string) =>
    edit(
      {
        ...p,
        sections: p.sections.map((v) =>
          v.id === selected ? { ...v, [key]: value } : v,
        ),
      },
      selected + key,
    );
  const glass = (key: string, value: string | number | boolean) =>
    edit({ ...p, glass: { ...p.glass, [key]: value } }, "glass" + key);
  const token = (key: string, value: string | number) =>
    edit({ ...p, tokens: { ...p.tokens, [key]: value } }, "token" + key);
  return (
    <aside className="pg-inspector" aria-label="Design controls">
      <div className="pg-panel-heading">
        <h2>{labels[selected]}</h2>
        <span className="pg-subtle">↗</span>
      </div>
      <div
        className="pg-tabs"
        role="tablist"
        aria-label="Inspector"
        onKeyDown={(e) => {
          if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
            e.preventDefault();
            const next = tab === "content" ? "appearance" : "content";
            setTab(next);
            e.currentTarget
              .querySelector<HTMLButtonElement>(`#pg-${next}-tab`)
              ?.focus();
          }
        }}
      >
        <button
          role="tab"
          id="pg-content-tab"
          aria-controls="pg-inspector-panel"
          tabIndex={tab === "content" ? 0 : -1}
          aria-selected={tab === "content"}
          onClick={() => setTab("content")}
        >
          Content
        </button>
        <button
          role="tab"
          id="pg-appearance-tab"
          aria-controls="pg-inspector-panel"
          tabIndex={tab === "appearance" ? 0 : -1}
          aria-selected={tab === "appearance"}
          onClick={() => setTab("appearance")}
        >
          Appearance
        </button>
      </div>
      <div
        className="pg-inspector-body"
        role="tabpanel"
        id="pg-inspector-panel"
        aria-labelledby={`pg-${tab}-tab`}
      >
        {tab === "content" ? (
          <>
            <Field
              label={
                selected === "header" || selected === "footer"
                  ? "Brand name"
                  : "Heading"
              }
              value={s.title}
              onChange={(v) => section("title", v)}
              multiline={selected !== "header" && selected !== "footer"}
              maxLength={240}
            />
            <Field
              label={
                selected === "header"
                  ? "Navigation labels"
                  : selected === "services"
                    ? "Services"
                    : "Description"
              }
              value={s.description}
              onChange={(v) => section("description", v)}
              multiline
              hint={
                selected === "services"
                  ? "One service per line, up to six."
                  : selected === "header"
                    ? "Two labels separated by |, linking to Work and Services."
                    : undefined
              }
            />
            {["header", "hero", "contact"].includes(selected) && (
              <>
                <Field
                  label="Button text"
                  value={s.cta}
                  onChange={(v) => section("cta", v)}
                  maxLength={100}
                />
                <Destination
                  key={selected + s.href}
                  value={s.href}
                  onChange={(v) => section("href", v)}
                />
              </>
            )}
            {["hero", "work"].includes(selected) && (
              <>
                <label className="pg-upload">
                  {s.image ? "Replace image" : "Upload an image"}
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      e.target.value = "";
                      if (!file) return;
                      try {
                        const data = await imageData(file);
                        section("image", data);
                        notify(
                          "Image added. It will travel with your project and export.",
                        );
                      } catch (error) {
                        notify((error as Error).message);
                      }
                    }}
                  />
                </label>
                <small className="pg-subtle">
                  PNG, JPEG, WebP · up to 8 MB
                </small>
                {s.image && (
                  <>
                    <Field
                      label="Image description"
                      value={s.alt}
                      onChange={(v) => section("alt", v)}
                      maxLength={300}
                    />
                    <button
                      className="pg-text-button"
                      onClick={() => section("image", "")}
                    >
                      Use original artwork
                    </button>
                  </>
                )}
              </>
            )}
          </>
        ) : (
          <>
            {selected === "header" ? (
              <>
                <Toggle
                  label="Glass after scrolling"
                  checked={p.glass.enabled}
                  onChange={(v) => glass("enabled", v)}
                />
                <Range
                  label="Frost"
                  value={p.glass.frost}
                  min={0}
                  max={16}
                  step={0.1}
                  unit="px"
                  onChange={(v) => glass("frost", v)}
                />
                <Range
                  label="Edge light"
                  value={p.glass.edge}
                  min={0}
                  max={1}
                  step={0.01}
                  onChange={(v) => glass("edge", v)}
                />
                <Range
                  label="Prism color"
                  value={p.glass.prism}
                  min={0}
                  max={0.8}
                  step={0.01}
                  onChange={(v) => glass("prism", v)}
                />
                <Range
                  label="Touch response"
                  value={p.glass.touch}
                  min={0}
                  max={6}
                  step={0.1}
                  onChange={(v) => glass("touch", v)}
                />
                <Range
                  label="Corner radius"
                  value={p.glass.radius}
                  min={0}
                  max={48}
                  unit="px"
                  onChange={(v) => glass("radius", v)}
                />
                <details>
                  <summary>Advanced settings</summary>
                  <Color
                    label="Solid header"
                    value={p.glass.solid}
                    onChange={(v) => glass("solid", v)}
                  />
                  <Range
                    label="Response speed"
                    value={p.glass.response}
                    min={10}
                    max={60}
                    onChange={(v) => glass("response", v)}
                  />
                  <Range
                    label="Solid through"
                    value={p.glass.start}
                    min={0}
                    max={32}
                    unit="px"
                    onChange={(v) => glass("start", v)}
                  />
                  <Range
                    label="Fully glass at"
                    value={p.glass.end}
                    min={40}
                    max={200}
                    unit="px"
                    onChange={(v) => glass("end", v)}
                  />
                  <button
                    className="pg-text-button"
                    onClick={() => edit({ ...p, glass: createProject().glass })}
                  >
                    Restore approved settings
                  </button>
                </details>
                <p className="pg-help">
                  Scroll the preview to see the glass appear. Move your pointer
                  along its edges.
                </p>
              </>
            ) : (
              <>
                {selected === "hero" && (
                  <div className="pg-field">
                    <label htmlFor="hero-layout">Layout</label>
                    <select
                      id="hero-layout"
                      value={s.layout}
                      onChange={(e) => section("layout", e.target.value)}
                    >
                      <option value="split">Split composition</option>
                      <option value="center">Centered composition</option>
                    </select>
                  </div>
                )}
                <p className="pg-subtle">
                  These settings shape the whole page.
                </p>
                <Color
                  label="Background"
                  value={p.tokens.background}
                  onChange={(v) => token("background", v)}
                />
                <Color
                  label="Text"
                  value={p.tokens.foreground}
                  onChange={(v) => token("foreground", v)}
                />
                <Color
                  label="Accent"
                  value={p.tokens.accent}
                  onChange={(v) => token("accent", v)}
                />
                <div className="pg-field">
                  <label htmlFor="typeface">Typography</label>
                  <select
                    id="typeface"
                    value={p.tokens.font}
                    onChange={(e) => token("font", e.target.value)}
                  >
                    <option value="editorial">Editorial · Serif</option>
                    <option value="modern">Modern · Sans</option>
                  </select>
                </div>
                <Range
                  label="Type scale"
                  value={p.tokens.typeScale}
                  min={0.75}
                  max={1.3}
                  step={0.01}
                  unit="×"
                  onChange={(v) => token("typeScale", v)}
                />
                <Range
                  label="Section spacing"
                  value={p.tokens.spacing}
                  min={32}
                  max={128}
                  unit="px"
                  onChange={(v) => token("spacing", v)}
                />
                <Range
                  label="Corners"
                  value={p.tokens.radius}
                  min={0}
                  max={48}
                  unit="px"
                  onChange={(v) => token("radius", v)}
                />
                <Range
                  label="Maximum page width"
                  value={p.tokens.width}
                  min={960}
                  max={1600}
                  step={20}
                  unit="px"
                  onChange={(v) => token("width", v)}
                />
              </>
            )}
            <Toggle
              label="Reduce motion"
              checked={p.glass.reducedMotion}
              onChange={(v) => glass("reducedMotion", v)}
            />
          </>
        )}
      </div>
    </aside>
  );
}
