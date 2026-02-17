/**
 * Shared constants for the Making 10 game.
 *
 * Layout, gameplay, building, and visual constants used across
 * logic, renderer, and the React component.
 */

// ── Layout ──
export const MAX_GRID_W = 10
export const GRID_H = 30
export const MIN_STACK_CELLS = 2
export const STACK_PLANK_COLS = 2 // columns reserved for the plank stack
export const STACK_GAP = 1        // gap column between building and plank stack

// ── Gameplay ──
export const INITIAL_HP = 10
export const BASE_SPEED = 20
export const SPEED_PER_POINT = 0.5
export const POINTS_PER_LEVEL = 10
export const LEVEL_UP_MS = 2000
export const BASE_SPAWN_MS = 3500
export const MIN_SPAWN_MS = 1000
export const SPAWN_DEC = 120
export const SHOT_CD = 400

// ── Building ──
export const PLANKS_PER_BUILDING = 30
export const BUILDING_ANIM_MS = 3500
export const BUILDING_NAMES = ['Shack', 'Cabin', 'House', 'Villa', 'Mansion', 'Estate', 'Castle']
// w × h in grid units — buildings grow each tier
export const BUILDING_SIZES: [number, number][] = [[1,1],[2,2],[3,3],[4,4],[5,5],[6,6],[7,7]]

// ── Visuals ──
export const COLORS: Record<number, string> = {
  2: '#EF4444', 3: '#F97316', 4: '#EAB308', 5: '#22C55E',
  6: '#06B6D4', 7: '#3B82F6', 8: '#8B5CF6',
}
