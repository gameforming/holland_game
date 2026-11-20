import type { BuildCategory, BuildId, ContainerDefinition, ContainerId, ItemId, MachineDefinition, MachineId } from './types';

export const ITEM_DEFS: Record<ItemId, { name: string; short: string; value: number; color: string }> = {
  iron_ore: { name: 'IJzererts', short: 'Fe', value: 4, color: '#a9aeb5' },
  coal: { name: 'Steenkool', short: 'C', value: 3, color: '#525963' },
  copper_ore: { name: 'Kopererts', short: 'Cu', value: 5, color: '#c77a48' },
  stone: { name: 'Steen', short: 'St', value: 2, color: '#9299a2' },
  wood: { name: 'Hout', short: 'H', value: 3, color: '#a66c3e' },
  crude_oil: { name: 'Ruwe olie', short: 'Oil', value: 7, color: '#39404a' },
  sand: { name: 'Zand', short: 'Si', value: 2, color: '#d8bd83' },
  limestone: { name: 'Kalksteen', short: 'Ca', value: 3, color: '#c8c3b7' },
  water: { name: 'Water', short: 'H₂O', value: 1, color: '#68b5df' },
  clay: { name: 'Klei', short: 'Cl', value: 2, color: '#aa735c' },
  bauxite: { name: 'Bauxiet', short: 'Bx', value: 5, color: '#bd7952' },
  quartz: { name: 'Kwarts', short: 'Qz', value: 5, color: '#b8c4cd' },
  lithium_ore: { name: 'Lithiumerts', short: 'Li', value: 12, color: '#9b9fba' },
  cotton: { name: 'Katoen', short: 'Kt', value: 4, color: '#e7e4d9' },
  salt: { name: 'Zout', short: 'Na', value: 3, color: '#d6dce2' },
  iron_ingot: { name: 'IJzerstaaf', short: 'Fe', value: 12, color: '#c0c7cf' },
  copper_ingot: { name: 'Koperstaaf', short: 'Cu', value: 15, color: '#d88b59' },
  planks: { name: 'Planken', short: 'Pl', value: 9, color: '#bd8750' },
  steel: { name: 'Staal', short: 'St', value: 28, color: '#8897a9' },
  fuel: { name: 'Brandstof', short: 'Fu', value: 18, color: '#e3a83d' },
  glass: { name: 'Glas', short: 'Gl', value: 16, color: '#89c9df' },
  cement: { name: 'Cement', short: 'Ce', value: 14, color: '#b7b5ad' },
  bricks: { name: 'Bakstenen', short: 'Bk', value: 12, color: '#b86c4f' },
  plastic: { name: 'Kunststof', short: 'Pls', value: 20, color: '#78a9a1' },
  paper: { name: 'Papier', short: 'Pa', value: 11, color: '#e7e0c9' },
  machinery_parts: { name: 'Machineonderdelen', short: 'MP', value: 65, color: '#a1aebd' },
  chemicals: { name: 'Chemicaliën', short: 'Ch', value: 32, color: '#8cbf78' },
  aluminium_ingot: { name: 'Aluminiumstaaf', short: 'Al', value: 22, color: '#b8c6d2' },
  silicon: { name: 'Silicium', short: 'Si', value: 30, color: '#93a4bd' },
  cable: { name: 'Kabel', short: 'Kb', value: 34, color: '#d69e50' },
  electronics: { name: 'Elektronica', short: 'El', value: 95, color: '#6a91bb' },
  battery: { name: 'Batterij', short: 'Bt', value: 72, color: '#6f9d77' },
  fabric: { name: 'Stof', short: 'St', value: 15, color: '#a9a0c5' },
  ceramic: { name: 'Keramiek', short: 'Ke', value: 26, color: '#c9a58b' },
  rubber: { name: 'Rubber', short: 'Rb', value: 24, color: '#5d646f' },
};

export const MACHINES: Record<MachineId, MachineDefinition> = {
  iron_mine: { id: 'iron_mine', name: 'IJzerertsmijn', description: 'Wint ijzererts uit de bodem.', cost: 320, cycle: 3, mode: 'extractor', produces: 'iron_ore', group: 'extractor' },
  coal_mine: { id: 'coal_mine', name: 'Steenkoolmijn', description: 'Wint steenkool voor ovens en smelters.', cost: 280, cycle: 3, mode: 'extractor', produces: 'coal', group: 'extractor' },
  copper_mine: { id: 'copper_mine', name: 'Kopermijn', description: 'Wint kopererts voor elektrische onderdelen.', cost: 430, cycle: 4, mode: 'extractor', produces: 'copper_ore', group: 'extractor' },
  stone_quarry: { id: 'stone_quarry', name: 'Steengroeve', description: 'Wint steen voor bouwmaterialen.', cost: 240, cycle: 3, mode: 'extractor', produces: 'stone', group: 'extractor' },
  wood_farm: { id: 'wood_farm', name: 'Houtplantage', description: 'Kweekt en oogst hout.', cost: 220, cycle: 3, mode: 'extractor', produces: 'wood', group: 'extractor' },
  oil_pumpjack: { id: 'oil_pumpjack', name: 'Oliepomp', description: 'Pompt ruwe olie uit een olieveld.', cost: 850, cycle: 5, mode: 'extractor', produces: 'crude_oil', group: 'extractor' },
  sand_quarry: { id: 'sand_quarry', name: 'Zandgroeve', description: 'Levert industrieel zand voor glas.', cost: 240, cycle: 3, mode: 'extractor', produces: 'sand', group: 'extractor' },
  limestone_quarry: { id: 'limestone_quarry', name: 'Kalksteengroeve', description: 'Wint kalksteen voor cement en glas.', cost: 290, cycle: 4, mode: 'extractor', produces: 'limestone', group: 'extractor' },
  water_pump: { id: 'water_pump', name: 'Waterpomp', description: 'Pompt water voor chemische processen.', cost: 180, cycle: 2, mode: 'extractor', produces: 'water', group: 'extractor' },
  clay_pit: { id: 'clay_pit', name: 'Kleigroeve', description: 'Wint klei voor de steenfabriek.', cost: 260, cycle: 3, mode: 'extractor', produces: 'clay', group: 'extractor' },
  bauxite_mine: { id: 'bauxite_mine', name: 'Bauxietmijn', description: 'Wint bauxiet voor aluminiumproductie.', cost: 460, cycle: 4, mode: 'extractor', produces: 'bauxite', group: 'extractor' },
  quartz_quarry: { id: 'quartz_quarry', name: 'Kwartswinning', description: 'Wint kwarts voor silicium en elektronica.', cost: 360, cycle: 4, mode: 'extractor', produces: 'quartz', group: 'extractor' },
  lithium_mine: { id: 'lithium_mine', name: 'Lithiummijn', description: 'Wint lithiumerts voor batterijproductie.', cost: 1480, cycle: 6, mode: 'extractor', produces: 'lithium_ore', group: 'extractor' },
  cotton_farm: { id: 'cotton_farm', name: 'Katoenplantage', description: 'Teelt katoen voor textielproductie.', cost: 340, cycle: 3, mode: 'extractor', produces: 'cotton', group: 'extractor' },
  salt_mine: { id: 'salt_mine', name: 'Zoutmijn', description: 'Wint industrieel zout voor chemische processen.', cost: 310, cycle: 4, mode: 'extractor', produces: 'salt', group: 'extractor' },
  sawmill: { id: 'sawmill', name: 'Zagerij', description: 'Zaagt hout tot bruikbare planken.', cost: 360, cycle: 3, mode: 'processor', recipe: { wood: 2 }, results: { planks: 2 }, group: 'processor' },
  iron_smelter: { id: 'iron_smelter', name: 'IJzersmelter', description: 'Smelt ijzererts met cokes en kalksteen tot ijzerstaven.', cost: 680, cycle: 4, mode: 'processor', recipe: { iron_ore: 2, coal: 1, limestone: 1 }, results: { iron_ingot: 1 }, group: 'processor' },
  copper_smelter: { id: 'copper_smelter', name: 'Kopersmelter', description: 'Verwerkt kopererts tot koperstaven.', cost: 650, cycle: 4, mode: 'processor', recipe: { copper_ore: 2, coal: 1 }, results: { copper_ingot: 1 }, group: 'processor' },
  steel_furnace: { id: 'steel_furnace', name: 'Staaloven', description: 'Maakt sterk staal uit ijzerstaven en steenkool.', cost: 940, cycle: 5, mode: 'processor', recipe: { iron_ingot: 2, coal: 1 }, results: { steel: 1 }, group: 'processor' },
  oil_refinery: { id: 'oil_refinery', name: 'Olieraffinaderij', description: 'Raffineert ruwe olie tot brandstof.', cost: 1180, cycle: 5, mode: 'processor', recipe: { crude_oil: 2 }, results: { fuel: 1 }, group: 'processor' },
  glass_furnace: { id: 'glass_furnace', name: 'Glasoven', description: 'Smelt zand en kalksteen tot glas.', cost: 610, cycle: 4, mode: 'processor', recipe: { sand: 2, limestone: 1 }, results: { glass: 2 }, group: 'processor' },
  cement_kiln: { id: 'cement_kiln', name: 'Cementoven', description: 'Verhit kalksteen en klei tot cementklinker en cement.', cost: 660, cycle: 4, mode: 'processor', recipe: { limestone: 2, clay: 1 }, results: { cement: 2 }, group: 'processor' },
  brickworks: { id: 'brickworks', name: 'Steenbakkerij', description: 'Bakt klei tot stevige bakstenen.', cost: 520, cycle: 3, mode: 'processor', recipe: { clay: 2 }, results: { bricks: 2 }, group: 'processor' },
  polymer_plant: { id: 'polymer_plant', name: 'Polymeerfabriek', description: 'Verwerkt ruwe olie tot kunststof.', cost: 880, cycle: 5, mode: 'processor', recipe: { crude_oil: 2 }, results: { plastic: 2 }, group: 'processor' },
  paper_mill: { id: 'paper_mill', name: 'Papierfabriek', description: 'Maakt papier uit hout en water.', cost: 720, cycle: 4, mode: 'processor', recipe: { wood: 2, water: 1 }, results: { paper: 2 }, group: 'processor' },
  component_assembler: { id: 'component_assembler', name: 'Onderdelenfabriek', description: 'Combineert staal en koper tot machineonderdelen.', cost: 1580, cycle: 6, mode: 'processor', recipe: { steel: 2, copper_ingot: 1 }, results: { machinery_parts: 1 }, group: 'processor' },
  chemical_plant: { id: 'chemical_plant', name: 'Chemische fabriek', description: 'Maakt chemicaliën uit olie en water.', cost: 1260, cycle: 5, mode: 'processor', recipe: { crude_oil: 1, water: 1 }, results: { chemicals: 1 }, group: 'processor' },
  aluminium_smelter: { id: 'aluminium_smelter', name: 'Aluminiumsmelter', description: 'Smelt bauxiet met koolstof tot aluminiumstaven.', cost: 880, cycle: 5, mode: 'processor', recipe: { bauxite: 2, coal: 1 }, results: { aluminium_ingot: 1 }, group: 'processor' },
  silicon_furnace: { id: 'silicon_furnace', name: 'Siliciumoven', description: 'Verwerkt kwarts tot industrieel silicium.', cost: 1120, cycle: 5, mode: 'processor', recipe: { quartz: 2, coal: 1 }, results: { silicon: 1 }, group: 'processor' },
  cable_factory: { id: 'cable_factory', name: 'Kabelfabriek', description: 'Omhult koper met kunststof tot industriële kabel.', cost: 980, cycle: 4, mode: 'processor', recipe: { copper_ingot: 1, plastic: 1 }, results: { cable: 2 }, group: 'processor' },
  electronics_factory: { id: 'electronics_factory', name: 'Elektronicafabriek', description: 'Combineert silicium, koper en kunststof tot elektronica.', cost: 2180, cycle: 7, mode: 'processor', recipe: { silicon: 1, copper_ingot: 1, plastic: 1 }, results: { electronics: 1 }, group: 'processor' },
  battery_plant: { id: 'battery_plant', name: 'Batterijfabriek', description: 'Verwerkt lithiumerts en chemicaliën tot batterijen.', cost: 1840, cycle: 6, mode: 'processor', recipe: { lithium_ore: 2, chemicals: 1 }, results: { battery: 1 }, group: 'processor' },
  textile_mill: { id: 'textile_mill', name: 'Textielfabriek', description: 'Spint katoen tot industriële stof.', cost: 670, cycle: 4, mode: 'processor', recipe: { cotton: 2 }, results: { fabric: 2 }, group: 'processor' },
  ceramics_kiln: { id: 'ceramics_kiln', name: 'Keramiekoven', description: 'Bakt klei en zand tot keramische onderdelen.', cost: 740, cycle: 4, mode: 'processor', recipe: { clay: 1, sand: 1 }, results: { ceramic: 2 }, group: 'processor' },
  rubber_works: { id: 'rubber_works', name: 'Rubberfabriek', description: 'Verwerkt ruwe olie tot synthetisch rubber.', cost: 930, cycle: 5, mode: 'processor', recipe: { crude_oil: 2 }, results: { rubber: 2 }, group: 'processor' },
};

export const CONTAINERS: Record<ContainerId, ContainerDefinition> = {
  wooden_crate: { id: 'wooden_crate', name: 'Houten kist', cost: 50, capacity: 100, description: 'Compacte buffer met eenvoudige in- en uitvoer.' },
  steel_container: { id: 'steel_container', name: 'Stalen container', cost: 350, capacity: 500, description: 'Stevige opslagcontainer voor middelgrote lijnen.' },
  industrial_silo: { id: 'industrial_silo', name: 'Industriesilo', cost: 1500, capacity: 2000, description: 'Grote buffer voor grondstoffen en halffabricaten.' },
  mega_warehouse: { id: 'mega_warehouse', name: 'Mega-magazijn', cost: 5000, capacity: 10000, description: 'Zeer grote opslag met één gerichte uitvoerpoort.' },
};

export const BUILD_CATEGORIES: { id: BuildCategory; label: string }[] = [
  { id: 'extractors', label: 'Grondstoffen' },
  { id: 'processors', label: 'Verwerking' },
  { id: 'transport', label: 'Transport' },
  { id: 'storage', label: 'Opslag' },
];

export function getBuildName(id: BuildId): string {
  if (id === 'belt') return 'Transportband';
  if (id in MACHINES) return MACHINES[id as MachineId].name;
  return CONTAINERS[id as ContainerId].name;
}

export function getBuildCost(id: BuildId): number {
  if (id === 'belt') return 12;
  if (id in MACHINES) return MACHINES[id as MachineId].cost;
  return CONTAINERS[id as ContainerId].cost;
}

export function itemsInBag(bag: Partial<Record<ItemId, number>>): { id: ItemId; qty: number }[] {
  return (Object.entries(bag) as [ItemId, number][])
    .filter(([, qty]) => qty > 0)
    .map(([id, qty]) => ({ id, qty }));
}
