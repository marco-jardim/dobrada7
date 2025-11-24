import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as pdfLib from "pdf-lib";

// Simplified Mock pdf-lib
vi.mock("pdf-lib", () => {
  return {
    PDFDocument: {
      load: vi.fn(),
      create: vi.fn(),
    },
    PageSizes: {
      A4: [595.28, 841.89],
    },
    degrees: vi.fn(),
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock");
global.URL.revokeObjectURL = vi.fn();

describe("App Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders title and instructions", () => {
    render(<App />);
    expect(
      screen.getByRole("heading", { name: /DobradA7/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/1. Select PDF/i)).toBeInTheDocument();
  });

  it("handles file upload and generation flow", async () => {
    const user = userEvent.setup();

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

    // Simple assignment for arrayBuffer
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));

    const input = screen.getByTestId("pdf-input");

    await user.upload(input, file);

    // Wait for load to be called
    await waitFor(() => {
      expect(pdfLib.PDFDocument.load).toHaveBeenCalled();
    });

    // Wait for status update
    await waitFor(() => {
      expect(screen.getByText(/PDF loaded with 16 pages/i)).toBeInTheDocument();
    });

    // Click generate
    const button = screen.getByText(/Generate Booklet/i);
    expect(button).not.toBeDisabled();
    await user.click(button);

    // Wait for generation
    await waitFor(() => {
      expect(screen.getByText(/Booklet generated/i)).toBeInTheDocument();
    });

    // Verify interactions
    expect(pdfLib.PDFDocument.create).toHaveBeenCalled();
    expect(mockPdfDoc.addPage).toHaveBeenCalled(); // Should add pages
    expect(mockPdfDoc.save).toHaveBeenCalled();
  });

  it("shows error for empty PDF", async () => {
    const user = userEvent.setup();
    const mockSrcDoc = {
      getPageCount: vi.fn().mockReturnValue(0),
    };
    pdfLib.PDFDocument.load.mockResolvedValue(mockSrcDoc);

    render(<App />);

    const file = new File([""], "empty.pdf", { type: "application/pdf" });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(0));

    const input = screen.getByTestId("pdf-input");

    await user.upload(input, file);

    await waitFor(() => {
      expect(
        screen.getByText(/The PDF seems to be empty/i)
      ).toBeInTheDocument();
    });
  });
});
