import * as THREE from 'three';
import { profile, activeWeapon, addCoins, registerKill } from './shop.js';
import { renderShop } from './shop-ui.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x0b1020);
scene.fog = new THREE.Fog(0x0b1020, 20, 70);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 200);
camera.position.set(0, 12, 12);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

scene.add(new THREE.HemisphereLight(0x88aaff, 0x223344, 1.2));
const dir = new THREE.DirectionalLight(0xffffff, 1.5);
dir.position.set(5, 10, 5);
scene.add(dir);

const ground = new THREE.Mesh(
  new THREE.PlaneGeometry(60, 60),
  new THREE.MeshStandardMaterial({ color: 0x1a2340, roughness: 0.9 })
);
ground.rotation.x = -Math.PI / 2;
scene.add(ground);
scene.add(new THREE.GridHelper(60, 30, 0x3355aa, 0x223366));

const player = new THREE.Mesh(
  new THREE.BoxGeometry(1, 1, 1),
  new THREE.MeshStandardMaterial({ color: 0x4fc3f7, emissive: 0x1e6fa8, emissiveIntensity: 0.6 })
);
player.position.y = 0.5;
scene.add(player);

const coins = [];
const coinGeo = new THREE.TorusGeometry(0.4, 0.15, 12, 24);
const coinMat = new THREE.MeshStandardMaterial({ color: 0xffcc33, emissive: 0xaa7700, emissiveIntensity: 0.8 });

function spawnCoin() {
  const c = new THREE.Mesh(coinGeo, coinMat);
  c.position.set((Math.random() - 0.5) * 40, 0.8, (Math.random() - 0.5) * 40);
  c.rotation.x = Math.PI / 2;
  scene.add(c);
  coins.push(c);
}
for (let i = 0; i < 15; i++) spawnCoin();

const input = { x: 0, z: 0 };
let pointerId = null, startX = 0, startY = 0, moved = false;

renderer.domElement.addEventListener('pointerdown', e => {
  pointerId = e.pointerId;
  startX = e.clientX; startY = e.clientY; moved = false;
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerId !== pointerId) return;
  const dx = e.clientX - startX, dy = e.clientY - startY;
  if (Math.hypot(dx, dy) > 10) moved = true;
  const len = Math.hypot(dx, dy) || 1;
  const max = Math.min(len, 80);
  input.x = (dx / len) * (max / 80);
  input.z = (dy / len) * (max / 80);
});
function release(e) {
  if (e.pointerId !== pointerId) return;
  pointerId = null; input.x = 0; input.z = 0;
  if (!moved) shoot();
}
renderer.domElement.addEventListener('pointerup', release);
renderer.domElement.addEventListener('pointercancel', release);

let score = 0;
const scoreEl = document.getElementById('score');
const coinsEl = document.getElementById('coins');
coinsEl.textContent = profile.coins;

function shoot() {
  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    if (c.position.distanceTo(player.position) < 3) {
      scene.remove(c); coins.splice(i, 1);
      registerKill();
      score++;
      scoreEl.textContent = score;
      coinsEl.textContent = profile.coins;
      spawnCoin();
      return;
    }
  }
}

const keys = {};
addEventListener('keydown', e => keys[e.key.toLowerCase()] = true);
addEventListener('keyup', e => keys[e.key.toLowerCase()] = false);

const clock = new THREE.Clock();
const SPEED = 8;

function applyWeaponColor() {
  const w = activeWeapon();
  player.material.color.setHex(w.color);
  player.material.emissive.setHex(w.color);
  player.material.emissiveIntensity = 0.4;
}
applyWeaponColor();

const shopEl = document.getElementById('shop');
document.getElementById('btn-shop').onclick = () => {
  shopEl.style.display = 'block';
  renderShop(shopEl, () => {
    coinsEl.textContent = profile.coins;
    applyWeaponColor();
  });
};
shopEl.addEventListener('click', e => {
  if (e.target === shopEl) shopEl.style.display = 'none';
});

function tick() {
  const dt = Math.min(clock.getDelta(), 0.05);

  let mx = input.x, mz = input.z;
  if (keys['w'] || keys['arrowup']) mz -= 1;
  if (keys['s'] || keys['arrowdown']) mz += 1;
  if (keys['a'] || keys['arrowleft']) mx -= 1;
  if (keys['d'] || keys['arrowright']) mx += 1;

  player.position.x = THREE.MathUtils.clamp(player.position.x + mx * SPEED * dt, -28, 28);
  player.position.z = THREE.MathUtils.clamp(player.position.z + mz * SPEED * dt, -28, 28);

  for (const c of coins) c.rotation.z += dt * 3;

  for (let i = coins.length - 1; i >= 0; i--) {
    const c = coins[i];
    if (c.position.distanceTo(player.position) < 1.2) {
      scene.remove(c); coins.splice(i, 1);
      addCoins(10);
      coinsEl.textContent = profile.coins;
      spawnCoin();
    }
  }

  camera.position.x += (player.position.x - camera.position.x) * 0.1;
  camera.position.z += (player.position.z + 12 - camera.position.z) * 0.1;
  camera.lookAt(player.position.x, 0, player.position.z);

  renderer.render(scene, camera);
  requestAnimationFrame(tick);
}
tick();

addEventListener('resize', () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
