# DobradA7

**DobradA7** is a web tool (React/Vite) that performs **imposition** of PDF pages so you can print booklets on **A4 paper** and fold them into **A7** (mini-booklet) or **A6** format.

Everything happens **locally in your browser** (using `pdf-lib`). No files are uploaded to any server.

## Features

- **A7 Imposition**: Turns 16 logical pages into 1 A4 sheet (front/back).
- **A6 Imposition**: Turns 8 logical pages into 1 A4 sheet (front/back).
- **Page Selection**: Choose specific pages or ranges (e.g., "1-8, 10-12").
- **100% Client-side**: Privacy first, no server processing.
- **Responsive Design**: Works on desktop and mobile.
- **Accessibility**: Screen reader friendly with semantic HTML and ARIA attributes.

## How to use

1.  Open the application.
2.  Select a PDF file.
3.  Choose the format (**A7** or **A6**).
4.  (Optional) Select specific pages to include.
5.  Click **Generate Booklet**.
6.  Print the generated PDF on **A4 paper**.
    - For **A7**: Print **Landscape**, **Double-sided (Duplex)**.
    - For **A6**: Print **Portrait**, **Double-sided (Duplex)**.
    - **Important**: Disable "Fit to Page" or "Scale to Fit" options. Print at 100% scale.

### Folding Instructions (A7)

1.  Fold the A4 sheet in half vertically (A4 → A5).
2.  Fold in half horizontally (A5 → A6).
3.  Fold in half vertically (A6 → A7).
4.  Cut the three outer edges (top, bottom, right) to release the pages, keeping the spine intact.

### Folding Instructions (A6)

1.  Print on A4 **Portrait**.
2.  Fold the A4 sheet in half horizontally (A4 → A5).
3.  Fold in half vertically (A5 → A6).
4.  Cut the outer edges or staple the spine.

### Troubleshooting

If any page appears inverted or out of order, you can adjust the imposition map in `src/imposition.js` (`IMPOSITION_ORDER` and `ROTATIONS_DEG`) and verify again.

## Development

### Prerequisites

- Node.js (v18+)
- npm

### Setup

```bash
git clone https://github.com/marco-jardim/dobrada7.git
cd dobrada7
npm install
```

### Run Locally

```bash
npm run dev
```

### Run Tests

This project uses **Vitest** and **React Testing Library** for unit and component testing.

```bash
npm test
```

## Project Structure

```text
dobrada7/
  ├─ src/
  │  ├─ App.jsx            # UI and main logic
  │  ├─ App.test.jsx       # Unit tests for App component
  │  ├─ imposition.js      # Imposition logic for A7 and A6
  │  ├─ imposition.test.js # Unit tests for imposition logic
  │  ├─ main.jsx           # React/Vite entry point
  │  ├─ setupTests.js      # Test environment setup
  │  └─ styles.css         # Basic responsive styles
  ├─ index.html
  ├─ vite.config.js
  ├─ package.json
  └─ .github/workflows/deploy.yml
```

## License

This project is licensed under the **GNU General Public License v3 (GPLv3)**.

See the [`LICENSE`](./LICENSE) file for terms.
