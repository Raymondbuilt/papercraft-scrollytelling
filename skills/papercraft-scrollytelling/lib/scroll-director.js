import * as THREE from 'three';

/**
 * ScrollDirector v2.5
 * Precision macro tabletop spline with smooth Auto-Play Cinema pacing
 * and hero-vista slowdowns.
 */
export class ScrollDirector {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.startZ = options.startZ ?? 5.5;
    this.endZ = options.endZ ?? -132.5;
    this.camHeight = options.camHeight ?? 15.2;
    this.camBackOffset = options.camBackOffset ?? 16.5;
    this.swayAmp = options.swayAmp ?? 0.55;

    this.targetT = 0;
    this.currentT = 0;
    this.velocity = 0;
    this.autoPlay = false;
    this.autoSpeed = 1.0;
    this.baseDuration = options.duration ?? 54;
    this.heroZones = options.heroZones ?? [0.05, 0.24, 0.44, 0.62, 0.78, 0.96];
  }

  nudge(delta) {
    this.autoPlay = false;
    this.targetT = THREE.MathUtils.clamp(this.targetT + delta, 0, 1);
  }

  jumpTo(t) {
    this.targetT = THREE.MathUtils.clamp(t, 0, 1);
  }

  update(dt, time) {
    if (this.autoPlay) {
      let pace = 1.0;
      for (const hz of this.heroZones) {
        const d = Math.abs(this.targetT - hz);
        if (d < 0.055) {
          pace = Math.min(pace, 0.58 + (d / 0.055) * 0.42);
        }
      }
      this.targetT += (dt / this.baseDuration) * this.autoSpeed * pace;
      if (this.targetT >= 1.0) {
        this.targetT = 1.0;
        this.autoPlay = false;
      }
    }

    const prev = this.currentT;
    this.currentT += (this.targetT - this.currentT) * Math.min(1, dt * 5.2);
    this.velocity = Math.abs(this.currentT - prev) / Math.max(dt, 0.001);

    const focusZ = THREE.MathUtils.lerp(this.startZ, this.endZ, this.currentT);
    const swayX = Math.sin(this.currentT * Math.PI * 5.0) * this.swayAmp;

    this.camera.position.set(
      swayX,
      this.camHeight + Math.sin(time * 0.45) * 0.06,
      focusZ + this.camBackOffset
    );
    this.camera.lookAt(swayX * 0.32, 1.4, focusZ - 1.5);

    return { t: this.currentT, focusZ, velocity: this.velocity };
  }
}
