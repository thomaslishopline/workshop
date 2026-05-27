import { GameEngine } from './game-engine.js';

const canvas = document.getElementById('gameCanvas');
const game = new GameEngine(canvas);
game.init();
game.start();
