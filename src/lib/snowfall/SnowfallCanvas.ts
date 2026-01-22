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
  private clickHandler: ((event: MouseEvent) => void) | null = null;

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

    // Setup click interaction if enabled
    this.setupClickInteraction();

    // Start animation
    this.play();
  }

  /**
   * Setup click interaction if enabled
   */
  private setupClickInteraction(): void {
    const enableClickInteraction = this.config.enableClickInteraction ?? false;

    // Remove existing click handler if any
    if (this.clickHandler) {
      this.canvas.removeEventListener("click", this.clickHandler);
      this.clickHandler = null;
    }

    // Add click handler if enabled
    if (enableClickInteraction) {
      this.clickHandler = (event: MouseEvent) => {
        this.handleClick(event);
      };
      this.canvas.addEventListener("click", this.clickHandler);
      this.canvas.style.cursor = "pointer";
    } else {
      this.canvas.style.cursor = "";
    }
  }

  /**
   * Handle click on canvas to remove snowflakes
   */
  private handleClick(event: MouseEvent): void {
    const rect = this.canvas.getBoundingClientRect();
    
    // Account for canvas scaling - convert screen coordinates to canvas coordinates
    // Guard against division by zero if canvas is hidden
    const offsetWidth = this.canvas.offsetWidth || 1;
    const offsetHeight = this.canvas.offsetHeight || 1;
    const scaleX = this.canvas.width / offsetWidth;
    const scaleY = this.canvas.height / offsetHeight;
    
    const x = (event.clientX - rect.left) * scaleX;
    const y = (event.clientY - rect.top) * scaleY;

    // Find and remove clicked snowflake (iterate in reverse to check topmost first)
    for (let i = this.snowflakes.length - 1; i >= 0; i--) {
      if (this.snowflakes[i].containsPoint(x, y)) {
        this.snowflakes.splice(i, 1);
        break; // Only remove one snowflake per click
      }
    }
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
      enableClickInteraction,
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
      enableClickInteraction:
        this.config.enableClickInteraction ?? enableClickInteraction,
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
    this.createSnowflakes();
    this.setupClickInteraction();
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

    // Remove click handler if any
    if (this.clickHandler) {
      this.canvas.removeEventListener("click", this.clickHandler);
      this.clickHandler = null;
    }
  }
}
