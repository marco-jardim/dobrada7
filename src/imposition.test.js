import { describe, it, expect } from "vitest";
import { getA4A7Imposition, GRID_COLS, GRID_ROWS } from "./imposition";

describe("getA4A7Imposition", () => {
  it("should generate 1 sheet (front+back) for 16 pages", () => {
    const sheets = getA4A7Imposition(16);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(8);
    expect(sheets[0].backSlots).toHaveLength(8);
  });

  it("should generate 2 sheets for 20 pages", () => {
    const sheets = getA4A7Imposition(20);
    expect(sheets).toHaveLength(2);

    // Sheet 1: Full 16 pages
    expect(sheets[0].frontSlots).toHaveLength(8);
    expect(sheets[0].backSlots).toHaveLength(8);

    // Sheet 2: Remaining 4 pages padded to 16
    // Front has 8 slots, Back has 8 slots.
    // But only pages 17, 18, 19, 20 exist.
    // The function returns slots for valid pages only.
    // Block 2 starts at page 16 (0-based index).
    // Imposition order for front: 13, 4, 1, 16, 12, 5, 8, 9
    // Imposition order for back: 2, 15, 14, 3, 6, 11, 10, 7
    // Pages in block 2 are indices 16, 17, 18, 19 (Pages 17, 18, 19, 20).
    // Max index in block is 19.
    // Front slots check: srcIndex < 20.
    // Block start = 16.
    // Front:
    // 13 -> 16+12=28 (No)
    // 4 -> 16+3=19 (Yes, Page 20)
    // 1 -> 16+0=16 (Yes, Page 17)
    // 16 -> 16+15=31 (No)
    // ...
    // So we expect some slots to be filled.
    expect(sheets[1].frontSlots.length).toBeGreaterThan(0);
  });

  it("should generate 1 sheet (front only) for 8 pages", () => {
    const sheets = getA4A7Imposition(8);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(8); // All 8 pages map to front
    expect(sheets[0].backSlots).toHaveLength(0); // No back
  });

  it("should generate 1 sheet (front only) for 4 pages", () => {
    const sheets = getA4A7Imposition(4);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(4); // Only 4 pages map
    expect(sheets[0].backSlots).toHaveLength(0);
  });

  it("should map pages correctly for 8 pages (sequential on front)", () => {
    const sheets = getA4A7Imposition(8);
    const front = sheets[0].frontSlots;

    // We mapped:
    // Pg 1 -> Slot 2
    // Pg 2 -> Slot 1
    // Pg 3 -> Slot 5
    // Pg 4 -> Slot 6
    // Pg 5 -> Slot 7
    // Pg 6 -> Slot 4
    // Pg 7 -> Slot 0
    // Pg 8 -> Slot 3

    const findPage = (p) => front.find((s) => s.srcIndex === p - 1);

    expect(findPage(1).col).toBe(2 % GRID_COLS); // Slot 2 is col 2
    expect(findPage(2).col).toBe(1 % GRID_COLS); // Slot 1 is col 1
    expect(findPage(8).col).toBe(3 % GRID_COLS); // Slot 3 is col 3
  });
});
