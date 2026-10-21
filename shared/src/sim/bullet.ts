import { BULLET } from "../constants.ts";
import type { BulletView, EntityId, Seq, Vec2 } from "../types.ts";
import { asEntityId, asSeq } from "../types.ts";
import { Entity } from "./entity.ts";
import { integrateBullet } from "./integrate.ts";
import type { World } from "./world.ts";

export class Bullet extends Entity {
  readonly kind = "bullet";
  ttl = BULLET.ttl;
  readonly damage = BULLET.damage;
  readonly ownerId: EntityId;
  readonly fireSeq: Seq;
  homing: boolean;

  constructor(
    pos: Vec2,
    vel: Vec2,
    ownerId: EntityId = asEntityId(0),
    fireSeq: Seq = asSeq(0),
    homing = false,
  ) {
    super({ pos, vel, radius: BULLET.radius });
    this.ownerId = ownerId;
    this.fireSeq = fireSeq;
    this.homing = homing;
  }

  override update(dt: number, world: World): void {
    this.ttl -= dt;
    if (this.ttl <= 0) {
      this.markDead();
      return;
    }

    if (this.homing) {
      this.steerHoming(dt, world);
    }

    integrateBullet(this, dt, world.width, world.height);
  }

  private steerHoming(dt: number, world: World): void {
    let closestDistSq = Infinity;
    let targetPos: Vec2 | null = null;

    for (const entity of world) {
      if (!entity.alive || entity.id === this.ownerId) continue;
      if (entity.kind === "asteroid" || entity.kind === "ship") {
        const dx = entity.pos.x - this.pos.x;
        const dy = entity.pos.y - this.pos.y;
        const distSq = dx * dx + dy * dy;
        if (distSq < closestDistSq) {
          closestDistSq = distSq;
          targetPos = entity.pos;
        }
      }
    }

    if (targetPos) {
      const dx = targetPos.x - this.pos.x;
      const dy = targetPos.y - this.pos.y;
      const targetAngle = Math.atan2(dy, dx);
      const currentSpeed = Math.hypot(this.vel.x, this.vel.y) || 450;

      const currentAngle = Math.atan2(this.vel.y, this.vel.x);
      let diff = targetAngle - currentAngle;
      while (diff < -Math.PI) diff += Math.PI * 2;
      while (diff > Math.PI) diff -= Math.PI * 2;

      const turnSpeed = 6;
      const step = Math.sign(diff) * Math.min(Math.abs(diff), turnSpeed * dt);
      const newAngle = currentAngle + step;

      this.vel.x = Math.cos(newAngle) * currentSpeed;
      this.vel.y = Math.sin(newAngle) * currentSpeed;
    }
  }

  toView(): BulletView {
    return {
      kind: "bullet",
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      vx: this.vel.x,
      vy: this.vel.y,
      angle: Math.atan2(this.vel.y, this.vel.x),
      ownerId: this.ownerId,
      fireSeq: this.fireSeq,
      homing: this.homing ? 1 : 0,
    };
  }
}
