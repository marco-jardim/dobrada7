import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import App from "./App";
import * as pdfLib from "pdf-lib";

// Mock pdf-lib
vi.mock("pdf-lib", () => {
  return {
    PDFDocument: {
      load: vi.fn(),
      create: vi.fn(),
    },
    PageSizes: {
      A4: [595.28, 841.89], // [width, height] in points (Portrait)
    },
    degrees: vi.fn(),
    rgb: vi.fn(() => ({ r: 0, g: 0, b: 0 })),
  };
});

// Mock URL.createObjectURL
global.URL.createObjectURL = vi.fn(() => "blob:http://localhost/mock");
global.URL.revokeObjectURL = vi.fn();

describe("App Orientation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("uses A4 Landscape for A7 portrait pages", async () => {
    const user = userEvent.setup();

    // Mock PDF load
    const mockSrcDoc = {
      getPageCount: vi.fn().mockReturnValue(16),
      getPages: vi.fn().mockReturnValue(new Array(16).fill({})),
    };
    pdfLib.PDFDocument.load.mockResolvedValue(mockSrcDoc);

    // Mock PDF create
    const mockPage = { drawPage: vi.fn(), drawLine: vi.fn() };
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
    const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    const input = screen.getByTestId("pdf-input");
    await user.upload(input, file);

    // Select A7 (default, but ensuring)
    const a7Radio = screen.getByLabelText(/A7/i);
    await user.click(a7Radio);

    // Portrait pages (default) => output A4 landscape
    const portraitRadio = screen.getByLabelText(/Portrait/i);
    await user.click(portraitRadio);

    // Generate
    const button = screen.getByText(/Generate Booklet/i);
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Booklet generated/i)).toBeInTheDocument();
    });

    // A4 Portrait: [595.28, 841.89]
    // A4 Landscape: [841.89, 595.28]
    expect(mockPdfDoc.addPage).toHaveBeenCalledWith([841.89, 595.28]);
  });

  it("uses A4 Portrait for A6 format", async () => {
    const user = userEvent.setup();

    // Mock PDF load
    const mockSrcDoc = {
      getPageCount: vi.fn().mockReturnValue(8),
      getPages: vi.fn().mockReturnValue(new Array(8).fill({})),
    };
    pdfLib.PDFDocument.load.mockResolvedValue(mockSrcDoc);

    // Mock PDF create
    const mockPage = { drawPage: vi.fn(), drawLine: vi.fn() };
    const mockPdfDoc = {
      addPage: vi.fn().mockReturnValue(mockPage),
      embedPages: vi
        .fn()
        .mockResolvedValue(new Array(8).fill({ width: 100, height: 100 })),
      save: vi.fn().mockResolvedValue(new Uint8Array([])),
    };
    pdfLib.PDFDocument.create.mockResolvedValue(mockPdfDoc);

    render(<App />);

    // Upload file
    const file = new File(["dummy"], "test.pdf", { type: "application/pdf" });
    file.arrayBuffer = () => Promise.resolve(new ArrayBuffer(8));
    const input = screen.getByTestId("pdf-input");
    await user.upload(input, file);

    // Select A6
    const a6Radio = screen.getByLabelText(/A6/i);
    await user.click(a6Radio);

    // Select Portrait orientation
    const portraitRadio = screen.getByLabelText(/Portrait/i);
    await user.click(portraitRadio);

    // Generate
    const button = screen.getByText(/Generate Booklet/i);
    await user.click(button);

    await waitFor(() => {
      expect(screen.getByText(/Booklet generated/i)).toBeInTheDocument();
    });

    // Verify addPage called with Portrait dimensions (Width, Height)
    // A4 Portrait: [595.28, 841.89]
    expect(mockPdfDoc.addPage).toHaveBeenCalledWith([595.28, 841.89]);
  });
});
