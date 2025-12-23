# AGENTS.md

## Commands
- **Dev server**: `npm run dev` (Vite, port 30009)
- **Build**: `npm run build`
- **Test all**: `npm test`
- **Test single file**: `npm test -- src/imposition.test.js`
- **Test pattern**: `npm test -- -t "pattern"`

## Stack
React 19 + Vite 7 + Vitest 4 | JavaScript (JSX, no TypeScript) | pdf-lib for PDF manipulation

## Code Style
- **Components**: Functional with hooks, PascalCase (e.g., `App`)
- **Functions/variables**: camelCase (e.g., `handleFileChange`, `pageCount`)
- **Constants**: UPPER_SNAKE_CASE (e.g., `GRID_A7`, `ROTATIONS_A6`)
- **Imports**: React first, then external libs (`pdf-lib`), then local (`./imposition`)
- **Docs**: JSDoc comments for exported functions (`@param`, `@returns`)
- **Error handling**: try/catch with `console.error`, user-facing messages via state

## Testing
- Vitest + @testing-library/react, jsdom environment
- Pattern: `describe`/`it`/`expect`, mocks via `vi.mock`/`vi.fn`
- Test files: `*.test.js` or `*.test.jsx` alongside source
