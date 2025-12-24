// Grid of 4 columns x 2 rows on an A4 landscape sheet (A7 portrait pages)
export const GRID_A7 = { cols: 4, rows: 2 };
// Grid of 2 columns x 4 rows on an A4 portrait sheet (A7 landscape pages)
export const GRID_A7_LANDSCAPE = { cols: 2, rows: 4 };
export const GRID_A6 = { cols: 2, rows: 2 };

// Suggested rotation (in degrees) for each position in the A7 grid.
const ROTATIONS_A7 = [
  // Front (8 positions)
  180, 180, 180, 180, 0, 0, 0, 0,
  // Back (8 positions)
  180, 180, 180, 180, 0, 0, 0, 0,
];

// Rotations for A7 when generating a portrait sheet (2x4 grid) for landscape pages.
// This is the portrait-sheet equivalent of the A7 landscape layout.
// Pattern: left column 0°, right column 180° (for both sides).
const ROTATIONS_A7_LANDSCAPE = [
  // Front (8 positions)
  0, 180, 0, 180, 0, 180, 0, 180,
  // Back (8 positions)
  0, 180, 0, 180, 0, 180, 0, 180,
];

// Slot index mapping when rotating the A7 portrait layout onto a portrait sheet
// (4x2 grid -> 2x4 grid)
const A7_PORTRAIT_SLOT_TO_LANDSCAPE_SLOT = [1, 3, 5, 7, 0, 2, 4, 6];

// Rotation for A6 (2x2)
// Top row 180, Bottom row 0
const ROTATIONS_A6 = [
  // Front (4 positions)
  180, 180, 0, 0,
  // Back (4 positions)
  180, 180, 0, 0,
];

// Page order for A7 portrait pages (16 pages)
// Grid: 4 cols x 2 rows on A4 landscape
// Front: 13, 4, 1, 16, 12, 5, 8, 9
// Back: 11, 6, 3, 10, 14, 7, 2, 15,
const IMPOSITION_ORDER_A7 = [
  13, 4, 1, 16, 12, 5, 8, 9, 11, 6, 3, 10, 14, 7, 2, 15,
];

// Page order for A7 landscape pages (16 pages)
// Grid: 2 cols x 4 rows on A4 portrait
// Derived by rotating the A7 portrait layout onto a portrait sheet.
// Front: 12, 9, 5, 8, 4, 1, 13, 16
// Back: 10, 11, 7, 6, 2, 3, 15, 14
const IMPOSITION_ORDER_A7_LANDSCAPE = [
  12, 9, 5, 8, 4, 1, 13, 16, 10, 11, 7, 6, 2, 3, 15, 14,
];

// Page order for A6 (8 pages)
// Front: 1, 2, 4, 3 at positions [TL, TR, BL, BR]
// Back: 7, 8, 5, 6 at positions [TL, TR, BL, BR]
const IMPOSITION_ORDER_A6 = [1, 8, 4, 5, 7, 2, 6, 3];

/**
 * Returns the imposition map.
 * @param {string} format - 'a7' or 'a6'
 * @param {number} pageCount - Total number of pages
 */
export function getImposition(format, pageCount, options = {}) {
  const pageOrientation = options.pageOrientation || "portrait";

  if (format === "a6") {
    return {
      sheets: getA4A6Imposition(pageCount),
      grid: GRID_A6,
    };
  }

  if (pageOrientation === "landscape") {
    return {
      sheets: getA4A7Imposition(pageCount, { pageOrientation }),
      grid: GRID_A7_LANDSCAPE,
    };
  }

  return {
    sheets: getA4A7Imposition(pageCount, { pageOrientation }),
    grid: GRID_A7,
  };
}

function getA4A6Imposition(pageCount) {
  const sheets = [];
  const GRID = GRID_A6;

  // If <= 4 pages, generate 1 sheet (Front only)
  if (pageCount <= 4) {
    const frontSlots = [];
    // Mapping for 4 pages (Front Only): 1, 2, 4, 3 at [TL, TR, BL, BR]
    // After folding: TL=page1, TR=page2, BR=page3, BL=page4
    const FRONT_MAPPING = [
      { logical: 1, slotIndex: 0 },
      { logical: 2, slotIndex: 1 },
      { logical: 4, slotIndex: 2 },
      { logical: 3, slotIndex: 3 },
    ];

    for (let i = 0; i < 4; i++) {
      const mapping = FRONT_MAPPING.find((m) => m.slotIndex === i);
      if (mapping && mapping.logical <= pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);
        frontSlots.push({
          srcIndex: mapping.logical - 1,
          col,
          row,
          rotateDeg: ROTATIONS_A6[i],
        });
      }
    }
    sheets.push({ frontSlots, backSlots: [] });
    return sheets;
  }

  // Logic for > 4 pages (blocks of 8)
  const totalBlocks = Math.ceil(pageCount / 8);

  for (let b = 0; b < totalBlocks; b++) {
    const blockStartPage = b * 8;
    const frontSlots = [];
    const backSlots = [];

    const remainingPages = pageCount - blockStartPage;

    // If this last block has <= 4 pages, reuse the 4-page front-only mapping
    if (remainingPages <= 4) {
      const FRONT_MAPPING = [
        { logical: 1, slotIndex: 0 },
        { logical: 2, slotIndex: 1 },
        { logical: 4, slotIndex: 2 },
        { logical: 3, slotIndex: 3 },
      ];

      for (let i = 0; i < 4; i++) {
        const mapping = FRONT_MAPPING.find((m) => m.slotIndex === i);
        if (mapping && mapping.logical <= remainingPages) {
          const col = i % GRID.cols;
          const row = GRID.rows - 1 - Math.floor(i / GRID.cols);
          frontSlots.push({
            srcIndex: blockStartPage + (mapping.logical - 1),
            col,
            row,
            rotateDeg: ROTATIONS_A6[i],
          });
        }
      }

      sheets.push({ frontSlots, backSlots: [] });
      continue;
    }

    // Front (4 slots)
    for (let i = 0; i < 4; i++) {
      const impositionPage = IMPOSITION_ORDER_A6[i]; // 1..8
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);
        frontSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS_A6[i],
        });
      }
    }

    // Back (4 slots)
    for (let i = 0; i < 4; i++) {
      const impositionPage = IMPOSITION_ORDER_A6[4 + i]; // 1..8
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);
        backSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS_A6[4 + i],
        });
      }
    }

    sheets.push({ frontSlots, backSlots });
  }

  return sheets;
}

export function getA4A7Imposition(pageCount = 16, options = {}) {
  const sheets = [];

  const pageOrientation = options.pageOrientation || "portrait";
  const isLandscapePages = pageOrientation === "landscape";

  const GRID = isLandscapePages ? GRID_A7_LANDSCAPE : GRID_A7;
  const ROTATIONS = isLandscapePages ? ROTATIONS_A7_LANDSCAPE : ROTATIONS_A7;
  const IMPOSITION_ORDER = isLandscapePages
    ? IMPOSITION_ORDER_A7_LANDSCAPE
    : IMPOSITION_ORDER_A7;

  // If <= 8 pages, generate only 1 sheet (Front only)
  if (pageCount <= 8) {
    const frontSlots = [];
    const FRONT_PAGE_MAPPING_PORTRAIT = [
      { logical: 1, slotIndex: 2 },
      { logical: 2, slotIndex: 3 },
      { logical: 3, slotIndex: 4 },
      { logical: 4, slotIndex: 6 },
      { logical: 5, slotIndex: 5 },
      { logical: 6, slotIndex: 7 },
      { logical: 7, slotIndex: 0 },
      { logical: 8, slotIndex: 1 },
    ];

    const FRONT_PAGE_MAPPING = isLandscapePages
      ? FRONT_PAGE_MAPPING_PORTRAIT.map((m) => ({
          ...m,
          slotIndex: A7_PORTRAIT_SLOT_TO_LANDSCAPE_SLOT[m.slotIndex],
        }))
      : FRONT_PAGE_MAPPING_PORTRAIT;

    for (let i = 0; i < 8; i++) {
      const mapping = FRONT_PAGE_MAPPING.find((m) => m.slotIndex === i);
      if (mapping && mapping.logical <= pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);

        frontSlots.push({
          srcIndex: mapping.logical - 1,
          col,
          row,
          rotateDeg: ROTATIONS[i],
        });
      }
    }

    sheets.push({ frontSlots, backSlots: [] });
    return sheets;
  }

  // Logic for > 8 pages (multiples of 16 or partial 8-16)
  const totalBlocks = Math.ceil(pageCount / 16);

  for (let b = 0; b < totalBlocks; b++) {
    const blockStartPage = b * 16;
    const frontSlots = [];
    const backSlots = [];

    // Front
    for (let i = 0; i < 8; i += 1) {
      const impositionPage = IMPOSITION_ORDER[i];
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);

        frontSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS[i],
        });
      }
    }

    // Back
    for (let i = 0; i < 8; i += 1) {
      const impositionPage = IMPOSITION_ORDER[8 + i];
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);

        backSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS[8 + i],
        });
      }
    }

    sheets.push({ frontSlots, backSlots });
  }

  return sheets;
}
