import React, { useState } from "react";
import { PDFDocument, PageSizes, degrees } from "pdf-lib";
import { getA4A7Imposition, GRID_COLS, GRID_ROWS } from "./imposition";

function App() {
  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState(null);
  const [pageCount, setPageCount] = useState(null);
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);

  const handleFileChange = async (event) => {
    const file = event.target.files && event.target.files[0];
    if (!file) return;

    setError("");
    setStatus("Carregando PDF...");

    try {
      const arrayBuffer = await file.arrayBuffer();
      const srcDoc = await PDFDocument.load(arrayBuffer);
      const count = srcDoc.getPageCount();

      setFileBytes(arrayBuffer);
      setFileName(file.name);
      setPageCount(count);

      if (count === 0) {
        setError("O PDF parece estar vazio.");
        setStatus("");
      } else {
        setStatus(
          `PDF carregado com ${count} páginas. Pronto para gerar o livreto.`
        );
      }
    } catch (err) {
      console.error(err);
      setError(
        "Não foi possível ler o PDF. Verifique o arquivo e tente novamente."
      );
      setFileBytes(null);
      setPageCount(null);
      setStatus("");
    }
  };

  const handleGenerate = async () => {
    if (!fileBytes) {
      setError("Selecione primeiro um PDF.");
      return;
    }

    setError("");
    setStatus("Gerando livreto (tudo acontece no seu navegador)...");
    setIsGenerating(true);

    try {
      const srcDoc = await PDFDocument.load(fileBytes);
      const pdfDoc = await PDFDocument.create();

      const [a4W, a4H] = PageSizes.A4; // [largura retrato, altura retrato]
      const sheetWidth = a4H; // Paisagem: inverte
      const sheetHeight = a4W;

      const sheets = getA4A7Imposition(pageCount);

      const srcPages = srcDoc.getPages();
      const embeddedPages = await pdfDoc.embedPages(srcPages);

      const panelWidth = sheetWidth / GRID_COLS; // 4 colunas
      const panelHeight = sheetHeight / GRID_ROWS; // 2 linhas

      const drawSide = (page, slots) => {
        slots.forEach((slot) => {
          const embedded = embeddedPages[slot.srcIndex];
          // Se a página não existe (ex: padding em bloco incompleto), pula
          if (!embedded) return;

          const { width: pw, height: ph } = embedded;

          // Escala para caber no painel sem distorcer (mantém proporção)
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

      // Itera sobre as folhas geradas pela imposição
      for (const sheet of sheets) {
        const front = pdfDoc.addPage([sheetWidth, sheetHeight]);
        drawSide(front, sheet.frontSlots);

        // Se houver slots de verso, cria a página de verso
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
      const baseName = fileName ? fileName.replace(/\.pdf$/i, "") : "livreto";
      link.download = `${baseName}-dobrada7.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setStatus("Livreto gerado! O download do PDF deve ter começado.");
    } catch (err) {
      console.error(err);
      setError(
        "Algo deu errado ao gerar o livreto. Veja o console para detalhes."
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
          Transforme seu PDF em um livreto A7 a partir de folhas A4, 100% no
          navegador. Suporta qualquer quantidade de páginas.
        </p>
      </header>

      <main className="card">
        <section className="field">
          <label htmlFor="pdf-input" className="label">
            1. Selecione o PDF
          </label>
          <input
            id="pdf-input"
            type="file"
            accept="application/pdf"
            onChange={handleFileChange}
          />
          {fileName && (
            <p className="hint">
              Arquivo: <strong>{fileName}</strong>{" "}
              {pageCount != null && `(páginas: ${pageCount})`}
            </p>
          )}
        </section>

        <section className="field">
          <button
            className="primary-button"
            onClick={handleGenerate}
            disabled={!fileBytes || isGenerating}
          >
            {isGenerating ? "Gerando..." : "2. Gerar livreto A7 (PDF)"}
          </button>
          <p className="hint">
            Imprima em A4 <strong>paisagem</strong>, frente e verso (duplex),
            sem “ajustar à página” para manter as proporções.
          </p>
        </section>

        {status && <p className="status">{status}</p>}
        {error && <p className="error">{error}</p>}

        <section className="info">
          <h2>Como dobrar / encadernar</h2>
          <ol>
            <li>Imprima o PDF em A4 paisagem, frente e verso.</li>
            <li>Primeira dobra ao meio no sentido vertical (A4 → A5).</li>
            <li>Segunda dobra ao meio no sentido horizontal (A5 → A6).</li>
            <li>Terceira dobra ao meio no sentido vertical (A6 → A7).</li>
            <li>
              Corte com guilhotina os três lados externos, deixando apenas o
              lado que une todas as páginas (lombada).
            </li>
          </ol>
          <p className="hint">
            Se alguma página sair de cabeça para baixo, ajuste o mapa em{" "}
            <code>src/imposition.js</code> e refaça uma prova.
          </p>
        </section>
      </main>

      <footer className="footer">
        <span>GPLv3 • tudo no navegador • projeto: DobradA7</span>
      </footer>
    </div>
  );
}

export default App;
