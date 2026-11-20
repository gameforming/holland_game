export type ItemId =
  | 'iron_ore' | 'coal' | 'copper_ore' | 'stone' | 'wood' | 'crude_oil'
  | 'sand' | 'limestone' | 'water' | 'clay' | 'bauxite' | 'quartz'
  | 'lithium_ore' | 'cotton' | 'salt'
  | 'iron_ingot' | 'copper_ingot' | 'planks' | 'steel' | 'fuel'
  | 'glass' | 'cement' | 'bricks' | 'plastic' | 'paper'
  | 'machinery_parts' | 'chemicals' | 'aluminium_ingot' | 'silicon'
  | 'cable' | 'electronics' | 'battery' | 'fabric' | 'ceramic' | 'rubber';

export type ItemBag = Partial<Record<ItemId, number>>;
export type MachineId =
  | 'iron_mine' | 'coal_mine' | 'copper_mine' | 'stone_quarry' | 'wood_farm'
  | 'oil_pumpjack' | 'sand_quarry' | 'limestone_quarry' | 'water_pump' | 'clay_pit'
  | 'bauxite_mine' | 'quartz_quarry' | 'lithium_mine' | 'cotton_farm' | 'salt_mine'
  | 'sawmill' | 'iron_smelter' | 'copper_smelter' | 'steel_furnace'
  | 'oil_refinery' | 'glass_furnace' | 'cement_kiln' | 'brickworks'
  | 'polymer_plant' | 'paper_mill' | 'component_assembler' | 'chemical_plant'
  | 'aluminium_smelter' | 'silicon_furnace' | 'cable_factory' | 'electronics_factory'
  | 'battery_plant' | 'textile_mill' | 'ceramics_kiln' | 'rubber_works';
export type ContainerId = 'wooden_crate' | 'steel_container' | 'industrial_silo' | 'mega_warehouse';
export type BuildId = MachineId | ContainerId | 'belt';
export type BuildCategory = 'extractors' | 'processors' | 'transport' | 'storage';
export type Direction = 'up' | 'right' | 'down' | 'left';

interface BaseEntity {
  id: string;
  x: number;
  y: number;
  rotation: Direction;
}

export interface MachineEntity extends BaseEntity {
  type: 'machine';
  machineId: MachineId;
  input: ItemBag;
  output: ItemBag;
  progress: number;
  produced: number;
}

export interface BeltEntity extends BaseEntity {
  type: 'belt';
  item: ItemId | null;
}

export interface ContainerEntity extends BaseEntity {
  type: 'container';
  containerId: ContainerId;
  contents: ItemBag;
}

export type Entity = MachineEntity | BeltEntity | ContainerEntity;

export interface Inventory {
  items: ItemBag;
}

export interface GameState {
  version: 1;
  coins: number;
  width: number;
  height: number;
  entities: Entity[];
  inventory: Inventory;
  expansions: { left: number; right: number; top: number; bottom: number };
  tick: number;
  nextEntityId: number;
}

export interface MachineDefinition {
  id: MachineId;
  name: string;
  description: string;
  cost: number;
  cycle: number;
  mode: 'extractor' | 'processor';
  produces?: ItemId;
  recipe?: ItemBag;
  results?: ItemBag;
  group: 'extractor' | 'processor';
}

export interface ContainerDefinition {
  id: ContainerId;
  name: string;
  cost: number;
  capacity: number;
  description: string;
}
