/**
 * CharGrid — 2D character buffer for terminal diagram rendering.
 *
 * Provides drawing primitives: boxes, lines, text placement.
 * Uses Unicode box-drawing characters.
 */

/** Box-drawing character sets. */
export const BOX = {
  single: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
  rounded: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
} as const;

export type BoxStyle = keyof typeof BOX;

/** Arrow characters by direction. */
export const ARROW = { right: '►', left: '◄', down: '▼', up: '▲' } as const;

export class CharGrid {
  private grid: string[][];
  readonly rows: number;
  readonly cols: number;

  constructor(rows: number, cols: number) {
    this.rows = rows;
    this.cols = cols;
    this.grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  }

  /** Set a character at (row, col) with bounds checking. */
  setChar(row: number, col: number, ch: string): void {
    const r = Math.round(row);
    const c = Math.round(col);
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      this.grid[r][c] = ch;
    }
  }

  /** Read a character at (row, col). */
  getChar(row: number, col: number): string {
    const r = Math.round(row);
    const c = Math.round(col);
    if (r >= 0 && r < this.rows && c >= 0 && c < this.cols) {
      return this.grid[r][c];
    }
    return ' ';
  }

  /** Draw a horizontal line. */
  drawHLine(row: number, col: number, length: number, ch = '─'): void {
    for (let i = 0; i < length; i++) {
      this.setChar(row, col + i, ch);
    }
  }

  /** Draw a vertical line. */
  drawVLine(row: number, col: number, length: number, ch = '│'): void {
    for (let i = 0; i < length; i++) {
      this.setChar(row + i, col, ch);
    }
  }

  /** Draw a box using the specified style. */
  drawBox(row: number, col: number, width: number, height: number, style: BoxStyle = 'single'): void {
    const b = BOX[style];
    if (width < 2 || height < 2) return;

    // Corners
    this.setChar(row, col, b.tl);
    this.setChar(row, col + width - 1, b.tr);
    this.setChar(row + height - 1, col, b.bl);
    this.setChar(row + height - 1, col + width - 1, b.br);

    // Horizontal edges
    this.drawHLine(row, col + 1, width - 2, b.h);
    this.drawHLine(row + height - 1, col + 1, width - 2, b.h);

    // Vertical edges
    this.drawVLine(row + 1, col, height - 2, b.v);
    this.drawVLine(row + 1, col + width - 1, height - 2, b.v);
  }

  /** Write text, truncating with ellipsis if needed. */
  writeText(row: number, col: number, text: string, maxWidth: number): void {
    const clean = text.replace(/\n/g, ' ').trim();
    const display = clean.length > maxWidth ? clean.slice(0, maxWidth - 1) + '…' : clean;
    for (let i = 0; i < display.length; i++) {
      this.setChar(row, col + i, display[i]);
    }
  }

  /** Convert the grid to a string, trimming trailing whitespace per line. */
  toString(): string {
    return this.grid
      .map(row => row.join('').trimEnd())
      .join('\n');
  }
}
