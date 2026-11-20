import { Game } from './game.js';

const menu = document.querySelector('#menu');
const gameRoot = document.querySelector('#game');
let game = null;

function showError(error) {
  console.error('VERITY startup error:', error);
  let panel = document.querySelector('#startup-error');
  if (!panel) {
    panel = document.createElement('div');
    panel.id = 'startup-error';
    panel.style.cssText = 'position:fixed;z-index:100;left:50%;top:18px;transform:translateX(-50%);width:min(680px,92vw);padding:16px;background:#4b1717;color:white;border:2px solid #ff7777;font:14px/1.5 monospace;white-space:pre-wrap;';
    document.body.append(panel);
  }
  panel.textContent = 'VERITY не удалось запустить. Обнови страницу и проверь подключение к интернету (Three.js загружается с CDN).
' + (error?.message || String(error));
  menu.classList.remove('hidden');
  gameRoot.classList.add('hidden');
}

function start(load = false) {
  try {
    // Создаём WebGL и игру до скрытия меню, чтобы при ошибке меню осталось доступным.
    if (!game) game = new Game(gameRoot, { onExit: () => {
      gameRoot.classList.add('hidden');
      menu.classList.remove('hidden');
    }});
    menu.classList.add('hidden');
    gameRoot.classList.remove('hidden');
    game.start(load);
    document.querySelector('#startup-error')?.remove();
  } catch (error) {
    showError(error);
  }
}

document.querySelector('#new-world').addEventListener('click', () => start(false));
document.querySelector('#continue-world').addEventListener('click', () => start(true));
document.querySelector('#settings-button').addEventListener('click', () => document.querySelector('#settings').classList.toggle('hidden'));
document.querySelector('#sensitivity').addEventListener('input', e => { if (game) game.settings.sensitivity = Number(e.target.value); });
document.querySelector('#render-distance').addEventListener('input', e => { if (game) game.settings.renderDistance = Number(e.target.value); });

window.addEventListener('error', e => showError(e.error || e.message));
window.addEventListener('unhandledrejection', e => showError(e.reason));
