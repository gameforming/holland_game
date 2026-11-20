import { CONTAINERS, MACHINES } from './catalog';
import type { BuildId, ContainerId, Direction, Entity, GameState, Inventory, ItemBag, ItemId } from './types';

const DIRECTIONS: Direction[] = ['up', 'right', 'down', 'left'];
const DELTAS: Record<Direction, { x: number; y: number }> = {
  up: { x: 0, y: -1 }, right: { x: 1, y: 0 }, down: { x: 0, y: 1 }, left: { x: -1, y: 0 },
};
const MAX_MACHINE_STACK = 100;
const MACHINE_SLOTS = 5;

export function initialState(): GameState {
  return {
    version: 1,
    coins: 25000,
    width: 12,
    height: 8,
    entities: [],
    inventory: { items: {} },
    expansions: { left: 0, right: 0, top: 0, bottom: 0 },
    tick: 0,
    nextEntityId: 1,
  };
}

export function rotateDirection(direction: Direction): Direction {
  return DIRECTIONS[(DIRECTIONS.indexOf(direction) + 1) % DIRECTIONS.length];
}

export function neighbor(x: number, y: number, direction: Direction) {
  const delta = DELTAS[direction];
  return { x: x + delta.x, y: y + delta.y };
}

export function expansionCost(state: GameState, side: keyof GameState['expansions']): number {
  const base = side === 'left' || side === 'right' ? 1100 : 900;
  return Math.round(base * Math.pow(1.52, state.expansions[side]));
}

export function expandGrid(state: GameState, side: keyof GameState['expansions']): GameState {
  const cost = expansionCost(state, side);
  if (state.coins < cost) return state;
  const next = cloneState(state);
  next.coins -= cost;
  next.expansions[side] += 1;
  if (side === 'left') {
    next.width += 4;
    next.entities = next.entities.map((entity) => ({ ...entity, x: entity.x + 4 }));
  } else if (side === 'right') {
    next.width += 4;
  } else if (side === 'top') {
    next.height += 3;
    next.entities = next.entities.map((entity) => ({ ...entity, y: entity.y + 3 }));
  } else {
    next.height += 3;
  }
  return next;
}

export function placeBuild(state: GameState, buildId: BuildId, x: number, y: number): GameState {
  if (x < 0 || y < 0 || x >= state.width || y >= state.height || entityAt(state, x, y)) return state;
  const cost = buildId === 'belt' ? 12 : buildId in MACHINES ? MACHINES[buildId as keyof typeof MACHINES].cost : CONTAINERS[buildId as ContainerId].cost;
  if (state.coins < cost) return state;
  const next = cloneState(state);
  const id = `entity-${next.nextEntityId}`;
  next.nextEntityId += 1;
  next.coins -= cost;
  if (buildId === 'belt') {
    next.entities.push({ id, type: 'belt', x, y, rotation: 'right', item: null });
  } else if (buildId in MACHINES) {
    next.entities.push({
      id, type: 'machine', machineId: buildId as keyof typeof MACHINES,
      x, y, rotation: 'right', input: {}, output: {}, progress: 0, produced: 0,
    });
  } else {
    next.entities.push({ id, type: 'container', containerId: buildId as ContainerId, x, y, rotation: 'right', contents: {} });
  }
  return next;
}

export function removeEntity(state: GameState, id: string): GameState {
  return { ...state, entities: state.entities.filter((entity) => entity.id !== id) };
}

export function rotateEntity(state: GameState, id: string): GameState {
  return {
    ...state,
    entities: state.entities.map((entity) => entity.id === id ? { ...entity, rotation: rotateDirection(entity.rotation) } : entity),
  };
}

export function entityAt(state: GameState, x: number, y: number): Entity | undefined {
  return state.entities.find((entity) => entity.x === x && entity.y === y);
}

export function collectEntity(state: GameState, id: string): GameState {
  const next = cloneState(state);
  const entity = next.entities.find((candidate) => candidate.id === id);
  if (!entity) return state;
  if (entity.type === 'belt') {
    if (!entity.item) return state;
    next.inventory.items[entity.item] = (next.inventory.items[entity.item] ?? 0) + 1;
    entity.item = null;
    return next;
  }
  const bag = entity.type === 'machine' ? entity.output : entity.contents;
  for (const [item, qty] of Object.entries(bag) as [ItemId, number][]) {
    next.inventory.items[item] = (next.inventory.items[item] ?? 0) + qty;
  }
  if (entity.type === 'machine') entity.output = {};
  if (entity.type === 'container') entity.contents = {};
  return next;
}

export function moveInventoryIntoMachine(state: GameState, entityId: string, item: ItemId, requestedQty?: number): GameState {
  const next = cloneState(state);
  const entity = next.entities.find((candidate) => candidate.id === entityId);
  if (!entity || entity.type !== 'machine') return state;
  const definition = MACHINES[entity.machineId];
  if (definition.mode !== 'processor' || !definition.recipe?.[item]) return state;
  const available = next.inventory.items[item] ?? 0;
  const qty = Math.min(available, requestedQty ?? available, 100 - (entity.input[item] ?? 0));
  if (qty <= 0 || !canAddToMachineBag(entity.input, item, qty)) return state;
  entity.input[item] = (entity.input[item] ?? 0) + qty;
  next.inventory.items[item] = available - qty;
  if (next.inventory.items[item] <= 0) delete next.inventory.items[item];
  return next;
}

export function moveInventoryIntoContainer(state: GameState, entityId: string, item: ItemId, requestedQty?: number): GameState {
  const next = cloneState(state);
  const entity = next.entities.find((candidate) => candidate.id === entityId);
  if (!entity || entity.type !== 'container') return state;
  const available = next.inventory.items[item] ?? 0;
  const definition = CONTAINERS[entity.containerId];
  const stored = bagTotal(entity.contents);
  const qty = Math.min(available, requestedQty ?? available, definition.capacity - stored);
  if (qty <= 0) return state;
  entity.contents[item] = (entity.contents[item] ?? 0) + qty;
  next.inventory.items[item] = available - qty;
  if (next.inventory.items[item] <= 0) delete next.inventory.items[item];
  return next;
}

export function tickGame(state: GameState): GameState {
  const next = cloneState(state);
  next.tick += 1;

  // Machines produce into their own five-slot buffers first.
  for (const entity of next.entities) {
    if (entity.type !== 'machine') continue;
    const definition = MACHINES[entity.machineId];
    if (definition.mode === 'extractor') {
      entity.progress += 1;
      if (entity.progress >= definition.cycle && definition.produces) {
        if (canAddToMachineBag(entity.output, definition.produces, 1)) {
          entity.output[definition.produces] = (entity.output[definition.produces] ?? 0) + 1;
          entity.progress = 0;
          entity.produced += 1;
        } else {
          entity.progress = definition.cycle;
        }
      }
    } else {
      const hasRecipe = Object.entries(definition.recipe ?? {}).every(([item, qty]) => (entity.input[item as ItemId] ?? 0) >= (qty ?? 0));
      const hasOutputSpace = Object.entries(definition.results ?? {}).every(([item, qty]) => canAddToMachineBag(entity.output, item as ItemId, qty ?? 0));
      if (hasRecipe && hasOutputSpace) {
        entity.progress += 1;
        if (entity.progress >= definition.cycle) {
          for (const [item, qty] of Object.entries(definition.recipe ?? {}) as [ItemId, number][]) {
            entity.input[item] = (entity.input[item] ?? 0) - qty;
            if (entity.input[item] <= 0) delete entity.input[item];
          }
          for (const [item, qty] of Object.entries(definition.results ?? {}) as [ItemId, number][]) {
            entity.output[item] = (entity.output[item] ?? 0) + qty;
          }
          entity.progress = 0;
          entity.produced += 1;
        }
      }
    }
  }

  // Factories eject output to a neighboring conveyor that carries it away.
  for (const entity of next.entities) {
    if (entity.type === 'machine') {
      for (const [item, qty] of Object.entries(entity.output) as [ItemId, number][]) {
        if (qty <= 0) continue;
        const belt = findOutputBelt(next, entity.x, entity.y);
        if (belt) {
          belt.item = item;
          entity.output[item] = qty - 1;
          if (entity.output[item] <= 0) delete entity.output[item];
          break;
        }
      }
    } else if (entity.type === 'container') {
      const target = neighbor(entity.x, entity.y, entity.rotation);
      const belt = entityAt(next, target.x, target.y);
      if (belt?.type === 'belt' && belt.item === null) {
        const beltExit = neighbor(belt.x, belt.y, belt.rotation);
        if (beltExit.x === entity.x && beltExit.y === entity.y) continue;
        const first = Object.entries(entity.contents).find(([, qty]) => qty > 0) as [ItemId, number] | undefined;
        if (first) {
          belt.item = first[0];
          const remaining = first[1] - 1;
          if (remaining <= 0) delete entity.contents[first[0]];
          else entity.contents[first[0]] = remaining;
        }
      }
    }
  }

  // Move each item at most one tile per tick (use a snapshot so belts cannot chain-hop).
  const beltMoves = next.entities
    .filter((entity): entity is Extract<Entity, { type: 'belt' }> => entity.type === 'belt' && entity.item !== null)
    .map((entity) => ({ id: entity.id, item: entity.item as ItemId }));
  for (const move of beltMoves) {
    const source = next.entities.find((entity) => entity.id === move.id);
    if (!source || source.type !== 'belt' || source.item !== move.item) continue;
    const destination = neighbor(source.x, source.y, source.rotation);
    const target = entityAt(next, destination.x, destination.y);
    if (!target) continue;
    if (target.type === 'belt') {
      if (target.item === null) {
        target.item = move.item;
        source.item = null;
      }
    } else if (target.type === 'container') {
      const capacity = CONTAINERS[target.containerId].capacity;
      if (bagTotal(target.contents) < capacity) {
        target.contents[move.item] = (target.contents[move.item] ?? 0) + 1;
        source.item = null;
      }
    } else {
      const definition = MACHINES[target.machineId];
      if (definition.mode === 'processor' && definition.recipe?.[move.item] && canAddToMachineBag(target.input, move.item, 1)) {
        target.input[move.item] = (target.input[move.item] ?? 0) + 1;
        source.item = null;
      }
    }
  }
  return next;
}

export function inventoryEntries(inventory: Inventory): { id: ItemId; qty: number }[] {
  return Object.entries(inventory.items)
    .filter(([, qty]) => (qty ?? 0) > 0)
    .map(([id, qty]) => ({ id: id as ItemId, qty: qty ?? 0 }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function bagTotal(bag: ItemBag): number {
  return Object.values(bag).reduce((sum, qty) => sum + (qty ?? 0), 0);
}

function canAddToMachineBag(bag: ItemBag, item: ItemId, qty: number): boolean {
  const activeSlots = Object.entries(bag).filter(([, amount]) => (amount ?? 0) > 0).length;
  const hasSlot = (bag[item] ?? 0) > 0 || activeSlots < MACHINE_SLOTS;
  return hasSlot && (bag[item] ?? 0) + qty <= MAX_MACHINE_STACK;
}

function findOutputBelt(state: GameState, x: number, y: number) {
  for (const direction of DIRECTIONS) {
    const position = neighbor(x, y, direction);
    const entity = entityAt(state, position.x, position.y);
    if (entity?.type !== 'belt' || entity.item !== null) continue;
    const nextPosition = neighbor(entity.x, entity.y, entity.rotation);
    if (nextPosition.x === x && nextPosition.y === y) continue;
    return entity;
  }
  return undefined;
}

function cloneState(state: GameState): GameState {
  return {
    ...state,
    inventory: { items: { ...state.inventory.items } },
    expansions: { ...state.expansions },
    entities: state.entities.map((entity) => {
      if (entity.type === 'machine') return { ...entity, input: { ...entity.input }, output: { ...entity.output } };
      if (entity.type === 'container') return { ...entity, contents: { ...entity.contents } };
      return { ...entity };
    }),
  };
}
