import { useState, useEffect, useRef } from "react";
import { useStore } from "./lib/store";
import { dateLabel } from "./lib/data";
import type { Page } from "./lib/types";
import { Icon } from "./components/Icon";
import { Checkin } from "./components/Checkin";
import { Guide } from "./components/Guide";
import { Assistant } from "./components/Assistant";
import { Today } from "./views/Today";
import { Journey } from "./views/Journey";
import { Plan } from "./views/Plan";
import { Connections } from "./views/Connections";
import { Advisor } from "./views/Advisor";
import { Help } from "./views/Help";
import logo from "../public/wellway-logo.svg?raw";
const nav: { id: Page; label: string; icon: string }[] = [
  { id: "today", label: "Today", icon: "home" },
  { id: "journey", label: "My journey", icon: "chart" },
  { id: "plan", label: "My plan", icon: "plan" },
  { id: "connections", label: "Connections", icon: "link" },
  { id: "advisor", label: "Advisor", icon: "user" },
];
function initialPage(): Page {
  const p = location.hash.replace("#", "");
  return [...nav.map((x) => x.id), "help"].includes(p) ? (p as Page) : "today";
}
export default function App() {
  const { state, storageError } = useStore();
  const [page, setPage] = useState<Page>(initialPage);
  const [checkin, setCheckin] = useState(false);
  const [tour, setTour] = useState(false);
  const [assistant, setAssistant] = useState(false);
  const [toast, setToast] = useState("");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const main = useRef<HTMLElement>(null);
  useEffect(() => {
    const cb = () => setPage(initialPage());
    window.addEventListener("hashchange", cb);
    return () => {
      window.removeEventListener("hashchange", cb);
      clearTimeout(timer.current);
    };
  }, []);
  const navigate = (p: Page) => {
    setPage(p);
    location.hash = p;
    window.scrollTo({ top: 0, behavior: "instant" });
    setTimeout(() => main.current?.focus(), 0);
  };
  const label =
    page === "help" ? "Help & guide" : nav.find((x) => x.id === page)?.label;
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(e) => {
          e.preventDefault();
          main.current?.focus();
        }}
      >
        Skip to content
      </a>
      <aside className="sidebar">
        <button
          className="brand"
          aria-label="Wellway home"
          onClick={() => navigate("today")}
        >
          <span dangerouslySetInnerHTML={{ __html: logo }} />
        </button>
        <nav aria-label="Main navigation">
          {nav.map((n) => (
            <button
              key={n.id}
              className={`nav-item ${page === n.id ? "active" : ""}`}
              onClick={() => navigate(n.id)}
              aria-current={page === n.id ? "page" : undefined}
            >
              <Icon name={n.icon} size={23} />
              <span>{n.label}</span>
            </button>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <button
            className={`nav-item ${page === "help" ? "active" : ""}`}
            onClick={() => navigate("help")}
            aria-current={page === "help" ? "page" : undefined}
          >
            <Icon name="help" size={23} />
            <span>Help & guide</span>
          </button>
          <small>Demo · fictional data</small>
        </div>
      </aside>
      <div className="app-content">
        <header className="topbar">
          <button
            className="mobile-brand"
            aria-label="Wellway home"
            onClick={() => navigate("today")}
          >
            <span dangerouslySetInnerHTML={{ __html: logo }} />
          </button>
          <div className="breadcrumb">
            Your wellness <span>/</span> <strong>{label}</strong>
          </div>
          <div className="topbar-actions">
            <button
              className="icon-button mobile-help"
              aria-label="Help & guide"
              onClick={() => navigate("help")}
            >
              <Icon name="help" />
            </button>
            <label className="view-switch">
              <span className="sr-only">Choose perspective</span>
              <select
                value={page === "advisor" ? "advisor" : "member"}
                onChange={(e) =>
                  navigate(e.target.value === "advisor" ? "advisor" : "today")
                }
              >
                <option value="member">Member view</option>
                <option value="advisor">Advisor view</option>
              </select>
              <Icon name="chevron" size={16} />
            </label>
            <span className="avatar" title="Alex Parker · Fictional member">
              AP
            </span>
          </div>
        </header>
        <main id="main-content" ref={main} tabIndex={-1}>
          {storageError && (
            <div className="storage-warning" role="alert">
              {storageError}
            </div>
          )}
          {page === "today" && (
            <Today
              navigate={navigate}
              checkin={() => setCheckin(true)}
              tour={() => setTour(true)}
              ask={() => setAssistant(true)}
            />
          )}{" "}
          {page === "journey" && <Journey ask={() => setAssistant(true)} />}{" "}
          {page === "plan" && <Plan checkin={() => setCheckin(true)} />}{" "}
          {page === "connections" && <Connections />}{" "}
          {page === "advisor" && <Advisor />}{" "}
          {page === "help" && (
            <Help tour={() => setTour(true)} navigate={navigate} />
          )}
          <footer className="app-footer">
            <span>Wellway concept by Eidos Works</span>
            <span>
              Fictional data · {dateLabel(state.demoDate, true)} · Saved in this
              browser
            </span>
            <button className="text-button" onClick={() => navigate("help")}>
              How to get the most out of this
            </button>
          </footer>
        </main>
      </div>
      {page !== "today" && page !== "help" && (
        <button
          className="ask-fab"
          onClick={() => setAssistant(true)}
          aria-label="Ask about your journey"
        >
          <Icon name="sparkles" /> <span>Ask about my journey</span>
        </button>
      )}
      {checkin && (
        <Checkin
          onClose={() => setCheckin(false)}
          onSaved={() => {
            setCheckin(false);
            setToast(
              "Check-in saved. Your day, journey, and advisor view are up to date.",
            );
            clearTimeout(timer.current);
            timer.current = setTimeout(() => setToast(""), 6000);
          }}
        />
      )}
      {tour && (
        <Guide
          onClose={() => setTour(false)}
          navigate={navigate}
          checkin={() => setCheckin(true)}
        />
      )}{" "}
      {assistant && <Assistant onClose={() => setAssistant(false)} />}{" "}
      {toast && (
        <div className="toast" role="status">
          <Icon name="check" />
          {toast}
          <button
            className="icon-button"
            aria-label="Dismiss message"
            onClick={() => setToast("")}
          >
            <Icon name="close" size={17} />
          </button>
        </div>
      )}
    </>
  );
}
