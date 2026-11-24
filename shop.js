const WEAPONS = [
  { id: "pistol",  name: "Пистолет",  price: 0,    damage: 15,  fireRate: 400,  color: 0x4fc3f7 },
  { id: "smg",     name: "ПП",        price: 500,  damage: 10,  fireRate: 120,  color: 0x9ccc65 },
  { id: "rifle",   name: "Автомат",   price: 1200, damage: 25,  fireRate: 180,  color: 0xffb74d },
  { id: "shotgun", name: "Дробовик",  price: 1800, damage: 60,  fireRate: 800,  color: 0xef5350 },
  { id: "sniper",  name: "Снайперка", price: 2500, damage: 100, fireRate: 1200, color: 0xba68c8 },
];

const STORAGE_KEY = "shooter_profile_v1";

function loadProfile() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {}
  return { coins: 1000, owned: ["pistol"], active: "pistol", kills: 0 };
}

function saveProfile(p) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(p));
}

let profile = loadProfile();

function getWeapon(id) {
  return WEAPONS.find(w => w.id === id) || WEAPONS[0];
}

function activeWeapon() {
  return getWeapon(profile.active);
}

function buyWeapon(id) {
  const w = getWeapon(id);
  if (profile.owned.includes(id)) return { ok: false, reason: "Уже куплено" };
  if (profile.coins < w.price) return { ok: false, reason: "Не хватает монет" };
  profile.coins -= w.price;
  profile.owned.push(id);
  saveProfile(profile);
  return { ok: true };
}

function equipWeapon(id) {
  if (!profile.owned.includes(id)) return { ok: false, reason: "Не куплено" };
  profile.active = id;
  saveProfile(profile);
  return { ok: true };
}

function addCoins(n) {
  profile.coins += n;
  saveProfile(profile);
}

function registerKill() {
  profile.kills++;
  profile.coins += 50;
  saveProfile(profile);
}

export { WEAPONS, profile, getWeapon, activeWeapon, buyWeapon, equipWeapon, addCoins, registerKill };
