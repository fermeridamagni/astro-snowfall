/**
 * Default configuration for snowfall animation
 */

import type { SnowfallCanvasConfig, SnowflakeProps } from "./types";

/**
 * Default snowflake configuration
 */
export const defaultSnowflakeConfig: SnowflakeProps = {
  color: "#dee4fd",
  radius: [0.5, 3.0],
  speed: [1.0, 3.0],
  wind: [-0.5, 2.0],
  changeFrequency: 200,
  rotationSpeed: [-1.0, 1.0],
  opacity: [1, 1],
  enable3DRotation: false,
  images: undefined,
};

/**
 * Default canvas configuration
 */
export const defaultConfig: SnowfallCanvasConfig = {
  ...defaultSnowflakeConfig,
  snowflakeCount: 150,
};

/**
 * Merge user config with defaults
 */
export const mergeConfig = (
  userConfig?: SnowfallCanvasConfig
): SnowfallCanvasConfig => {
  return {
    ...defaultConfig,
    ...userConfig,
  };
};
