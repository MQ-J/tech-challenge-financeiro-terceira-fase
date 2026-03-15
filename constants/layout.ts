/**
 * Breakpoint (width in px) a partir do qual consideramos tablet.
 * Abaixo = layout mobile (coluna, cards empilhados).
 * Acima = layout tablet (hero em linha, grid 2x2, mais padding).
 */
export const TABLET_BREAKPOINT = 600

/** Largura máxima do conteúdo em telas grandes; conteúdo fica centralizado. */
export const MAX_CONTENT_WIDTH = 800

/** Altura aproximada do footer fixo (px) para padding do scroll. */
export const FOOTER_HEIGHT = 140

export function isTabletLayout(width: number): boolean {
  return width >= TABLET_BREAKPOINT
}
