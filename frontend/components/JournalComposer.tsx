"use client";

import { useEffect, useRef, useState } from "react";
import { Send } from "lucide-react";
import { useAuraStore } from "@/store/useAuraStore";

export default function JournalComposer({ demoText }: { demoText?: string }) {
  const [text, setText] = useState("");
  const [demoDraft, setDemoDraft] = useState("");
  const [notice, setNotice] = useState<string | null>(null);
  const dismissTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const submit = useAuraStore((state) => state.submitJournal);
  useEffect(() => () => {
    if (dismissTimer.current !== null) clearTimeout(dismissTimer.current);
  }, []);
  useEffect(() => {
    if (demoText === undefined) return;
    if (!demoText || matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const timer = setTimeout(() => setDemoDraft(demoText), 0);
      return () => clearTimeout(timer);
    }
    let length = 0;
    const timer = setInterval(() => {
      length++;
      setDemoDraft(demoText.slice(0, length));
      if (length >= demoText.length) clearInterval(timer);
    }, 45);
    return () => clearInterval(timer);
  }, [demoText]);
  const displayedText = demoText === undefined ? text : !demoText ? "" : demoDraft;
  return (
    <form className="journal-composer" onSubmit={(event) => {
      event.preventDefault();
      if (!text.trim()) return;
      submit(text.trim());
      setText("");
      const entry = useAuraStore.getState().journal.at(-1)!;
      setNotice(entry.score === null ? "Entry saved. Write at least 3 words for sentiment scoring." : `Entry saved · sentiment ${entry.score}/100`);
      if (dismissTimer.current !== null) clearTimeout(dismissTimer.current);
      dismissTimer.current = setTimeout(() => setNotice(null), 4000);
    }}>
      <div className="hud-glass journal-input-row">
        <label htmlFor="journal" className="sr-only">Private journal entry</label>
        <input id="journal" value={displayedText} readOnly={demoText !== undefined} onChange={(event) => setText(event.target.value)} placeholder="How are you feeling today?" autoComplete="off" />
        <button type="submit" aria-label="Log journal entry" disabled={!displayedText.trim()}><Send size={17} strokeWidth={1.5} /></button>
      </div>
      <div className="journal-notice-region" role="status" aria-live="polite">
        {demoText === undefined && notice && <div className="hud-glass journal-notice">{notice}</div>}
      </div>
    </form>
  );
}
