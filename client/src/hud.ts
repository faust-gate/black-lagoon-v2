import type { GameClient } from "./net/gameclient.ts";

export interface HudElements {
  scoreEl: HTMLElement;
  eventEl: HTMLElement;
  ammoEl?: HTMLElement;
  shieldEl?: HTMLElement;
}

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

  // Періодичне оновлення лічильників HUD (щит та набої) для власного корабля
  const updateInterval = setInterval(() => {
    const worldView = (
      game as unknown as {
        view?: {
          ships?: Array<{
            own?: boolean;
            homingAmmo?: number;
            shield?: number;
          }>;
        };
      }
    ).view;
    const ownShip = worldView?.ships?.find((s) => s.own);

    if (ammoEl) {
      const ammo = ownShip?.homingAmmo ?? 0;
      ammoEl.textContent = ammo > 0 ? `HOMING AMMO: ${ammo}` : "";
    }

    if (shieldEl) {
      const shield = ownShip?.shield ?? 0;
      shieldEl.textContent = shield > 0 ? `SHIELD ACTIVE` : "";
    }
  }, 100);

  return () => {
    clearInterval(updateInterval);
    for (const off of offs) off();
  };
}
