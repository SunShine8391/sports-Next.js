import { calculatePoints } from "@/lib/utils";

describe("Calculate Points Tests", () => {
  it("Exact prediction - Some winner", () => {
    const result = calculatePoints({ home: 1, away: 2 }, { home: 1, away: 2 });
    expect(result).toBe(10);
  });

  it("Exact prediction - Draw", () => {
    const result = calculatePoints({ home: 1, away: 2 }, { home: 1, away: 2 });
    expect(result).toBe(10);
  });

  it("Correct outcome with correct margin", () => {
    const result = calculatePoints({ home: 1, away: 2 }, { home: 2, away: 3 });
    expect(result).toBe(7);
  });

  it("Correct outcome with correct margin - Draw", () => {
    const result = calculatePoints({ home: 2, away: 2 }, { home: 3, away: 3 });
    expect(result).toBe(7);
  });

  it("Correct outcome with one score correct", () => {
    const result = calculatePoints({ home: 1, away: 2 }, { home: 1, away: 3 });
    expect(result).toBe(5);
  });

  it("Only correct outcome is predicted - Some Winner", () => {
    const result = calculatePoints({ home: 3, away: 2 }, { home: 5, away: 1 });
    expect(result).toBe(3);
  });

  it("Wrong outcome is predicted but one score is correct", () => {
    const result = calculatePoints({ home: 3, away: 2 }, { home: 1, away: 2 });
    expect(result).toBe(1);
  });

  it("Wrong outcome is predicted but one score is correct - Draw", () => {
    const result = calculatePoints({ home: 3, away: 3 }, { home: 3, away: 2 });
    expect(result).toBe(1);
  });

  it("Wrong prediction", () => {
    const result = calculatePoints({ home: 3, away: 3 }, { home: 1, away: 2 });
    expect(result).toBe(0);
  });
});
