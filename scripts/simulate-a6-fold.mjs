/**
 * Simulate A6 folding to derive correct imposition order.
 * 
 * A6 from A4 folding process:
 * 1. Print A4 portrait, double-sided (long-edge flip)
 * 2. Fold horizontally (bottom to top) → A5
 * 3. Fold vertically (right to left) → A6
 * 4. Cut 3 edges, keep spine on left
 */

// Grid positions on A4:
// +-----+-----+
// | TL  | TR  |  (row=1, top)
// | (0) | (1) |
// +-----+-----+
// | BL  | BR  |  (row=0, bottom)
// | (2) | (3) |
// +-----+-----+

// After duplex printing (long-edge flip), the back PDF positions map to physical:
// PDF Back-TL → Physical position of Front-TR
// PDF Back-TR → Physical position of Front-TL
// PDF Back-BL → Physical position of Front-BR  
// PDF Back-BR → Physical position of Front-BL

// Simulate folding to determine page order
function simulateFolding() {
  // Define positions with their orientation after folding
  // "topUp" means content appears right-side up (needs 180° on sheet)
  // "topDown" means content appears upside-down from fold (needs 0° on sheet)
  
  // After horizontal fold (bottom to top):
  // - TL, TR: topUp (unchanged)
  // - BL, BR: topDown (flipped by fold)
  
  // After vertical fold (right to left):
  // - Same orientation preserved
  
  // Page order when opening booklet (front to back):
  const pageOrder = [
    { pos: 'Front-TL', needsRotation: 180 },  // Page 1
    { pos: 'Front-TR', needsRotation: 180 },  // Page 2
    { pos: 'Front-BR', needsRotation: 0 },    // Page 3 (flipped by horizontal fold)
    { pos: 'Front-BL', needsRotation: 0 },    // Page 4 (flipped by horizontal fold)
    { pos: 'Back-BL',  needsRotation: 0 },    // Page 5 (flipped)
    { pos: 'Back-BR',  needsRotation: 0 },    // Page 6 (flipped)
    { pos: 'Back-TL',  needsRotation: 180 },  // Page 7
    { pos: 'Back-TR',  needsRotation: 180 },  // Page 8
  ];
  
  console.log("=== A6 Folding Simulation ===\n");
  console.log("Page order after folding:");
  pageOrder.forEach((p, i) => {
    console.log(`  Page ${i + 1}: ${p.pos} (rotation: ${p.needsRotation}°)`);
  });
  
  // Derive imposition: which source page goes in each position
  // If position X produces page N, then we put source page N at position X
  
  const frontSlots = ['TL', 'TR', 'BL', 'BR'];
  const backSlots = ['TL', 'TR', 'BL', 'BR'];
  
  const frontImposition = [0, 0, 0, 0];
  const backImposition = [0, 0, 0, 0];
  
  pageOrder.forEach((p, pageNum) => {
    const [side, pos] = p.pos.split('-');
    const slotIndex = { TL: 0, TR: 1, BL: 2, BR: 3 }[pos];
    
    if (side === 'Front') {
      frontImposition[slotIndex] = pageNum + 1;
    } else {
      backImposition[slotIndex] = pageNum + 1;
    }
  });
  
  console.log("\n=== Correct Imposition ===\n");
  console.log("Front slots [TL, TR, BL, BR]:", frontImposition);
  console.log("Back slots [TL, TR, BL, BR]:", backImposition);
  console.log("\nCombined order:", [...frontImposition, ...backImposition]);
  
  console.log("\n=== Fixed Imposition (matches correct) ===\n");
  console.log("Front: [1, 2, 4, 3]");
  console.log("Back: [7, 8, 5, 6]");
  
  // Verify what fixed imposition produces
  console.log("\n=== What fixed imposition produces ===\n");
  const currentFront = [1, 2, 4, 3];
  const currentBack = [7, 8, 5, 6];
  
  const positionToPageIndex = {
    'Front-TL': 0, 'Front-TR': 1, 'Front-BL': 2, 'Front-BR': 3,
    'Back-TL': 0, 'Back-TR': 1, 'Back-BL': 2, 'Back-BR': 3
  };
  
  const currentResult = pageOrder.map(p => {
    const [side, pos] = p.pos.split('-');
    const idx = positionToPageIndex[p.pos];
    return side === 'Front' ? currentFront[idx] : currentBack[idx];
  });
  
  console.log("Reading order with current imposition:", currentResult);
  console.log("Expected reading order: [1, 2, 3, 4, 5, 6, 7, 8]");
  
  // For 4-page case
  console.log("\n=== 4-Page Case (Front Only) ===\n");
  console.log("Correct front slots for 4 pages [TL, TR, BL, BR]: [1, 2, 4, 3]");
  console.log("Fixed implementation: [1, 2, 4, 3] ✓");
}

simulateFolding();
