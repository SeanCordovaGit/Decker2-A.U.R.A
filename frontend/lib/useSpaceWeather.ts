"use client";

import { useEffect, useState } from "react";
import type { SpaceWeatherResponse } from "@aura/core/lib/types";

// One request per page load, shared by the top bar and the space weather panel.
let request: Promise<SpaceWeatherResponse> | null = null;

export function useSpaceWeather() {
  const [data, setData] = useState<SpaceWeatherResponse | null>(null);
  const [failed, setFailed] = useState(false);
  useEffect(() => {
    request ??= fetch("/api/donki/sep").then((r) => {
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      return r.json();
    });
    let live = true;
    request.then((d) => live && setData(d)).catch(() => live && setFailed(true));
    return () => {
      live = false;
    };
  }, []);
  return { data, failed };
}
