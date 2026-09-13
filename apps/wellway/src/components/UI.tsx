import { useEffect, useId, useRef, useState, type ReactNode } from "react";
import { Icon } from "./Icon";
export function Button({
  children,
  onClick,
  variant = "primary",
  icon,
  disabled = false,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "outline" | "text" | "white";
  icon?: string;
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`button button-${variant} ${className}`}
    >
      {children}
      {icon && <Icon name={icon} size={18} />}
    </button>
  );
}
export function Modal({
  title,
  subtitle,
  children,
  onClose,
  wide = false,
  dirty = false,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  onClose: () => void;
  wide?: boolean;
  dirty?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [confirmClose, setConfirmClose] = useState(false);
  const requestClose = () => {
    if (dirty) setConfirmClose(true);
    else onClose();
  };
  const titleId = useId();
  const wasConfirming = useRef(false);
  useEffect(() => {
    if (confirmClose)
      ref.current
        ?.querySelector<HTMLElement>(".discard-confirm button")
        ?.focus();
    else if (wasConfirming.current) ref.current?.focus();
    wasConfirming.current = confirmClose;
  }, [confirmClose]);
  const onCloseRef = useRef(onClose);
  useEffect(() => {
    onCloseRef.current = requestClose;
  });
  useEffect(() => {
    const before = document.activeElement as HTMLElement;
    const old = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const background = [
      ...document.querySelectorAll<HTMLElement>(
        ".app-content,.sidebar,.ask-fab",
      ),
    ];
    const wasInert = background.map((el) => el.inert);
    background.forEach((el) => (el.inert = true));
    const viewport = window.visualViewport;
    const resize = () => {
      document.documentElement.style.setProperty(
        "--ww-viewport-height",
        `${viewport?.height || window.innerHeight}px`,
      );
      document.documentElement.style.setProperty(
        "--ww-viewport-top",
        `${viewport?.offsetTop || 0}px`,
      );
    };
    resize();
    viewport?.addEventListener("resize", resize);
    viewport?.addEventListener("scroll", resize);
    ref.current?.focus();
    const key = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        e.preventDefault();
        onCloseRef.current();
      }
      if (e.key === "Tab") {
        const targets = [
          ...(ref.current?.querySelectorAll<HTMLElement>(
            'button:not(:disabled),[href],input:not(:disabled),select:not(:disabled),textarea:not(:disabled),summary,[tabindex="0"]',
          ) || []),
        ].filter((el) => el.offsetParent !== null);
        const first = targets[0],
          last = targets.at(-1);
        if (
          e.shiftKey &&
          (document.activeElement === first ||
            document.activeElement === ref.current)
        ) {
          e.preventDefault();
          last?.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first?.focus();
        }
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.body.style.overflow = old;
      background.forEach((el, i) => (el.inert = wasInert[i]));
      viewport?.removeEventListener("resize", resize);
      viewport?.removeEventListener("scroll", resize);
      document.removeEventListener("keydown", key);
      before?.focus();
    };
  }, []);
  return (
    <div
      className="modal-backdrop"
      onClick={(e) => {
        if (e.target === e.currentTarget) requestClose();
      }}
    >
      <div
        className={`modal ${wide ? "modal-wide" : ""}`}
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
      >
        <button
          className="icon-button modal-close"
          onClick={requestClose}
          aria-label="Close dialog"
        >
          <Icon name="close" />
        </button>
        <h2 id={titleId}>{title}</h2>
        {subtitle && <p className="modal-subtitle">{subtitle}</p>}
        {confirmClose ? (
          <div className="discard-confirm" role="alert">
            <h3>Keep your unsaved changes?</h3>
            <p>Continue editing, or discard the changes before closing.</p>
            <div className="button-row">
              <Button onClick={() => setConfirmClose(false)}>
                Keep editing
              </Button>
              <Button variant="outline" onClick={onClose}>
                Discard changes
              </Button>
            </div>
          </div>
        ) : (
          children
        )}
      </div>
    </div>
  );
}
export function PageTitle({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: ReactNode;
}) {
  return (
    <div className="page-title">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {action}
    </div>
  );
}
export function Note({
  children,
  icon = "info",
}: {
  children: ReactNode;
  icon?: string;
}) {
  return (
    <div className="note">
      <Icon name={icon} size={19} />
      <div>{children}</div>
    </div>
  );
}
export function Empty({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children?: ReactNode;
}) {
  return (
    <div className="empty">
      <div className="icon-disc">
        <Icon name="sun" />
      </div>
      <h3>{title}</h3>
      <p>{description}</p>
      {children}
    </div>
  );
}
