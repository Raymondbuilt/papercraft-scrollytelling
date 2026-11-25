import * as THREE from 'three';

/**
 * 1. WaveHinge (v2.7 Frustum-Calibrated + Zero-Clip Fold-Flat)
 */
export class WaveHinge {
  constructor(object3D, options = {}) {
    this.obj = object3D;
    this.zPos = options.zPos ?? object3D.position.z;
    this.baseY = options.baseY ?? object3D.position.y;
    this.foldLayer = options.foldLayer ?? 0;
    this.openDist = options.openDist ?? 10.8;
    this.closeBehindDist = options.closeBehindDist ?? 7.5;
    this.delay = options.delay ?? 0;
    this.introDelay = options.introDelay ?? 0;
    this.restAngle = options.restAngle ?? 0;
    this.flatAngle = options.flatAngle ?? -Math.PI * 0.498;
    this.stiffness = options.stiffness ?? 145;
    this.damping = options.damping ?? 12.0;
    this.windAmp = options.windAmp ?? 0.013;
    this.windPhase = Math.random() * Math.PI * 2;
    this.customYFn = options.customYFn ?? null;

    this.angle = this.flatAngle;
    this.vel = 0;
    this.isUp = false;
    this.obj.rotation.x = this.angle;
  }

  impulse(strength = 4.8) {
    this.vel += strength;
  }

  update(dt, camFocusZ, time, foldFlat, onSnapCallback) {
    const ahead = camFocusZ - this.zPos;
    const introReady = time >= this.introDelay;
    const shouldBeUp = !foldFlat && introReady
      && (ahead < (this.openDist - this.delay))
      && (ahead > -this.closeBehindDist);

    if (shouldBeUp !== this.isUp) {
      this.isUp = shouldBeUp;
      if (onSnapCallback && ahead < 16.5 && ahead > -7.5) {
        onSnapCallback(shouldBeUp ? 'up' : 'down');
      }
    }

    const wind = shouldBeUp ? Math.sin(time * 1.9 + this.windPhase) * this.windAmp : 0;
    const targetAngle = (shouldBeUp ? this.restAngle : this.flatAngle) + wind;
    const force = (targetAngle - this.angle) * this.stiffness - this.vel * this.damping;
    this.vel += force * dt;
    this.angle += this.vel * dt;

    // Physical tabletop floor collision stop: cardstock can NEVER overshoot past -90° underground!
    const floorLimit = -Math.PI * 0.499;
    if (this.angle < floorLimit) {
      this.angle = floorLimit;
      if (this.vel < 0) this.vel = -this.vel * 0.14;
    }
    this.obj.rotation.x = this.angle;

    const flatY = 0.115 + this.foldLayer * 0.030;
    const activeY = this.customYFn ? this.customYFn(time) : this.baseY;
    const targetY = (foldFlat || !shouldBeUp) ? flatY : activeY;
    this.obj.position.y += (targetY - this.obj.position.y) * Math.min(1, dt * 8.5);
  }
}

/**
 * 2. GateFold (Center-Frame Opening + Coplanar Fold-Flat)
 */
export class GateFold {
  constructor(leftWing, rightWing, options = {}) {
    this.left = leftWing;
    this.right = rightWing;
    this.zPos = options.zPos ?? 0;
    this.startOpenAhead = options.startOpenAhead ?? 9.2;
    this.fullOpenAhead = options.fullOpenAhead ?? 3.6;
    this.closedAngle = options.closedAngle ?? 1.46;
    this.openAngle = options.openAngle ?? 0.14;
    this.currentAngle = this.closedAngle;
  }

  update(dt, camFocusZ, foldFlat) {
    let targetAngle;
    if (foldFlat) {
      targetAngle = 0.0;
    } else {
      const ahead = camFocusZ - this.zPos;
      if (ahead > this.startOpenAhead) {
        targetAngle = this.closedAngle;
      } else if (ahead < -8.5) {
        targetAngle = 0.0;
      } else {
        const p = THREE.MathUtils.clamp(
          (this.startOpenAhead - ahead) / (this.startOpenAhead - this.fullOpenAhead),
          0, 1
        );
        const eased = p * p * (3 - 2 * p);
        targetAngle = THREE.MathUtils.lerp(this.closedAngle, this.openAngle, eased);
      }
    }

    this.currentAngle += (targetAngle - this.currentAngle) * Math.min(1, dt * 5.2);
    if (this.left) this.left.rotation.y = this.currentAngle;
    if (this.right) this.right.rotation.y = -this.currentAngle;
  }
}

/**
 * 3. VolvelleArc (Upper-Sky Celestial Arc strictly inside biome)
 */
export class VolvelleArc {
  constructor(pivotGroup, options = {}) {
    this.pivot = pivotGroup;
    this.startT = options.startT ?? 0.54;
    this.endT = options.endT ?? 0.72;
    this.maxAngle = options.maxAngle ?? 0.54;
    this.currentAngle = this.maxAngle;
  }

  update(dt, scrollT, time, foldFlat) {
    let target;
    if (foldFlat) {
      target = 0.0;
    } else {
      const p = THREE.MathUtils.clamp((scrollT - this.startT) / (this.endT - this.startT), 0, 1);
      const eased = p * p * (3 - 2 * p);
      target = THREE.MathUtils.lerp(this.maxAngle, -this.maxAngle, eased) + Math.sin(time * 0.7) * 0.015;
    }
    this.currentAngle += (target - this.currentAngle) * Math.min(1, dt * 5.5);
    this.pivot.rotation.z = this.currentAngle;
  }
}

/**
 * 4. PullTabRail (Recessed Linear Sliding Track)
 */
export class PullTabRail {
  constructor(obj, options = {}) {
    this.obj = obj;
    this.startT = options.startT ?? 0.80;
    this.endT = options.endT ?? 0.99;
    this.startX = options.startX ?? -11.5;
    this.endX = options.endX ?? -0.5;
  }

  update(scrollT, foldFlat) {
    const p = THREE.MathUtils.clamp((scrollT - this.startT) / (this.endT - this.startT), 0, 1);
    const e = p * p * (3 - 2 * p);
    this.obj.position.x = THREE.MathUtils.lerp(this.startX, this.endX, e);
  }
}

/**
 * 5. PaperWalker v2.7 (Camera-Locked Story Pawn + Smooth Doorway Entry/Exit Fade!)
 * Supports `doorwayZones`: [{ fadeOutStart, hideStart, hideEnd, fadeInEnd }]
 * so when the protagonist steps into a tunnel archway or bathhouse front entrance,
 * they cleanly step INSIDE and re-emerge on the far side — ZERO wall clipping!
 */
export class PaperWalker {
  constructor(cardGroup, waypoints, options = {}) {
    this.obj = cardGroup;
    this.waypoints = waypoints;
    this.doorwayZones = options.doorwayZones ?? [];
    this.foldLayer = options.foldLayer ?? 8;
    this.hopHeight = options.hopHeight ?? 0.24;

    this.stepPhase = 0;
    this.angleX = -Math.PI * 0.498;
    this.velX = 0;
    this.waddle = 0;
    this.currentOpacity = 1.0;
  }

  samplePath(t) {
    const pts = this.waypoints;
    if (t <= pts[0].t) return { ...pts[0] };
    if (t >= pts[pts.length - 1].t) return { ...pts[pts.length - 1] };
    for (let i = 0; i < pts.length - 1; i++) {
      const a = pts[i], b = pts[i + 1];
      if (t >= a.t && t <= b.t) {
        const f = (t - a.t) / Math.max(0.0001, b.t - a.t);
        const s = (a.linear || b.linear) ? f : (f * f * (3 - 2 * f));
        return {
          x: THREE.MathUtils.lerp(a.x, b.x, s),
          y: THREE.MathUtils.lerp(a.y, b.y, s),
          z: THREE.MathUtils.lerp(a.z, b.z, s),
        };
      }
    }
    return { ...pts[0] };
  }

  computeDoorwayOpacity(t, foldFlat) {
    if (foldFlat) return 1.0;
    let alpha = 1.0;
    for (const z of this.doorwayZones) {
      if (t >= z.fadeOutStart && t <= z.fadeInEnd) {
        if (t < z.hideStart) {
          const p = (t - z.fadeOutStart) / Math.max(0.0001, z.hideStart - z.fadeOutStart);
          alpha = Math.min(alpha, 1.0 - p);
        } else if (t <= z.hideEnd) {
          alpha = 0.0;
        } else {
          const p = (t - z.hideEnd) / Math.max(0.0001, z.fadeInEnd - z.hideEnd);
          alpha = Math.min(alpha, p);
        }
      }
    }
    return THREE.MathUtils.clamp(alpha, 0, 1);
  }

  impulse(strength = 4.5) {
    this.velX += strength;
  }

  update(dt, scrollT, velocity, time, foldFlat) {
    const p = this.samplePath(scrollT);
    const moving = !foldFlat && velocity > 0.0018;

    if (moving) {
      this.stepPhase += dt * Math.min(22, 6 + velocity * 340);
    } else {
      const rem = this.stepPhase % Math.PI;
      if (rem > 0.05 && rem < Math.PI - 0.05) {
        this.stepPhase += dt * 7.5;
      }
    }

    const hop = moving ? Math.abs(Math.sin(this.stepPhase)) * this.hopHeight : 0;
    const targetWaddle = moving ? Math.sin(this.stepPhase) * 0.082 : 0;
    this.waddle += (targetWaddle - this.waddle) * Math.min(1, dt * 10);

    const targetRotX = foldFlat ? -Math.PI * 0.498 : (moving ? -0.05 : 0.0);
    const force = (targetRotX - this.angleX) * 140 - this.velX * 13;
    this.velX += force * dt;
    this.angleX += this.velX * dt;
    const floorLimit = -Math.PI * 0.499;
    if (this.angleX < floorLimit) {
      this.angleX = floorLimit;
      if (this.velX < 0) this.velX = -this.velX * 0.12;
    }

    this.obj.position.x = p.x;
    this.obj.position.z = p.z;
    const flatY = 0.115 + this.foldLayer * 0.030;
    const targetY = foldFlat ? flatY : (p.y + hop);
    this.obj.position.y += (targetY - this.obj.position.y) * Math.min(1, dt * 15);

    this.obj.rotation.x = this.angleX;
    this.obj.rotation.z = foldFlat ? 0 : this.waddle;

    // Smooth doorway fade (prevents walking through solid tunnel or bathhouse walls!)
    const targetAlpha = this.computeDoorwayOpacity(scrollT, foldFlat);
    this.currentOpacity += (targetAlpha - this.currentOpacity) * Math.min(1, dt * 16);
    const mats = this.obj.userData.fadeMaterials;
    if (mats) {
      for (const m of mats) m.opacity = this.currentOpacity;
    }
    this.obj.visible = this.currentOpacity > 0.03;
  }
}
