import { useEffect, useRef, useState } from "react";
import type { Project } from "./model";
import { pageDocument, pageMarkup, runtimeConfig, tokensCss, renderedStyles } from "./renderer";
export function Preview({
  project,
  editing,
  selected,
  mobile,
  onSelect,
  onLink,
}: {
  project: Project;
  editing: boolean;
  selected: string;
  mobile: boolean;
  onSelect: (id: string) => void;
  onLink: (href: string) => void;
}) {
  const frame = useRef<HTMLIFrameElement>(null);
  const [source] = useState(() =>
    pageDocument(project, { editing, selected, bridge: true }),
  );
  const [loaded, setLoaded] = useState(false);
  useEffect(() => {
    const message = (event: MessageEvent) => {
      if (event.source !== frame.current?.contentWindow || !event.data) return;
      if (event.data.type === "playground-ready") setLoaded(true);
      if (
        event.data.type === "playground-select" &&
        project.sections.some((s) => s.id === event.data.id)
      )
        onSelect(event.data.id);
      if (
        event.data.type === "playground-link" &&
        typeof event.data.href === "string"
      )
        onLink(event.data.href);
    };
    window.addEventListener("message", message);
    return () => window.removeEventListener("message", message);
  }, [onSelect, onLink, project.sections]);
  useEffect(() => {
    if (!loaded) return;
    const update = requestAnimationFrame(() =>
      frame.current?.contentWindow?.postMessage(
        {
          type: "playground-update",
          html: pageMarkup(project),
          css: tokensCss(project) + renderedStyles(project),
          config: runtimeConfig(project, editing, selected, true),
        },
        "*",
      ));
    return () => cancelAnimationFrame(update);
  }, [project, editing, selected, loaded]);
  return (
    <iframe
      ref={frame}
      title="Your page preview"
      className={mobile ? "pg-preview mobile" : "pg-preview"}
      sandbox="allow-scripts"
      srcDoc={source}
    />
  );
}
