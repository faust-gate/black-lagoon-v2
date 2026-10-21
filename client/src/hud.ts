import type { GameClient } from "./net/gameclient.ts";

export interface HudElements {
  scoreEl: HTMLElement;
  eventEl: HTMLElement;
  ammoEl?: HTMLElement;
  shieldEl?: HTMLElement;
}

const SHIP_FLAGS = {
  THRUST: 1,
  INVULNERABLE: 2,
  SHIELD: 4,
  RAPID_FIRE: 8,
} as const;

export function attachHudEvents(
  game: GameClient,
  { scoreEl, eventEl, ammoEl, shieldEl }: HudElements,
): () => void {
  const offs = [
    game.events.on("scoreChanged", ({ score }) => {
      scoreEl.textContent = String(score);
    }),
    game.events.on("fired", () => {
      eventEl.textContent = "Event bus: fired";
    }),
    game.events.on("hit", ({ target }) => {
      eventEl.textContent = `Event bus: hit (${target})`;
    }),
    game.events.on("exploded", ({ kind }) => {
      eventEl.textContent = `Event bus: exploded (${kind})`;
    }),
  ];

  // Періодичне оновлення лічильників HUD для власного корабля
  const updateInterval = setInterval(() => {
    const worldView = (
      game as unknown as {
        view?: {
          ships?: Array<{
            own?: boolean;
            homingAmmo?: number;
            flags?: number;
          }>;
        };
      }
    ).view;

    const ownShip = worldView?.ships?.find((s) => s.own);

    if (ownShip) {
      const flags = ownShip.flags ?? 0;
      const hasShield = (flags & SHIP_FLAGS.SHIELD) !== 0;
      const hasRapid = (flags & SHIP_FLAGS.RAPID_FIRE) !== 0;
      const homingAmmo = ownShip.homingAmmo ?? 0;

      if (shieldEl) {
        shieldEl.textContent = hasShield ? "SHIELD ACTIVE" : "";
      }

      if (ammoEl) {
        const parts: string[] = [];
        if (homingAmmo > 0) parts.push(`HOMING: ${homingAmmo}`);
        if (hasRapid) parts.push("RAPID FIRE");
        ammoEl.textContent = parts.join(" | ");
      }
    }
  }, 100);

  return () => {
    clearInterval(updateInterval);
    for (const off of offs) off();
  };
}
