/**
 * Snowfall Library - Export barrel
 *
 * Import everything you need from this single file:
 *
 * @example
 * import { SnowfallCanvas, Snowflake } from './lib/snowfall';
 * import type { SnowflakeConfig } from './lib/snowfall';
 */

// biome-ignore lint/performance/noBarrelFile: Not a problem for this use case
export { defaultConfig, defaultSnowflakeConfig, mergeConfig } from "./config";
export { SnowfallCanvas } from "./SnowfallCanvas";
export { Snowflake } from "./Snowflake";
export type {
  SnowfallCanvasConfig,
  SnowflakeConfig,
  SnowflakeParams,
  SnowflakeProps,
} from "./types";
export { degreesToRadians, lerp, random, randomElement, TWO_PI } from "./utils";
