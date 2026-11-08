/**
 * SnowfallCanvas - Main controller for snowfall animation
 */

import { defaultSnowflakeConfig } from "./config";
import { Snowflake } from "./snowflake";
import type { SnowfallCanvasConfig, SnowflakeProps } from "./types";

export class SnowfallCanvas {
  private readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private config: SnowfallCanvasConfig;
  private snowflakes: Snowflake[] = [];
  private lastUpdate: number = Date.now();
  private animationFrame: number | null = null;
  private readonly targetFps = 60;
  private logicalWidth = 0;
  private logicalHeight = 0;
  private dpr = 1;

  constructor(canvas: HTMLCanvasElement, config?: SnowfallCanvasConfig) {
    this.canvas = canvas;
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      throw new Error("Could not get 2D context from canvas");
    }

    this.ctx = ctx;
    this.config = config ?? {};
    this.dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    this.logicalWidth = canvas.offsetWidth || canvas.width || 300;
    this.logicalHeight = canvas.offsetHeight || canvas.height || 150;

    this.applyDimensions();

    // Initialize snowflakes
    this.createSnowflakes();

    // Start animation
    this.play();
  }

  private applyDimensions(): void {
    this.canvas.width = Math.round(this.logicalWidth * this.dpr);
    this.canvas.height = Math.round(this.logicalHeight * this.dpr);
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
      changeFrequency: this.config.changeFrequency ?? changeFrequency,
      color: this.config.color ?? color,
      enable3DRotation: this.config.enable3DRotation ?? enable3DRotation,
      images: this.config.images ?? images,
      opacity: this.config.opacity ?? opacity,
      radius: this.config.radius ?? radius,
      rotationSpeed: this.config.rotationSpeed ?? rotationSpeed,
      speed: this.config.speed ?? speed,
      wind: this.config.wind ?? wind,
    };

    this.snowflakes = Snowflake.createSnowflakes(
      this.config.snowflakeCount ?? 150,
      snowflakeConfig,
      this.logicalWidth,
      this.logicalHeight
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

    // Update each snowflake
    for (const snowflake of this.snowflakes) {
      snowflake.update(this.logicalWidth, this.logicalHeight, framesPassed);
    }

    this.lastUpdate = now;
  }

  /**
   * Render all snowflakes to canvas
   */
  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    this.ctx.save();
    if (this.dpr !== 1) {
      this.ctx.scale(this.dpr, this.dpr);
    }

    // Draw all snowflakes
    for (const snowflake of this.snowflakes) {
      snowflake.draw(this.ctx);
    }

    this.ctx.restore();
  }

  /**
   * Main animation loop
   */
  private readonly loop = (): void => {
    this.update();
    this.render();

    this.animationFrame = requestAnimationFrame(this.loop);
  };

  /**
   * Start or resume the animation
   */
  play(): void {
    if (this.animationFrame !== null) {
      return;
    }

    this.lastUpdate = Date.now();
    this.loop();
  }

  /**
   * Pause the animation
   */
  pause(): void {
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
    this.createSnowflakes();
  }

  /**
   * Resize the canvas and update snowflakes
   */
  resize(width: number, height: number): void {
    this.logicalWidth = width;
    this.logicalHeight = height;
    this.dpr = typeof window === "undefined" ? 1 : window.devicePixelRatio || 1;
    this.applyDimensions();
  }

  /**
   * Cleanup and stop animation
   */
  destroy(): void {
    this.pause();
    this.snowflakes = [];
  }
}
