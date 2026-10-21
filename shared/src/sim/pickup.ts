import type { PickupView, Vec2 } from "../types.ts";
import { Entity } from "./entity.ts";
import type { Ship } from "./ship.ts";

export const PICKUP_TYPES = ["shield", "rapid-fire", "homing-ammo"] as const;
export type PickupType = (typeof PICKUP_TYPES)[number];

export class Pickup extends Entity {
  readonly kind = "pickup";
  readonly pickupType: PickupType;
  life = 15;

  constructor(pos: Vec2, type: PickupType = "shield") {
    super({ pos, radius: 13 });
    this.pickupType = type;
  }

  override update(dt: number): void {
    this.life -= dt;
    if (this.life <= 0) this.markDead();
  }

  applyTo(ship: Ship): void {
    switch (this.pickupType) {
      case "shield":
        ship.shield = 8;
        break;
      case "rapid-fire":
        ship.rapidFire = 8;
        break;
      case "homing-ammo":
        ship.homingAmmo += 5;
        break;
      default:
        return assertNeverPickup(this.pickupType);
    }
    this.markDead();
  }

  toView(): PickupView {
    const typeIndex = PICKUP_TYPES.indexOf(this.pickupType);
    return {
      kind: "pickup",
      id: this.id,
      x: this.pos.x,
      y: this.pos.y,
      vx: this.vel.x,
      vy: this.vel.y,
      angle: this.angle,
      pickupType: (typeIndex >= 0 ? typeIndex : 0) as 0 | 1 | 2,
    };
  }
}

function assertNeverPickup(value: never): never {
  throw new Error(`unknown pickup type ${String(value)}`);
}
