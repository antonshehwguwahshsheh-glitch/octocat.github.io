import { WEAPONS, profile, buyWeapon, equipWeapon } from "./shop.js";

export function renderShop(container, onChange) {
  container.innerHTML = "";

  const header = document.createElement("div");
  header.className = "shop-header";
  header.innerHTML = `<h2>Магазин</h2><div class="coins">🪙 ${profile.coins}</div>`;
  container.appendChild(header);

  const list = document.createElement("div");
  list.className = "shop-list";

  for (const w of WEAPONS) {
    const owned = profile.owned.includes(w.id);
    const active = profile.active === w.id;

    const card = document.createElement("div");
    card.className = "shop-card" + (active ? " active" : "");

    card.innerHTML = `
      <div class="w-icon" style="background:#${w.color.toString(16).padStart(6, "0")}"></div>
      <div class="w-info">
        <div class="w-name">${w.name}</div>
        <div class="w-stats">Урон ${w.damage} · Скорость ${w.fireRate}мс</div>
      </div>
      <div class="w-action"></div>
    `;

    const action = card.querySelector(".w-action");

    if (active) {
      const btn = document.createElement("button");
      btn.textContent = "Активно";
      btn.disabled = true;
      action.appendChild(btn);
    } else if (owned) {
      const btn = document.createElement("button");
      btn.textContent = "Выбрать";
      btn.onclick = () => {
        equipWeapon(w.id);
        onChange?.();
        renderShop(container, onChange);
      };
      action.appendChild(btn);
    } else {
      const btn = document.createElement("button");
      btn.textContent = `Купить · ${w.price}`;
      btn.disabled = profile.coins < w.price;
      btn.onclick = () => {
        const res = buyWeapon(w.id);
        if (res.ok) {
          equipWeapon(w.id);
          onChange?.();
          renderShop(container, onChange);
        } else {
          alert(res.reason);
        }
      };
      action.appendChild(btn);
    }

    list.appendChild(card);
  }

  container.appendChild(list);
}
