/**
 * Generate a test PDF with numbered pages for verifying imposition.
 * Run: node scripts/generate-test-pdf.mjs
 */
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { writeFileSync } from "fs";

async function generateTestPDF(pageCount = 8, outputPath = "test-input.pdf", landscape = false) {
  const pdfDoc = await PDFDocument.create();
  const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

  // A6 size in points (105mm x 148mm)
  const portraitWidth = 297.64;
  const portraitHeight = 419.53;
  const pageWidth = landscape ? portraitHeight : portraitWidth;
  const pageHeight = landscape ? portraitWidth : portraitHeight;

  for (let i = 1; i <= pageCount; i++) {
    const page = pdfDoc.addPage([pageWidth, pageHeight]);

    // Draw page number large and centered
    const text = String(i);
    const fontSize = 120;
    const textWidth = font.widthOfTextAtSize(text, fontSize);
    const textHeight = fontSize;

    page.drawText(text, {
      x: (pageWidth - textWidth) / 2,
      y: (pageHeight - textHeight) / 2 + 20,
      size: fontSize,
      font,
      color: rgb(0, 0, 0),
    });

    // Draw "Page X" label at bottom
    const label = `Page ${i}`;
    const labelSize = 24;
    const labelWidth = font.widthOfTextAtSize(label, labelSize);

    page.drawText(label, {
      x: (pageWidth - labelWidth) / 2,
      y: 40,
      size: labelSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });

    // Draw orientation indicator at top
    const topLabel = "TOP";
    const topLabelSize = 16;
    const topLabelWidth = font.widthOfTextAtSize(topLabel, topLabelSize);
    page.drawText(topLabel, {
      x: (pageWidth - topLabelWidth) / 2,
      y: pageHeight - 40,
      size: topLabelSize,
      font,
      color: rgb(0.6, 0.6, 0.6),
    });
  }

  const pdfBytes = await pdfDoc.save();
  writeFileSync(outputPath, pdfBytes);
  console.log(`Generated ${outputPath} with ${pageCount} pages`);
}

// Generate test PDFs - Portrait
await generateTestPDF(4, "test-4pages.pdf");
await generateTestPDF(8, "test-8pages.pdf");
await generateTestPDF(16, "test-16pages.pdf");
await generateTestPDF(24, "test-24pages.pdf");

// Generate test PDFs - Landscape
await generateTestPDF(4, "test-4pages-landscape.pdf", true);
await generateTestPDF(8, "test-8pages-landscape.pdf", true);
await generateTestPDF(16, "test-16pages-landscape.pdf", true);
await generateTestPDF(24, "test-24pages-landscape.pdf", true);

console.log("\nNow run the app and process these PDFs to check imposition.");
