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
  // FPS tracking
  private frameCount = 0;
  private lastFpsUpdate: number = Date.now();
  private currentFps = 0;

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

    // Update each snowflake
    for (const snowflake of this.snowflakes) {
      snowflake.update(this.canvas.width, this.canvas.height, framesPassed);
    }

    this.lastUpdate = now;
  }

  /**
   * Update FPS counter
   */
  private updateFPS(): void {
    if (!this.config.showFPS) return;

    this.frameCount++;
    const now = Date.now();
    const elapsed = now - this.lastFpsUpdate;

    // Update FPS every 500ms
    if (elapsed >= 500) {
      this.currentFps = Math.round((this.frameCount / elapsed) * 1000);
      this.frameCount = 0;
      this.lastFpsUpdate = now;
    }
  }

  /**
   * Render FPS counter in top right corner
   */
  private renderFPS(): void {
    if (!this.config.showFPS) return;

    this.ctx.save();
    
    // Set up text styling
    this.ctx.font = "bold 16px monospace";
    this.ctx.textAlign = "right";
    this.ctx.textBaseline = "top";
    
    // Draw text background
    const text = `${this.currentFps} FPS`;
    const padding = 8;
    const metrics = this.ctx.measureText(text);
    const textWidth = metrics.width;
    const textHeight = metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent;
    
    this.ctx.fillStyle = "rgba(0, 0, 0, 0.7)";
    this.ctx.fillRect(
      this.canvas.width - textWidth - padding * 2,
      padding,
      textWidth + padding * 2,
      textHeight + padding * 2
    );
    
    // Draw text
    this.ctx.fillStyle = "#00ff00";
    this.ctx.fillText(text, this.canvas.width - padding, padding * 2);
    
    this.ctx.restore();
  }

  /**
   * Render all snowflakes to canvas
   */
  private render(): void {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Draw all snowflakes
    // Always draw individually for now (we can optimize later)
    for (const snowflake of this.snowflakes) {
      snowflake.draw(this.ctx);
    }

    // Draw FPS counter
    this.renderFPS();
  }

  /**
   * Main animation loop
   */
  private readonly loop = (): void => {
    if (this.isPaused) {
      return;
    }

    this.updateFPS();
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
    this.createSnowflakes();
  }

  /**
   * Resize the canvas and update snowflakes
   */
  resize(width: number, height: number): void {
    this.canvas.width = width;
    this.canvas.height = height;
  }

  /**
   * Cleanup and stop animation
   */
  destroy(): void {
    this.pause();
    this.snowflakes = [];
  }
}
