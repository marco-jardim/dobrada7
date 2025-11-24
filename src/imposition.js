// Grid of 4 columns x 2 rows on an A4 landscape sheet (A7)
export const GRID_A7 = { cols: 4, rows: 2 };
export const GRID_A6 = { cols: 2, rows: 2 };

// Suggested rotation (in degrees) for each position in the A7 grid.
const ROTATIONS_A7 = [
  // Front (8 positions)
  180, 180, 180, 180, 0, 0, 0, 0,
  // Back (8 positions)
  180, 180, 180, 180, 0, 0, 0, 0,
];

// Rotation for A6 (2x2)
// Top row 180, Bottom row 0
const ROTATIONS_A6 = [
  // Front (4 positions)
  180, 180, 0, 0,
  // Back (4 positions)
  180, 180, 0, 0,
];

// Page order for A7 (16 pages)
// Front: 13, 4, 1, 16, 12, 5, 8, 9
// Back: 15, 2, 3, 14, 10, 7, 6, 11
const IMPOSITION_ORDER_A7 = [
  13, 4, 1, 16, 12, 5, 8, 9, 15, 2, 3, 14, 10, 7, 6, 11,
];

// Page order for A6 (8 pages)
// Front: 4, 1, 5, 8
// Back: 2, 3, 7, 6
const IMPOSITION_ORDER_A6 = [4, 1, 5, 8, 2, 3, 7, 6];

/**
 * Returns the imposition map.
 * @param {string} format - 'a7' or 'a6'
 * @param {number} pageCount - Total number of pages
 */
export function getImposition(format, pageCount) {
  if (format === "a6") {
    return {
      sheets: getA4A6Imposition(pageCount),
      grid: GRID_A6,
    };
  }
  return {
    sheets: getA4A7Imposition(pageCount),
    grid: GRID_A7,
  };
}

function getA4A6Imposition(pageCount) {
  const sheets = [];
  const GRID = GRID_A6;

  // If <= 4 pages, generate 1 sheet (Front only)
  if (pageCount <= 4) {
    const frontSlots = [];
    // Mapping for 4 pages (Front Only): 4, 1, 3, 2
    // Slot 0: 4
    // Slot 1: 1
    // Slot 2: 3
    // Slot 3: 2
    const FRONT_MAPPING = [
      { logical: 4, slotIndex: 0 },
      { logical: 1, slotIndex: 1 },
      { logical: 3, slotIndex: 2 },
      { logical: 2, slotIndex: 3 },
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

export function getA4A7Imposition(pageCount = 16) {
  const sheets = [];
  const GRID = GRID_A7;

  // If <= 8 pages, generate only 1 sheet (Front only)
  if (pageCount <= 8) {
    const frontSlots = [];
    const FRONT_PAGE_MAPPING = [
      { logical: 1, slotIndex: 2 },
      { logical: 2, slotIndex: 1 },
      { logical: 3, slotIndex: 5 },
      { logical: 4, slotIndex: 6 },
      { logical: 5, slotIndex: 7 },
      { logical: 6, slotIndex: 4 },
      { logical: 7, slotIndex: 0 },
      { logical: 8, slotIndex: 3 },
    ];

    for (let i = 0; i < 8; i++) {
      const mapping = FRONT_PAGE_MAPPING.find((m) => m.slotIndex === i);
      if (mapping && mapping.logical <= pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);

        frontSlots.push({
          srcIndex: mapping.logical - 1,
          col,
          row,
          rotateDeg: ROTATIONS_A7[i],
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
      const impositionPage = IMPOSITION_ORDER_A7[i];
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);

        frontSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS_A7[i],
        });
      }
    }

    // Back
    for (let i = 0; i < 8; i += 1) {
      const impositionPage = IMPOSITION_ORDER_A7[8 + i];
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID.cols;
        const row = GRID.rows - 1 - Math.floor(i / GRID.cols);

        backSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS_A7[8 + i],
        });
      }
    }

    sheets.push({ frontSlots, backSlots });
  }

  return sheets;
}
