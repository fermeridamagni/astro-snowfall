/**
 * Snowflake class - Individual snowflake entity with physics and rendering
 */

import type { SnowflakeParams, SnowflakeProps } from "./types";
import { degreesToRadians, lerp, random, randomElement, TWO_PI } from "./utils";

export class Snowflake {
  private readonly config: SnowflakeProps;
  private readonly params: SnowflakeParams;

  constructor(
    config: SnowflakeProps,
    canvasWidth: number,
    canvasHeight: number
  ) {
    this.config = config;

    // Initialize random starting position and properties
    const [minRadius, maxRadius] = config.radius;
    const [minSpeed, maxSpeed] = config.speed;
    const [minWind, maxWind] = config.wind;
    const [minRotation, maxRotation] = config.rotationSpeed;
    const [minOpacity, maxOpacity] = config.opacity;

    this.params = {
      x: random(0, canvasWidth),
      y: random(-canvasHeight, 0), // Start above the visible area
      radius: random(minRadius, maxRadius),
      speed: random(minSpeed, maxSpeed),
      wind: random(minWind, maxWind),
      nextSpeed: random(minSpeed, maxSpeed),
      nextWind: random(minWind, maxWind),
      rotation: random(0, 360),
      rotationSpeed: random(minRotation, maxRotation),
      opacity: random(minOpacity, maxOpacity),
      rotationX: random(0, 360),
      rotationY: random(0, 360),
      rotationZ: random(0, 360),
      framesSinceLastUpdate: 0,
      image: config.images ? randomElement(config.images) : undefined,
      isAccumulated: false,
    };
  }

  /**
   * Update snowflake position and properties based on physics
   * Returns true if the snowflake should be accumulated
   */
  update(
    canvasWidth: number,
    canvasHeight: number,
    framesPassed: number,
    accumulationHeight = 0
  ): boolean {
    const { speed, wind, nextSpeed, nextWind, rotationSpeed } = this.params;
    const { changeFrequency } = this.config;

    // Update rotation
    this.params.rotation += rotationSpeed * framesPassed;
    this.params.rotation %= 360;

    // Update 3D rotations
    if (this.config.enable3DRotation) {
      this.params.rotationX += rotationSpeed * framesPassed * 0.5;
      this.params.rotationY += rotationSpeed * framesPassed * 0.3;
      this.params.rotationZ += rotationSpeed * framesPassed;
      this.params.rotationX %= 360;
      this.params.rotationY %= 360;
      this.params.rotationZ %= 360;
    }

    // Lerp towards target speed and wind
    const lerpAmount = framesPassed / changeFrequency;
    this.params.speed = lerp(speed, nextSpeed, lerpAmount);
    this.params.wind = lerp(wind, nextWind, lerpAmount);

    // Update position
    this.params.y += this.params.speed * framesPassed;
    this.params.x += this.params.wind * framesPassed;

    // Update frame counter
    this.params.framesSinceLastUpdate += framesPassed;

    // Generate new target values when change frequency is reached
    if (this.params.framesSinceLastUpdate >= changeFrequency) {
      const [minSpeed, maxSpeed] = this.config.speed;
      const [minWind, maxWind] = this.config.wind;
      this.params.nextSpeed = random(minSpeed, maxSpeed);
      this.params.nextWind = random(minWind, maxWind);
      this.params.framesSinceLastUpdate = 0;
    }

    // Wrap around edges
    if (this.params.y > canvasHeight) {
      this.params.y = -this.params.radius;
    }

    if (this.params.x > canvasWidth + this.params.radius) {
      this.params.x = -this.params.radius;
    } else if (this.params.x < -this.params.radius) {
      this.params.x = canvasWidth + this.params.radius;
    }

    // Check if snowflake should be accumulated
    const accumulationThreshold = canvasHeight - accumulationHeight;
    const shouldAccumulate =
      this.config.enableAccumulation &&
      this.params.y + this.params.radius >= accumulationThreshold;

    return shouldAccumulate;
  }

  /**
   * Draw the snowflake as a circle
   */
  drawCircle(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.params.opacity;
    ctx.beginPath();
    ctx.arc(this.params.x, this.params.y, this.params.radius, 0, TWO_PI);
    ctx.fillStyle = this.config.color;
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  /**
   * Draw the snowflake as a circle with 3D rotation effect
   */
  drawCircle3D(ctx: CanvasRenderingContext2D): void {
    ctx.save();
    ctx.globalAlpha = this.params.opacity;

    // Apply 3D transformation
    ctx.translate(this.params.x, this.params.y);

    // Calculate scale based on rotation (perspective effect)
    const rotX = degreesToRadians(this.params.rotationX);
    const rotY = degreesToRadians(this.params.rotationY);
    const scaleX = Math.cos(rotY);
    const scaleY = Math.cos(rotX);

    ctx.scale(scaleX, scaleY);

    ctx.beginPath();
    ctx.arc(0, 0, this.params.radius, 0, TWO_PI);
    ctx.fillStyle = this.config.color;
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }

  /**
   * Draw the snowflake as an image
   */
  drawImage(ctx: CanvasRenderingContext2D): void {
    if (!this.params.image) {
      return;
    }

    ctx.save();
    ctx.globalAlpha = this.params.opacity;
    ctx.translate(this.params.x, this.params.y);

    if (this.config.enable3DRotation) {
      // Apply 3D rotation transformations
      const rotX = degreesToRadians(this.params.rotationX);
      const rotY = degreesToRadians(this.params.rotationY);
      const rotZ = degreesToRadians(this.params.rotationZ);

      // Simple 3D projection
      const scaleX = Math.cos(rotY) * Math.cos(rotZ);
      const scaleY = Math.cos(rotX) * Math.cos(rotZ);

      ctx.scale(scaleX, scaleY);
    } else {
      // Simple 2D rotation
      ctx.rotate(degreesToRadians(this.params.rotation));
    }

    const size = this.params.radius * 2;
    ctx.drawImage(this.params.image, -size / 2, -size / 2, size, size);

    ctx.restore();
  }

  /**
   * Draw the snowflake to the canvas
   */
  draw(ctx: CanvasRenderingContext2D): void {
    if (this.params.image) {
      this.drawImage(ctx);
    } else if (this.config.enable3DRotation) {
      this.drawCircle3D(ctx);
    } else {
      this.drawCircle(ctx);
    }
  }

  /**
   * Reset the snowflake to start falling from the top again
   */
  reset(canvasWidth: number, canvasHeight: number): void {
    const [minSpeed, maxSpeed] = this.config.speed;
    const [minWind, maxWind] = this.config.wind;

    this.params.x = random(0, canvasWidth);
    this.params.y = random(-canvasHeight, 0);
    this.params.speed = random(minSpeed, maxSpeed);
    this.params.wind = random(minWind, maxWind);
    this.params.nextSpeed = random(minSpeed, maxSpeed);
    this.params.nextWind = random(minWind, maxWind);
    this.params.isAccumulated = false;
  }

  /**
   * Static factory method to create multiple snowflakes
   */
  static createSnowflakes(
    count: number,
    config: SnowflakeProps,
    canvasWidth: number,
    canvasHeight: number
  ): Snowflake[] {
    return Array.from(
      { length: count },
      () => new Snowflake(config, canvasWidth, canvasHeight)
    );
  }
}
