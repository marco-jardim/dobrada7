# DobradA7

Ferramenta em React/Vite que pega um PDF de 16 páginas e gera um novo PDF com **imposição para
livreto A7** (16 páginas numa única folha A4 frente e verso, para dobrar, cortar e virar um
mini‑livro).

Tudo roda 100% no navegador, usando [`pdf-lib`](https://pdf-lib.js.org/).

## Como usar localmente

```bash
npm install
npm run dev
```

Abra `http://localhost:5173` (ou a porta que o Vite indicar), selecione seu PDF de 16 páginas e
clique em “Gerar livreto A7 (PDF)”.

## Fluxo de impressão

1. Gere o PDF do livreto.
2. Imprima em A4 **paisagem**, frente e verso (duplex).
3. Desative opções de “ajustar à página” / “fit to page”.
4. Dobre:
   - A4 → A5 (dobra vertical)
   - A5 → A6 (dobra horizontal)
   - A6 → A7 (dobra vertical)
5. Corte com guilhotina os três lados externos, deixando apenas o lado da lombada.

Se alguma página ficar invertida ou fora de ordem, ajuste o mapa de imposição em
`src/imposition.js` (`IMPOSITION_ORDER` e `ROTATIONS_DEG`) e refaça uma prova.

## Deploy automático no GitHub Pages

O repositório já vem com um workflow em `.github/workflows/deploy.yml`.

Passos:

1. Faça o push do código para um repositório no GitHub (ex.: `seu-usuario/dobrada7`).
2. Em **Settings → Pages**, escolha **Source: GitHub Actions**.
3. Faça push na branch `main` (ou ajuste o workflow se usar outra branch).

O workflow vai:

- instalar dependências;
- buildar o Vite (`npm run build`);
- publicar o conteúdo da pasta `dist` no GitHub Pages.

## Estrutura do projeto

```text
dobrada7/
  ├─ src/
  │  ├─ App.jsx          # UI e lógica principal
  │  ├─ imposition.js    # mapa de imposição A4 → A7
  │  ├─ main.jsx         # entrada React/Vite
  │  └─ styles.css       # estilos básicos responsivos
  ├─ index.html
  ├─ vite.config.js
  ├─ package.json
  └─ .github/workflows/deploy.yml
```

## Licença

Este projeto é licenciado sob a **GNU General Public License v3 (GPLv3)**.

Veja o arquivo [`LICENSE`](./LICENSE) para os termos.
