// Grid de 4 colunas x 2 linhas na folha A4 em modo paisagem
export const GRID_COLS = 4;
export const GRID_ROWS = 2;

// Ordem de páginas para um livreto de 16 páginas com duas dobras perpendiculares.
// Baseado em um esquema típico de imposition 16‑up.
// Os números são 1..16 (páginas lógicas); no código usamos índice 0..15.
const IMPOSITION_ORDER = [
  13, 4, 1, 16, 12, 5, 8, 9, 15, 2, 3, 14, 10, 7, 6, 11,
];

// Rotação sugerida (em graus) para cada posição da grade.
// Mantive tudo como 0 para simplificar; se alguma página ficar invertida
// no teste de impressão, dá pra ajustar esses valores.
const ROTATIONS_DEG = [
  // Frente (8 posições)
  180, 180, 180, 180, 0, 0, 0, 0,
  // Verso (8 posições)
  180, 180, 180, 180, 0, 0, 0, 0,
];

/**
 * Retorna o mapa de imposição para uma folha A4 paisagem → livreto A7.
 *
 * Cada slot contém:
 *  - srcIndex: índice (0‑based) da página original
 *  - col / row: posição na grade 4x2
 *  - rotateDeg: rotação sugerida em graus (opcional)
 */
/**
 * Retorna o mapa de imposição para uma ou mais folhas A4 paisagem → livreto A7.
 *
 * @param {number} pageCount - Número total de páginas do PDF original.
 * @returns {Array<{ frontSlots: Array, backSlots: Array }>} Lista de folhas a imprimir.
 */
export function getA4A7Imposition(pageCount = 16) {
  const sheets = [];

  // Se for <= 8 páginas, gera apenas 1 folha (Frente apenas)
  if (pageCount <= 8) {
    const frontSlots = [];
    // Slots disponíveis na frente (índices 0..7 do array IMPOSITION_ORDER original correspondem à frente)
    // Mas precisamos mapear sequencialmente para os slots da frente.
    // IMPOSITION_ORDER tem 16 posições. As primeiras 8 são a FRENTE.
    // Ordem da frente no array: 13, 4, 1, 16, 12, 5, 8, 9
    // Se tivermos 8 páginas, queremos que elas ocupem esses slots de forma lógica?
    // O requisito é "ocupe apenas as paginas pares" (interpretado como "apenas slots da frente").
    // Vamos preencher os slots da frente sequencialmente com as páginas que temos.

    // Mapeamento dos slots da frente para a ordem de leitura do livreto (se fosse 16 pgs):
    // Slot 0 (Pg 13) -> vamos colocar a pg 7 aqui? Não.
    // Vamos simplificar: Se é <= 8, vamos usar os slots da frente para as páginas 1..8
    // Mas a dobra A7 é complexa.
    // Se usarmos a imposição padrão de 16 páginas, a Frente contém as páginas: 13, 4, 1, 16, 12, 5, 8, 9.
    // Se tivermos apenas 8 páginas (1..8), e queremos imprimir só na frente:
    // O livreto final terá 8 páginas.
    // A dobra vai resultar em 8 faces visíveis de um lado e 8 do outro (que estará em branco).
    // Se imprimirmos só na frente, ao dobrar, teremos conteúdo em algumas faces e branco em outras?
    // Não, ao dobrar uma folha impressa só de um lado, metade das páginas do livrinho ficarão em branco.
    // O usuário pediu "não use frente e verso no livreto".
    // Vamos preencher os slots da frente com as páginas disponíveis.
    // Ordem dos slots na frente: [0, 1, 2, 3, 4, 5, 6, 7]
    // IMPOSITION_ORDER[0] = 13 (no layout de 16)
    // IMPOSITION_ORDER[1] = 4
    // IMPOSITION_ORDER[2] = 1
    // IMPOSITION_ORDER[3] = 16
    // ...
    // Se temos 8 páginas, vamos mapear:
    // Pg 1 -> Slot que seria a Pg 1 (Slot 2)
    // Pg 2 -> Slot que seria a Pg 4 (Slot 1) ?? Não, isso vai bagunçar a ordem.
    //
    // Vamos assumir que o usuário quer um livreto de 8 páginas "falso", onde usamos a estrutura de 16,
    // mas só imprimimos a frente.
    // Se imprimirmos só a frente, teremos as páginas 1, 4, 5, 8, 9, 12, 13, 16 visíveis (do layout de 16).
    // As outras (2, 3, 6, 7, 10, 11, 14, 15) estariam no verso (que será branco).
    // Então, para um livreto de 8 páginas sequencial (1..8), devemos mapear:
    // Input Pg 1 -> Slot da Pg 1 (Slot 2)
    // Input Pg 2 -> Slot da Pg 4 (Slot 1)
    // Input Pg 3 -> Slot da Pg 5 (Slot 5)
    // Input Pg 4 -> Slot da Pg 8 (Slot 6)
    // Input Pg 5 -> Slot da Pg 9 (Slot 7)
    // Input Pg 6 -> Slot da Pg 12 (Slot 4)
    // Input Pg 7 -> Slot da Pg 13 (Slot 0)
    // Input Pg 8 -> Slot da Pg 16 (Slot 3)

    // Mapa de slots da frente para ordem lógica de leitura (1..8)
    // Frente tem slots para as páginas originais (de 16): 13, 4, 1, 16, 12, 5, 8, 9
    // Ordenando por página original:
    // 1 -> Slot 2
    // 4 -> Slot 1
    // 5 -> Slot 5
    // 8 -> Slot 6
    // 9 -> Slot 7
    // 12 -> Slot 4
    // 13 -> Slot 0
    // 16 -> Slot 3

    const FRONT_PAGE_MAPPING = [
      { logical: 1, slotIndex: 2 },
      { logical: 2, slotIndex: 1 },
      { logical: 3, slotIndex: 5 },
      { logical: 4, slotIndex: 6 },
      { logical: 5, slotIndex: 7 },
      { logical: 6, slotIndex: 4 },
      { logical: 7, slotIndex: 0 },
      { logical: 8, slotIndex: 3 },
    ];

    for (let i = 0; i < 8; i++) {
      // Encontrar qual página lógica (1..8) vai neste slot i (0..7)
      // Se i=0 (Slot 0), é a logical 7.
      const mapping = FRONT_PAGE_MAPPING.find((m) => m.slotIndex === i);
      if (mapping) {
        // Se a página existe no PDF (ex: PDF tem 4 páginas, só mapeamos 1..4)
        if (mapping.logical <= pageCount) {
          const col = i % GRID_COLS;
          const row = GRID_ROWS - 1 - Math.floor(i / GRID_COLS);

          frontSlots.push({
            srcIndex: mapping.logical - 1, // 0-based index do PDF
            col,
            row,
            rotateDeg: ROTATIONS_DEG[i],
          });
        }
      }
    }

    sheets.push({ frontSlots, backSlots: [] }); // Sem verso
    return sheets;
  }

  // Lógica para > 8 páginas (múltiplos de 16 ou parcial 8-16)
  const totalBlocks = Math.ceil(pageCount / 16);

  for (let b = 0; b < totalBlocks; b++) {
    const blockStartPage = b * 16; // 0-based start index
    const frontSlots = [];
    const backSlots = [];

    // Frente
    for (let i = 0; i < 8; i += 1) {
      const impositionPage = IMPOSITION_ORDER[i]; // 1..16
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID_COLS;
        const row = GRID_ROWS - 1 - Math.floor(i / GRID_COLS);

        frontSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS_DEG[i],
        });
      }
    }

    // Verso
    for (let i = 0; i < 8; i += 1) {
      const impositionPage = IMPOSITION_ORDER[8 + i]; // 1..16
      const srcIndex = blockStartPage + (impositionPage - 1);

      if (srcIndex < pageCount) {
        const col = i % GRID_COLS;
        const row = GRID_ROWS - 1 - Math.floor(i / GRID_COLS);

        backSlots.push({
          srcIndex,
          col,
          row,
          rotateDeg: ROTATIONS_DEG[8 + i],
        });
      }
    }

    sheets.push({ frontSlots, backSlots });
  }

  return sheets;
}
