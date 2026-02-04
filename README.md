# DobradA7

[![Deploy](https://github.com/marco-jardim/dobrada7/actions/workflows/deploy.yml/badge.svg)](https://github.com/marco-jardim/dobrada7/actions/workflows/deploy.yml)
[![License: GPL v3](https://img.shields.io/badge/License-GPLv3-blue.svg)](https://www.gnu.org/licenses/gpl-3.0)

**DobradA7** is a web tool (React/Vite) that performs **imposition** of PDF pages so you can print booklets on **A4 paper** and fold them into **A7** (mini-booklet) or **A6** format.

Everything happens **locally in your browser** (using `pdf-lib`). No files are uploaded to any server.

## Live Demo

**[https://marco-jardim.github.io/dobrada7/](https://marco-jardim.github.io/dobrada7/)**

## Screenshot

![DobradA7 Interface](https://github.com/user-attachments/assets/dobrada7-screenshot.png)

*Upload a PDF, select your format (A7 or A6), and generate a print-ready booklet in seconds.*

## Features

- **A7 Imposition**: Turns 16 logical pages into 1 A4 sheet (front/back).
- **A6 Imposition**: Turns 8 logical pages into 1 A4 sheet (front/back).
- **Page Selection**: Choose specific pages or ranges (e.g., "1-8, 10-12").
- **100% Client-side**: Privacy first, no server processing.
- **Responsive Design**: Works on desktop and mobile.
- **Accessibility**: Screen reader friendly with semantic HTML and ARIA attributes.

## How to use

1.  Open the application at **[https://marco-jardim.github.io/dobrada7/](https://marco-jardim.github.io/dobrada7/)**
2.  Select a PDF file.
3.  Choose the format (**A7** or **A6**).
4.  (Optional) Select specific pages to include.
5.  Click **Generate Booklet**.
6.  Print the generated PDF on **A4 paper**.
    - For **A7**: Print **Landscape**, **Double-sided (Duplex)**.
    - For **A6**: Print **Portrait**, **Double-sided (Duplex)**.
    - **Important**: Disable "Fit to Page" or "Scale to Fit" options. Print at 100% scale.

### Folding Instructions (A7)

```
   ┌─────────────────────────────┐
   │                             │
   │         A4 Sheet            │
   │                             │
   │                             │
   └─────────────────────────────┘
              ↓ Fold 1 (vertical)
   ┌──────────┬──────────┐
   │          │          │
   │    A5    │    A5    │
   │          │          │
   └──────────┴──────────┘
              ↓ Fold 2 (horizontal)
   ┌──────────┐
   │    A6    │
   ├──────────┤
   │    A6    │
   └──────────┘
              ↓ Fold 3 (vertical)
   ┌─────┬─────┐
   │ A7  │ A7  │
   └─────┴─────┘
              ↓ Cut outer edges
         📖 Booklet ready!
```

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

Open [http://localhost:30009](http://localhost:30009) in your browser.

### Run Tests

This project uses **Vitest** and **React Testing Library** for unit and component testing.

```bash
npm test
```

### Build for Production

```bash
npm run build
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

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the **GNU General Public License v3 (GPLv3)**.

See the [`LICENSE`](./LICENSE) file for terms.
