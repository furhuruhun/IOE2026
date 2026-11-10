import { describe, expect, it } from "vitest";
import { calendarDate } from "../src/lib/calendarDate";

describe("calendar display dates", () => {
  it.each([
    ["10 - 15 Nov 2026", "2026-11-10T00:00:00+07:00"],
    ["18 Dec - 15 Jan 2027", "2026-12-18T00:00:00+07:00"],
    ["18 Dec 2026 – 15 Jan 2027", "2026-12-18T00:00:00+07:00"],
    ["2026-12-12T23:59:00+07:00", "2026-12-12T23:59:00+07:00"],
    ["5 Feb 2027", "5 Feb 2027"],
    ["31 - 32 Feb 2027", null],
    ["TBA", null],
  ])("normalizes %s safely", (input, expected) => {
    expect(calendarDate(input)).toBe(expected);
  });
});
