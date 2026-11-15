"use client";

import { useSyncExternalStore, type ReactNode } from "react";
import { ChevronUp, X } from "lucide-react";

const MOBILE = "(max-width: 800px)";
function subscribeMobile(callback: () => void) {
  const media = matchMedia(MOBILE);
  media.addEventListener("change", callback);
  return () => media.removeEventListener("change", callback);
}

export default function WorkflowDock({ title = "Next steps", expanded, onToggle, onClose, children }: { title?: string; expanded: boolean; onToggle: () => void; onClose: () => void; children: ReactNode }) {
  const mobile = useSyncExternalStore(subscribeMobile, () => matchMedia(MOBILE).matches, () => false);
  const open = !mobile || expanded;
  return <aside className="hud-glass workflow-dock" role="region" aria-label={title} data-expanded={open}>
    <header className="workflow-dock-heading">
      <strong>{title}</strong>
      <button className="workflow-dock-toggle" onClick={onToggle} aria-expanded={open} aria-controls="workflow-dock-content" aria-label={`${open ? "Collapse" : "Expand"} ${title.toLowerCase()}`}><span>{open ? "Minimize" : "Open"}</span><ChevronUp size={16} /></button>
      <button className="workflow-dock-close" onClick={onClose} aria-label={`Close ${title.toLowerCase()}`}><X size={17} /></button>
    </header>
    <div className="workflow-dock-expander"><div className="workflow-dock-content" id="workflow-dock-content" inert={!open}>{children}</div></div>
  </aside>;
}
