/**
 * TypeScript type definitions for snowfall animation
 */

/**
 * Configuration for individual snowflake properties
 */
export interface SnowflakeProps {
  /**
   * The color of the snowflake, can be any valid CSS color.
   * @default '#dee4fd'
   */
  color: string;

  /**
   * The minimum and maximum radius of the snowflake in pixels.
   * @default [0.5, 3.0]
   */
  radius: [number, number];

  /**
   * The minimum and maximum speed of the snowflake (vertical velocity).
   * @default [1.0, 3.0]
   */
  speed: [number, number];

  /**
   * The minimum and maximum wind applied to the snowflake (horizontal velocity).
   * @default [-0.5, 2.0]
   */
  wind: [number, number];

  /**
   * The frequency in frames at which the snowflake changes target speed and wind.
   * @default 200
   */
  changeFrequency: number;

  /**
   * The minimum and maximum rotation speed of the snowflake in degrees per frame.
   * @default [-1.0, 1.0]
   */
  rotationSpeed: [number, number];

  /**
   * The minimum and maximum opacity of the snowflake (0 to 1).
   * @default [1, 1]
   */
  opacity: [number, number];

  /**
   * Enable 3D rotation for the snowflakes.
   * @default false
   */
  enable3DRotation: boolean;

  /**
   * Array of images to use as snowflakes instead of circles.
   * @default undefined
   */
  images?: CanvasImageSource[];

  /**
   * Enable click interaction with snowflakes.
   * When enabled, clicking on a snowflake will make it disappear.
   * @default false
   */
  enableClickInteraction: boolean;
}

/**
 * User-facing configuration (all properties optional)
 */
export type SnowflakeConfig = Partial<SnowflakeProps>;

/**
 * Configuration for the SnowfallCanvas
 */
export interface SnowfallCanvasConfig extends SnowflakeConfig {
  /**
   * The number of snowflakes to render.
   * @default 150
   */
  snowflakeCount?: number;
}

/**
 * Internal parameters for tracking snowflake state
 */
export interface SnowflakeParams {
  /** Current X position */
  x: number;
  /** Current Y position */
  y: number;
  /** Current radius */
  radius: number;
  /** Current speed (vertical velocity) */
  speed: number;
  /** Current wind (horizontal velocity) */
  wind: number;
  /** Target speed to lerp towards */
  nextSpeed: number;
  /** Target wind to lerp towards */
  nextWind: number;
  /** Current rotation in degrees */
  rotation: number;
  /** Rotation speed in degrees per frame */
  rotationSpeed: number;
  /** Current opacity (0-1) */
  opacity: number;
  /** Current 3D rotation on X axis */
  rotationX: number;
  /** Current 3D rotation on Y axis */
  rotationY: number;
  /** Current 3D rotation on Z axis */
  rotationZ: number;
  /** Frame counter for change frequency */
  framesSinceLastUpdate: number;
  /** Image to use for this snowflake (if using images) */
  image?: CanvasImageSource;
}
