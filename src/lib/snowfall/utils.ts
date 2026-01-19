/**
 * Utility functions for snowfall animation
 */

/**
 * Generate a random number between min and max
 */
export const random = (min: number, max: number): number => {
  return Math.random() * (max - min) + min;
};

/**
 * Linear interpolation between two values
 */
export const lerp = (start: number, end: number, t: number): number => {
  return start * (1 - t) + end * t;
};

/**
 * Get a random element from an array
 */
export const randomElement = <T>(array: T[]): T => {
  return array[Math.floor(Math.random() * array.length)];
};

/**
 * Two Pi constant for circle calculations
 */
export const TWO_PI = Math.PI * 2;

/**
 * Degrees to radians conversion
 */
export const degreesToRadians = (degrees: number): number => {
  return (degrees * Math.PI) / 180;
};
