/**
 * SnowfallCanvas - Main controller for snowfall animation
 */

import { defaultSnowflakeConfig } from "./config";
import { Snowflake } from "./Snowflake";
import type { SnowfallCanvasConfig, SnowflakeProps } from "./types";

export class SnowfallCanvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private config: SnowfallCanvasConfig;
  private snowflakes: Snowflake[] = [];
  private lastUpdate: number = Date.now();
  private animationFrame: number | null = null;
  private isPaused = false;
  private readonly targetFps = 60;
  private accumulationHeight = 0; // Current height of accumulated snow in pixels

  constructor(canvas: HTMLCanvasElement, config?: SnowfallCanvasConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    this.ctx = ctx;
    this.config = config ?? {};

    // Initialize snowflakes
    this.createSnowflakes();

    // Start animation
    this.play();
  }

  /**
   * Create the initial set of snowflakes
   */
  private createSnowflakes(): void {
    const {
      color,
      radius,
      speed,
      wind,
      changeFrequency,
      rotationSpeed,
      opacity,
      enable3DRotation,
      images,
    } = defaultSnowflakeConfig;

    const snowflakeConfig: SnowflakeProps = {
      color: this.config.color ?? color,
      radius: this.config.radius ?? radius,
      speed: this.config.speed ?? speed,
      wind: this.config.wind ?? wind,
      changeFrequency: this.config.changeFrequency ?? changeFrequency,
      rotationSpeed: this.config.rotationSpeed ?? rotationSpeed,
      opacity: this.config.opacity ?? opacity,
      enable3DRotation: this.config.enable3DRotation ?? enable3DRotation,
      images: this.config.images ?? images,
      enableAccumulation: this.config.enableAccumulation ?? false,
      accumulationMaxHeight: this.config.accumulationMaxHeight ?? 0.3,
      accumulationRate: this.config.accumulationRate ?? 0.01,
    };

    this.snowflakes = Snowflake.createSnowflakes(
      this.config.snowflakeCount ?? 150,
      snowflakeConfig,
      this.canvas.width,
      this.canvas.height
    );
  }

  /**
   * Update all snowflakes
   */
  private update(): void {
    const now = Date.now();
    const msPassed = now - this.lastUpdate;

    // Calculate frames passed based on target FPS
    const framesPassed = msPassed / (1000 / this.targetFps);

    const enableAccumulation = this.config.enableAccumulation ?? false;
    const accumulationRate = this.config.accumulationRate ?? 0.01;
    const maxAccumulationHeight =
      (this.config.accumulationMaxHeight ?? 0.3) * this.canvas.height;

    // Update each snowflake
    for (const snowflake of this.snowflakes) {
      if (snowflake.isAccumulated) {
        continue; // Skip accumulated snowflakes
      }

      const shouldAccumulate = snowflake.update(
        this.canvas.width,
        this.canvas.height,
        framesPassed,
        this.accumulationHeight
      );

      // Handle accumulation
      if (enableAccumulation && shouldAccumulate) {
        const accumulationY = this.canvas.height - this.accumulationHeight;
        snowflake.markAsAccumulated(accumulationY);

        // Increase accumulation height, but cap at max
        if (this.accumulationHeight < maxAccumulationHeight) {
          this.accumulationHeight += accumulationRate;
        }

        // Reset the snowflake to start falling from the top again
        snowflake.reset(this.canvas.width, this.canvas.height);
      }
    }

    this.lastUpdate = now;
  }

  /**
   * Render all snowflakes to canvas
   */
  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw accumulated snow layer if enabled
    if (
      this.config.enableAccumulation &&
      this.accumulationHeight > 0
    ) {
      this.renderAccumulatedSnow();
    }

    // Draw all snowflakes
    // Always draw individually for now (we can optimize later)
    for (const snowflake of this.snowflakes) {
      if (!snowflake.isAccumulated) {
        snowflake.draw(this.ctx);
      }
    }
  }

  /**
   * Render the accumulated snow layer at the bottom
   */
  private renderAccumulatedSnow(): void {
    const accumulationY = this.canvas.height - this.accumulationHeight;

    this.ctx.save();

    // Create a gradient for the accumulated snow
    const gradient = this.ctx.createLinearGradient(
      0,
      accumulationY,
      0,
      this.canvas.height
    );

    // Use the snowflake color with varying opacity
    const snowColor = this.config.color ?? "#dee4fd";
    const GRADIENT_TRANSPARENT = "00";
    const GRADIENT_SEMI_TRANSPARENT = "66";
    const GRADIENT_OPAQUE = "CC";
    
    gradient.addColorStop(0, `${snowColor}${GRADIENT_TRANSPARENT}`); // Transparent at top
    gradient.addColorStop(0.3, `${snowColor}${GRADIENT_SEMI_TRANSPARENT}`); // Semi-transparent
    gradient.addColorStop(1, `${snowColor}${GRADIENT_OPAQUE}`); // More opaque at bottom

    // Draw the accumulated snow layer
    this.ctx.fillStyle = gradient;
    this.ctx.fillRect(0, accumulationY, this.canvas.width, this.accumulationHeight);

    // Add subtle texture for natural look (limit texture lines for performance)
    const maxTextureLines = 50;
    const textureStep = Math.max(2, Math.floor(this.accumulationHeight / maxTextureLines));
    
    this.ctx.globalAlpha = 0.3;
    for (let i = 0; i < this.accumulationHeight; i += textureStep) {
      const y = accumulationY + i;
      this.ctx.fillStyle = snowColor;
      this.ctx.fillRect(0, y, this.canvas.width, 1);
    }

    this.ctx.restore();
  }

  /**
   * Main animation loop
   */
  private readonly loop = (): void => {
    if (this.isPaused) {
      return;
    }

    this.update();
    this.render();

    this.animationFrame = requestAnimationFrame(this.loop);
  };

  /**
   * Start or resume the animation
   */
  play(): void {
    const isAlreadyPlaying = !this.isPaused && this.animationFrame !== null;
    if (isAlreadyPlaying) {
      return;
    }

    this.isPaused = false;
    this.lastUpdate = Date.now();
    this.loop();
  }

  /**
   * Pause the animation
   */
  pause(): void {
    this.isPaused = true;
    if (this.animationFrame !== null) {
      cancelAnimationFrame(this.animationFrame);
      this.animationFrame = null;
    }
  }

  /**
   * Update the configuration and recreate snowflakes
   */
  updateConfig(config: SnowfallCanvasConfig): void {
    this.config = config;
    this.accumulationHeight = 0; // Reset accumulation
    this.createSnowflakes();
  }

  /**
   * Resize the canvas and update snowflakes
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
    // Note: We keep accumulation height on resize as it's relative to canvas
  }

  /**
   * Cleanup and stop animation
   */
  destroy(): void {
    this.pause();
    this.snowflakes = [];
  }
}
