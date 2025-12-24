import { describe, it, expect } from "vitest";
import { getImposition, GRID_A7, GRID_A6 } from "./imposition";

describe("getImposition (A7)", () => {
  it("should generate 1 sheet (front+back) for 16 pages", () => {
    const { sheets, grid } = getImposition("a7", 16);
    expect(grid).toEqual(GRID_A7);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(8);
    expect(sheets[0].backSlots).toHaveLength(8);
  });

  it("should generate 2 sheets for 20 pages", () => {
    const { sheets } = getImposition("a7", 20);
    expect(sheets).toHaveLength(2);

    // Sheet 1: Full 16 pages
    expect(sheets[0].frontSlots).toHaveLength(8);
    expect(sheets[0].backSlots).toHaveLength(8);

    // Sheet 2: Remaining 4 pages padded to 16
    expect(sheets[1].frontSlots.length).toBeGreaterThan(0);
  });

  it("should generate 1 sheet (front only) for 8 pages", () => {
    const { sheets } = getImposition("a7", 8);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(8);
    expect(sheets[0].backSlots).toHaveLength(0);
  });

  it("should generate 1 sheet (front only) for 4 pages", () => {
    const { sheets } = getImposition("a7", 4);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(4);
    expect(sheets[0].backSlots).toHaveLength(0);
  });
});

describe("getImposition (A6)", () => {
  it("should generate 1 sheet (front+back) for 8 pages", () => {
    const { sheets, grid } = getImposition("a6", 8);
    expect(grid).toEqual(GRID_A6);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(4);
    expect(sheets[0].backSlots).toHaveLength(4);
  });

  it("should generate 1 sheet (front only) for 4 pages", () => {
    const { sheets } = getImposition("a6", 4);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(4);
    expect(sheets[0].backSlots).toHaveLength(0);
  });

  it("should generate 1 sheet (front only) for 3 pages", () => {
    const { sheets } = getImposition("a6", 3);
    expect(sheets).toHaveLength(1);
    expect(sheets[0].frontSlots).toHaveLength(3);

    const slots = sheets[0].frontSlots;
    const findSlot = (idx) => slots.find((s) => s.srcIndex === idx);

    // With correct imposition [1, 2, 4, 3] at [TL, TR, BL, BR]:
    // Pg 1 (srcIndex 0) -> TL: col=0, row=1
    const s1 = findSlot(0);
    expect(s1).toBeDefined();
    expect(s1.col).toBe(0);
    expect(s1.row).toBe(1); // Top Row

    // Pg 2 (srcIndex 1) -> TR: col=1, row=1
    const s2 = findSlot(1);
    expect(s2).toBeDefined();
    expect(s2.col).toBe(1);
    expect(s2.row).toBe(1); // Top Row

    // Pg 3 (srcIndex 2) -> BR: col=1, row=0
    const s3 = findSlot(2);
    expect(s3).toBeDefined();
    expect(s3.col).toBe(1);
    expect(s3.row).toBe(0); // Bottom Row
  });

  it("should generate 2 sheets for 12 pages (8 + 4)", () => {
    const { sheets } = getImposition("a6", 12);
    expect(sheets).toHaveLength(2);

    // Sheet 1: Full 8 pages
    expect(sheets[0].frontSlots).toHaveLength(4);
    expect(sheets[0].backSlots).toHaveLength(4);

    // Sheet 2: Remaining 4 pages (9..12)
    // With imposition [1,2,4,3,7,8,5,6], pages 9-12 fill front only
    expect(sheets[1].frontSlots).toHaveLength(4);
    expect(sheets[1].backSlots).toHaveLength(0);
  });
});
