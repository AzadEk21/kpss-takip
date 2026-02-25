import { DB } from './db/DB.js';
import { Auth } from './auth/Auth.js';
import { State, ExtSettings } from './state/State.js';
import { Utils, PALETTE } from './utils/Utils.js';
import { Game } from './game/Game.js';
import { AI } from './ai/AI.js';
import { UI } from './ui/UI.js';
import { App } from './app/App.js';

window.onerror = function(msg, url, lineNo, columnNo, error) { console.error(msg, lineNo, error); return false; };

window.DB = DB;
window.Auth = Auth;
window.State = State;
window.ExtSettings = ExtSettings;
window.Utils = Utils;
window.PALETTE = PALETTE;
window.Game = Game;
window.AI = AI;
window.UI = UI;
window.App = App;

document.addEventListener('DOMContentLoaded', () => { App.init(); });