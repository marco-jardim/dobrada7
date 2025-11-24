import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import App from "./App";
import * as pdfLib from "pdf-lib";

// Mock pdf-lib
vi.mock("pdf-lib", async () => {
  const actual = await vi.importActual("pdf-lib");
  return {
    ...actual,
    PDFDocument: {
      load: vi.fn(),
      create: vi.fn(),
    },
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock");
global.URL.revokeObjectURL = vi.fn();

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock Blob.prototype.arrayBuffer for JSDOM
    if (!Blob.prototype.arrayBuffer) {
      Blob.prototype.arrayBuffer = vi
        .fn()
        .mockResolvedValue(new ArrayBuffer(8));
    } else {
      vi.spyOn(Blob.prototype, "arrayBuffer").mockResolvedValue(
        new ArrayBuffer(8)
      );
    }
  });

  it("renders title and instructions", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /DobradA7/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Selecione o PDF/i)).toBeInTheDocument();
  });

  it("handles file upload and generation flow", async () => {
    // Mock PDFDocument.load to return a doc with 16 pages
    const mockSrcDoc = {
      getPageCount: vi.fn().mockReturnValue(16),
      getPages: vi.fn().mockReturnValue(new Array(16).fill({})),
    };
    pdfLib.PDFDocument.load.mockResolvedValue(mockSrcDoc);

    // Mock PDFDocument.create
    const mockPage = { drawPage: vi.fn() };
    const mockPdfDoc = {
      addPage: vi.fn().mockReturnValue(mockPage),
      embedPages: vi
        .fn()
        .mockResolvedValue(new Array(16).fill({ width: 100, height: 100 })),
      save: vi.fn().mockResolvedValue(new Uint8Array([])),
    };
    pdfLib.PDFDocument.create.mockResolvedValue(mockPdfDoc);

    render(<App />);

    // Upload file
    const file = new File(["dummy content"], "test.pdf", {
      type: "application/pdf",
    });
    const input = screen.getByLabelText(/Selecione o PDF/i);
    fireEvent.change(input, { target: { files: [file] } });

    // Wait for status update
    await waitFor(() => {
      expect(
        screen.getByText(/PDF carregado com 16 páginas/i)
      ).toBeInTheDocument();
    });

    // Click generate
    const button = screen.getByText(/Gerar livreto/i);
    expect(button).not.toBeDisabled();
    fireEvent.click(button);

    // Wait for generation
    await waitFor(() => {
      expect(screen.getByText(/Livreto gerado/i)).toBeInTheDocument();
    });

    // Verify interactions
    expect(pdfLib.PDFDocument.load).toHaveBeenCalled();
    expect(pdfLib.PDFDocument.create).toHaveBeenCalled();
    expect(mockPdfDoc.addPage).toHaveBeenCalled(); // Should add pages
    expect(mockPdfDoc.save).toHaveBeenCalled();
  });

  it("shows error for empty PDF", async () => {
    const mockSrcDoc = {
      getPageCount: vi.fn().mockReturnValue(0),
    };
    pdfLib.PDFDocument.load.mockResolvedValue(mockSrcDoc);

    render(<App />);

    const file = new File([""], "empty.pdf", { type: "application/pdf" });
    const input = screen.getByLabelText(/Selecione o PDF/i);
    fireEvent.change(input, { target: { files: [file] } });

    await waitFor(() => {
      expect(screen.getByText(/O PDF parece estar vazio/i)).toBeInTheDocument();
    });
  });
});
