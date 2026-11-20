import { initialState } from './engine';
import type { GameState } from './types';

const SAVE_KEY = 'holland-game-save-v1';

export function loadGame(): GameState {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return initialState();
    const parsed = JSON.parse(raw) as GameState;
    if (parsed.version !== 1 || !Array.isArray(parsed.entities) || !parsed.inventory) return initialState();
    return parsed;
  } catch {
    return initialState();
  }
}

export function saveGame(state: GameState): void {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(state));
  } catch (error) {
    console.warn('Holland_Game kon de lokale save niet opslaan.', error);
  }
}

export function clearSave(): void {
  localStorage.removeItem(SAVE_KEY);
}
