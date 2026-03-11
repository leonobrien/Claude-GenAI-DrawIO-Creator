import { describe, it, expect } from 'vitest';
import { CharGrid, BOX, ARROW } from '../../src/preview/char-grid.js';

describe('CharGrid', () => {
  describe('constructor', () => {
    it('creates grid of correct dimensions', () => {
      const grid = new CharGrid(5, 10);
      expect(grid.rows).toBe(5);
      expect(grid.cols).toBe(10);
    });

    it('initialises with spaces (trimmed to empty lines)', () => {
      const grid = new CharGrid(3, 3);
      // toString() trims trailing whitespace, so all-space rows become empty
      expect(grid.toString()).toBe('\n\n');
    });
  });

  describe('setChar / getChar', () => {
    it('sets and reads a character', () => {
      const grid = new CharGrid(3, 3);
      grid.setChar(1, 1, 'X');
      expect(grid.getChar(1, 1)).toBe('X');
    });

    it('ignores out-of-bounds writes', () => {
      const grid = new CharGrid(3, 3);
      grid.setChar(-1, 0, 'X');
      grid.setChar(0, 5, 'X');
      grid.setChar(10, 10, 'X');
      // Should not throw, grid unchanged
      expect(grid.getChar(0, 0)).toBe(' ');
    });

    it('returns space for out-of-bounds reads', () => {
      const grid = new CharGrid(3, 3);
      expect(grid.getChar(-1, 0)).toBe(' ');
      expect(grid.getChar(0, 10)).toBe(' ');
    });
  });

  describe('drawHLine', () => {
    it('draws a horizontal line', () => {
      const grid = new CharGrid(3, 10);
      grid.drawHLine(1, 2, 5);
      expect(grid.getChar(1, 2)).toBe('─');
      expect(grid.getChar(1, 6)).toBe('─');
      expect(grid.getChar(1, 1)).toBe(' ');
      expect(grid.getChar(1, 7)).toBe(' ');
    });
  });

  describe('drawVLine', () => {
    it('draws a vertical line', () => {
      const grid = new CharGrid(10, 3);
      grid.drawVLine(2, 1, 4);
      expect(grid.getChar(2, 1)).toBe('│');
      expect(grid.getChar(5, 1)).toBe('│');
      expect(grid.getChar(1, 1)).toBe(' ');
      expect(grid.getChar(6, 1)).toBe(' ');
    });
  });

  describe('drawBox', () => {
    it('draws a single-line box', () => {
      const grid = new CharGrid(5, 10);
      grid.drawBox(0, 0, 5, 3, 'single');
      expect(grid.getChar(0, 0)).toBe('┌');
      expect(grid.getChar(0, 4)).toBe('┐');
      expect(grid.getChar(2, 0)).toBe('└');
      expect(grid.getChar(2, 4)).toBe('┘');
      expect(grid.getChar(0, 2)).toBe('─');
      expect(grid.getChar(1, 0)).toBe('│');
    });

    it('draws a rounded box', () => {
      const grid = new CharGrid(5, 10);
      grid.drawBox(0, 0, 5, 3, 'rounded');
      expect(grid.getChar(0, 0)).toBe('╭');
      expect(grid.getChar(0, 4)).toBe('╮');
      expect(grid.getChar(2, 0)).toBe('╰');
      expect(grid.getChar(2, 4)).toBe('╯');
    });

    it('draws a double-line box', () => {
      const grid = new CharGrid(5, 10);
      grid.drawBox(0, 0, 5, 3, 'double');
      expect(grid.getChar(0, 0)).toBe('╔');
      expect(grid.getChar(0, 4)).toBe('╗');
      expect(grid.getChar(0, 2)).toBe('═');
      expect(grid.getChar(1, 0)).toBe('║');
    });

    it('skips boxes smaller than 2x2', () => {
      const grid = new CharGrid(3, 3);
      grid.drawBox(0, 0, 1, 1, 'single');
      expect(grid.getChar(0, 0)).toBe(' ');
    });
  });

  describe('writeText', () => {
    it('writes text at position', () => {
      const grid = new CharGrid(3, 20);
      grid.writeText(1, 2, 'Hello', 10);
      const line = grid.toString().split('\n')[1];
      expect(line).toContain('Hello');
    });

    it('truncates with ellipsis when too long', () => {
      const grid = new CharGrid(3, 20);
      grid.writeText(1, 0, 'Very Long Label Text', 8);
      const line = grid.toString().split('\n')[1];
      expect(line).toContain('Very Lo…');
    });

    it('replaces newlines with spaces', () => {
      const grid = new CharGrid(3, 20);
      grid.writeText(1, 0, 'Line\nTwo', 15);
      const line = grid.toString().split('\n')[1];
      expect(line).toContain('Line Two');
    });
  });

  describe('toString', () => {
    it('trims trailing whitespace per line', () => {
      const grid = new CharGrid(3, 10);
      grid.setChar(0, 0, 'X');
      const lines = grid.toString().split('\n');
      expect(lines[0]).toBe('X');
      expect(lines[1]).toBe('');
    });
  });
});

describe('BOX constants', () => {
  it('has single, rounded, and double styles', () => {
    expect(BOX.single.tl).toBe('┌');
    expect(BOX.rounded.tl).toBe('╭');
    expect(BOX.double.tl).toBe('╔');
  });
});

describe('ARROW constants', () => {
  it('has directional arrows', () => {
    expect(ARROW.right).toBe('►');
    expect(ARROW.left).toBe('◄');
    expect(ARROW.down).toBe('▼');
    expect(ARROW.up).toBe('▲');
  });
});
