/**
 * Shared constants for the Number Cannon game.
 */

// -- Layout --
export const START_GRID_W = 2
export const MAX_GRID_W = 20
export const GRID_H = 30

// -- Gameplay --
export const INITIAL_HP = 10
export const BASE_SPEED = 15
export const SPEED_PER_POINT = 0.3
export const BASE_SPAWN_MS = 4000
export const MIN_SPAWN_MS = 1200
export const SPAWN_DEC = 80
export const SHOT_CD = 400
export const POINTS_PER_LEVEL = 5
export const LEVEL_UP_MS = 2000

// -- Cannon sprites (evolve every 2 levels) --
export const CANNON_FILES = [
  'Frontier Popgun', 'Ember Bastion', 'Iron Twinshot', 'Arcane Array',
  'Plasma Obelisk', 'Voidcore Siege', 'Solar Crown', 'Prism Sovereign',
]

// -- Visuals --
// Colors for values 1-10
export const COLORS: Record<number, string> = {
  1: '#94A3B8',  // slate
  2: '#EF4444',  // red
  3: '#F97316',  // orange
  4: '#EAB308',  // yellow
  5: '#22C55E',  // green
  6: '#06B6D4',  // cyan
  7: '#3B82F6',  // blue
  8: '#8B5CF6',  // purple
  9: '#EC4899',  // pink
  10: '#F43F5E', // rose
}
