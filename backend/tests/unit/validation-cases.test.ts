import { describe, expect, it } from "vitest";
import { runValidationCases } from "../../lib/validation-cases";

describe("public judging evidence", () => {
  it.each(runValidationCases())("$label: $value $unit is $expected", (example) => {
    expect(example.actual).toBe(example.expected);
    expect(example.passed).toBe(true);
  });
});
