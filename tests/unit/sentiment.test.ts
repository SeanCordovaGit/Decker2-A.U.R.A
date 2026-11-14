import { describe, expect, it } from "vitest";
import { scoreSentiment } from "@/lib/sentiment";
import { parseSepEvents } from "@/lib/donki";

describe("scoreSentiment", () => {
  it("positive text scores high", () => {
    expect(scoreSentiment("I'm fine, feeling great and really productive")!.score).toBeGreaterThan(70);
  });

  it("negative text scores low", () => {
    expect(scoreSentiment("I feel exhausted, lonely and homesick today")!.score).toBeLessThan(30);
  });

  it("negation flips polarity", () => {
    const pos = scoreSentiment("I am feeling good today")!.score;
    const neg = scoreSentiment("I am not feeling good today")!.score;
    expect(neg).toBeLessThan(50);
    expect(pos).toBeGreaterThan(50);
  });

  it("neutral text without lexicon words is 50", () => {
    expect(scoreSentiment("completed the module inspection checklist")!.score).toBe(50);
  });

  it("entries under 3 words are not scored", () => {
    expect(scoreSentiment("fine")).toBeNull();
    expect(scoreSentiment("")).toBeNull();
  });
});

describe("parseSepEvents", () => {
  it("parses DONKI items, skips invalid ones, sorts newest first", () => {
    const events = parseSepEvents([
      { sepID: "A", eventTime: "2026-01-01T00:00Z", instruments: [{ displayName: "X" }], link: "l" },
      { sepID: "B", eventTime: "2026-03-01T00:00Z" },
      { eventTime: "2026-02-01T00:00Z" },
      null,
    ]);
    expect(events.map((e) => e.id)).toEqual(["B", "A"]);
    expect(events[1].instruments).toEqual(["X"]);
    expect(events[0].instruments).toEqual([]);
  });

  it("returns [] for non-array input", () => {
    expect(parseSepEvents({})).toEqual([]);
  });
});
