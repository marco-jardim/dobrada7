import React, { useState } from "react";
import { PDFDocument, PageSizes, degrees, rgb } from "pdf-lib";
import { getImposition } from "./imposition";

function App() {
  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  // Config options
  const [format, setFormat] = useState("a7"); // 'a7' | 'a6'
  const [orientation, setOrientation] = useState("portrait"); // 'portrait' | 'landscape'
  const [pageSelection, setPageSelection] = useState("");

  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setError("");
    setStatus("Loading PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const count = srcDoc.getPageCount();

      setFileBytes(arrayBuffer);
      setFileName(file.name);
      setPageCount(count);

      if (count === 0) {
        setError("The PDF seems to be empty.");
        setStatus("");
      } else {
        setStatus(
          `PDF loaded with ${count} pages. Configure and generate the booklet.`
        );
      }
    } catch (err) {
      console.error(err);
      setError("Could not read the PDF. Please check the file and try again.");
      setFileBytes(null);
      setPageCount(null);
      setStatus("");
    }
  };

  const parsePageSelection = (selection, totalPages) => {
    if (!selection || !selection.trim()) return null;

    const pages = [];
    const parts = selection.split(",");

    for (const part of parts) {
      const range = part.trim().split("-");
      if (range.length === 1) {
        const p = parseInt(range[0], 10);
        if (!isNaN(p) && p >= 1 && p <= totalPages) {
          pages.push(p - 1);
        }
      } else if (range.length === 2) {
        const start = parseInt(range[0], 10);
        const end = parseInt(range[1], 10);
        if (!isNaN(start) && !isNaN(end)) {
          const step = start <= end ? 1 : -1;
          let current = start;
          // Loop handling both ascending and descending ranges
          while (start <= end ? current <= end : current >= end) {
            if (current >= 1 && current <= totalPages) {
              pages.push(current - 1);
            }
            current += step;
          }
        }
      }
    }
    return pages.length > 0 ? pages : null;
  };

  const handleGenerate = async () => {
    if (!fileBytes) {
      setError("Please select a PDF first.");
      return;
    }

    setError("");
    setStatus("Generating booklet (everything happens in your browser)...");
    setIsGenerating(true);

    try {
      const srcDoc = await PDFDocument.load(fileBytes);
      const pdfDoc = await PDFDocument.create();

      // Determine pages to use
      const selectedIndices = parsePageSelection(pageSelection, pageCount);
      const effectivePageCount = selectedIndices
        ? selectedIndices.length
        : pageCount;

      if (effectivePageCount === 0) {
        throw new Error("No valid pages selected.");
      }

      const [a4W, a4H] = PageSizes.A4; // [width portrait, height portrait]

      let sheetWidth, sheetHeight;

      // Sheet orientation depends on format + page orientation
      // - A7 portrait pages: A4 landscape (4x2)
      // - A7 landscape pages: A4 portrait (2x4)
      // - A6: A4 portrait
      if (format === "a7") {
        if (orientation === "portrait") {
          sheetWidth = a4H; // Landscape
          sheetHeight = a4W;
        } else {
          sheetWidth = a4W; // Portrait
          sheetHeight = a4H;
        }
      } else {
        sheetWidth = a4W;
        sheetHeight = a4H;
      }

      // Get imposition data
      const { sheets, grid } = getImposition(format, effectivePageCount, {
        pageOrientation: orientation,
      });

      const srcPages = srcDoc.getPages();
      const embeddedPages = await pdfDoc.embedPages(srcPages);

      const panelWidth = sheetWidth / grid.cols;
      const panelHeight = sheetHeight / grid.rows;

      const drawSide = (page, slots) => {
        slots.forEach((slot) => {
          // Map logical booklet page index to original PDF page index
          const logicalIndex = slot.srcIndex;
          const originalIndex = selectedIndices
            ? selectedIndices[logicalIndex]
            : logicalIndex;

          const embedded = embeddedPages[originalIndex];
          // If page doesn't exist (e.g. padding in incomplete block), skip
          if (!embedded) return;

          const { width: pw, height: ph } = embedded;

          // Scale to fit panel without distortion (maintain aspect ratio)
          const scale = Math.min(panelWidth / pw, panelHeight / ph);
          const drawWidth = pw * scale;
          const drawHeight = ph * scale;

          let x = slot.col * panelWidth + (panelWidth - drawWidth) / 2;
          let y = slot.row * panelHeight + (panelHeight - drawHeight) / 2;

          if (slot.rotateDeg === 180) {
            x += drawWidth;
            y += drawHeight;
          }

          page.drawPage(embedded, {
            x,
            y,
            width: drawWidth,
            height: drawHeight,
            rotate: slot.rotateDeg ? degrees(slot.rotateDeg) : undefined,
          });
        });
      };

      // Draw spine guide line on the page (between first and last page of the block)
      const drawSpineGuide = (page, frontSlots, blockIndex) => {
        const spineColor = rgb(0.3, 0.3, 0.3); // Dark gray
        const spineWidth = 3;

        // Spine is between the min and max page number of the section (block)
        const blockSize = format === "a7" ? 16 : 8;
        const blockStart = blockIndex * blockSize;
        const blockEnd = Math.min(blockStart + blockSize - 1, effectivePageCount - 1);

        const minSlot = frontSlots.find((s) => s.srcIndex === blockStart);
        const maxSlot = frontSlots.find((s) => s.srcIndex === blockEnd);

        // Draw spine only when both are on the front side
        if (!minSlot || !maxSlot) return;

        // Adjacent horizontally => vertical spine
        if (minSlot.row === maxSlot.row && Math.abs(minSlot.col - maxSlot.col) === 1) {
          const spineX = Math.max(minSlot.col, maxSlot.col) * panelWidth;
          const y0 = minSlot.row * panelHeight;
          page.drawLine({
            start: { x: spineX, y: y0 },
            end: { x: spineX, y: y0 + panelHeight },
            thickness: spineWidth,
            color: spineColor,
          });
          return;
        }

        // Adjacent vertically => horizontal spine
        if (minSlot.col === maxSlot.col && Math.abs(minSlot.row - maxSlot.row) === 1) {
          const spineY = Math.max(minSlot.row, maxSlot.row) * panelHeight;
          const x0 = minSlot.col * panelWidth;
          page.drawLine({
            start: { x: x0, y: spineY },
            end: { x: x0 + panelWidth, y: spineY },
            thickness: spineWidth,
            color: spineColor,
          });
        }
      };

      // Iterate over sheets generated by imposition
      for (let i = 0; i < sheets.length; i++) {
        const sheet = sheets[i];
        const front = pdfDoc.addPage([sheetWidth, sheetHeight]);
        drawSide(front, sheet.frontSlots);
        drawSpineGuide(front, sheet.frontSlots, i);

        // If there are back slots, create back page
        if (sheet.backSlots && sheet.backSlots.length > 0) {
          const back = pdfDoc.addPage([sheetWidth, sheetHeight]);
          drawSide(back, sheet.backSlots);
        }
      }

      const pdfBytesOut = await pdfDoc.save();
      const blob = new Blob([pdfBytesOut], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      const baseName = fileName ? fileName.replace(/\.pdf$/i, "") : "booklet";
      link.download = `${baseName}-dobrada7-${format}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatus("Booklet generated! The PDF download should have started.");
    } catch (err) {
      console.error(err);
      setError(
        err.message ||
          "Something went wrong while generating the booklet. Check the console for details."
      );
      setStatus("");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="app">
      <header className="header">
        <h1>DobradA7</h1>
        <p className="subtitle">
          Transform your PDF into an A7 or A6 booklet from A4 sheets, 100% in
          your browser.
        </p>
      </header>

      <main className="card" role="main">
        <section className="field" aria-labelledby="file-label">
          <label id="file-label" htmlFor="pdf-input" className="label">
            1. Select PDF
          </label>
          <input
            id="pdf-input"
            data-testid="pdf-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
            aria-describedby="file-hint"
          />
          {fileName && (
            <p id="file-hint" className="hint">
              File: <strong>{fileName}</strong>{" "}
              {pageCount != null && `(pages: ${pageCount})`}
            </p>
          )}
        </section>

        <section className="field" aria-labelledby="config-label">
          <label id="config-label" className="label">
            2. Settings
          </label>
          <div className="control-group">
            <span className="control-label" id="format-label">
              Format:
            </span>
            <div
              className="radio-group"
              role="radiogroup"
              aria-labelledby="format-label"
            >
              <label className="radio-label">
                <input
                  type="radio"
                  name="format"
                  value="a7"
                  checked={format === "a7"}
                  onChange={(e) => setFormat(e.target.value)}
                />
                A7 (16 pgs/sheet)
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="format"
                  value="a6"
                  checked={format === "a6"}
                  onChange={(e) => setFormat(e.target.value)}
                />
                A6 (8 pgs/sheet)
              </label>
            </div>
          </div>

          <div className="control-group">
            <span className="control-label" id="orientation-label">
              Orientation:
            </span>
            <div
              className="radio-group"
              role="radiogroup"
              aria-labelledby="orientation-label"
            >
              <label className="radio-label">
                <input
                  type="radio"
                  name="orientation"
                  value="portrait"
                  checked={orientation === "portrait"}
                  onChange={(e) => setOrientation(e.target.value)}
                />
                <svg
                  width="16"
                  height="20"
                  viewBox="0 0 16 20"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ marginRight: "4px" }}
                >
                  <rect x="1" y="1" width="14" height="18" rx="1" />
                </svg>
                Portrait
              </label>
              <label className="radio-label">
                <input
                  type="radio"
                  name="orientation"
                  value="landscape"
                  checked={orientation === "landscape"}
                  onChange={(e) => setOrientation(e.target.value)}
                />
                <svg
                  width="20"
                  height="16"
                  viewBox="0 0 20 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  style={{ marginRight: "4px" }}
                >
                  <rect x="1" y="1" width="18" height="14" rx="1" />
                </svg>
                Landscape
              </label>
            </div>
          </div>

          <div className="control-group">
            <label htmlFor="page-selection" className="control-label">
              Pages (optional):
            </label>
            <input
              id="page-selection"
              type="text"
              placeholder="Ex: 1-8, 10, 12-14"
              value={pageSelection}
              onChange={(e) => setPageSelection(e.target.value)}
              className="text-input"
              aria-describedby="page-hint"
            />
            <p id="page-hint" className="hint">
              Leave blank to use all. Accepts ranges (1-5) and lists (1,3,5).
            </p>
          </div>
        </section>

        <section className="field">
          <button
            className="primary-button"
            onClick={handleGenerate}
            disabled={!fileBytes || isGenerating}
            aria-busy={isGenerating}
          >
            {isGenerating ? "Generating..." : "3. Generate Booklet (PDF)"}
          </button>
          <p className="hint">
            Print on A4{" "}
            <strong>
              {format === "a7"
                ? orientation === "portrait"
                  ? "landscape"
                  : "portrait"
                : "portrait"}
            </strong>
            , double-sided (duplex), without "fit to page".
          </p>
        </section>

        {status && (
          <p className="status" role="status">
            {status}
          </p>
        )}
        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        <section className="info" aria-labelledby="instructions-label">
          <h2 id="instructions-label">How to fold / bind</h2>
          {format === "a7" ? (
            <ol>
              <li>
                Print the PDF on A4{" "}
                {orientation === "portrait" ? "landscape" : "portrait"},
                double-sided.
              </li>
              <li>First fold in half vertically (A4 → A5).</li>
              <li>Second fold in half horizontally (A5 → A6).</li>
              <li>Third fold in half vertically (A6 → A7).</li>
              <li>
                Cut the three outer sides with a guillotine, leaving only the
                side that joins all pages (spine).
              </li>
            </ol>
          ) : (
            <ol>
              <li>Print the PDF on A4 portrait, double-sided.</li>
              <li>First fold in half horizontally (A4 → A5).</li>
              <li>Second fold in half vertically (A5 → A6).</li>
              <li>Cut the outer sides or just fold and staple.</li>
            </ol>
          )}
        </section>
      </main>

      <footer className="footer">
        <span>
          GPLv3 • 100% in browser • project:{" "}
          <a
            href="https://github.com/marco-jardim/dobrada7"
            target="_blank"
            rel="noopener noreferrer"
          >
            DobradA7
          </a>
        </span>
      </footer>
    </div>
  );
}

export default App;
