import { useCallback, useEffect, useMemo, useState } from 'react';
import type { DragEvent } from 'react';
import {
  ArrowDown, ArrowLeft, ArrowRight, ArrowUp, Check, CircleHelp,
  Factory, HardDrive, Info, Package, Pause, Play, Plus,
  RotateCw, Trash2, X,
} from 'lucide-react';
import { BUILD_CATEGORIES, CONTAINERS, ITEM_DEFS, MACHINES, getBuildCost, getBuildName, itemsInBag } from './game/catalog';
import {
  bagTotal, collectEntity, entityAt, expandGrid, expansionCost, initialState,
  inventoryEntries, moveInventoryIntoContainer, moveInventoryIntoMachine,
  placeBuild, removeEntity, rotateEntity, tickGame,
} from './game/engine';
import { clearSave, loadGame, saveGame } from './game/storage';
import type { BuildCategory, BuildId, Direction, Entity, GameState, ItemId } from './game/types';

const MACHINE_BADGES: Record<string, string> = {
  iron_mine: 'Fe', coal_mine: 'C', copper_mine: 'Cu', stone_quarry: 'St', wood_farm: 'H',
  oil_pumpjack: 'Oil', sand_quarry: 'Si', limestone_quarry: 'Ca', water_pump: 'H₂O', clay_pit: 'Kl',
  bauxite_mine: 'Bx', quartz_quarry: 'Qz', lithium_mine: 'Li', cotton_farm: 'Kt', salt_mine: 'Na',
  sawmill: 'ZA', iron_smelter: 'Fe', copper_smelter: 'Cu', steel_furnace: 'St', oil_refinery: 'R',
  glass_furnace: 'Gl', cement_kiln: 'Ce', brickworks: 'Bk', polymer_plant: 'Pl', paper_mill: 'Pa',
  component_assembler: 'MP', chemical_plant: 'Ch', aluminium_smelter: 'Al', silicon_furnace: 'Si',
  cable_factory: 'Kb', electronics_factory: 'El', battery_plant: 'Bt', textile_mill: 'Tx',
  ceramics_kiln: 'Ke', rubber_works: 'Rb',
};

const ROTATION_ICON: Record<Direction, typeof ArrowRight> = {
  right: ArrowRight, down: ArrowDown, left: ArrowLeft, up: ArrowUp,
};

const INITIAL_TIPS = [
  'Plaats een grondstofmachine op een leeg vak.',
  'Leg transportbanden met de pijlen in de juiste richting.',
  'Verbind een band met een verwerkingsmachine of container.',
  'Klik op een machine om buffers te bekijken en items op te halen.',
];

function formatNumber(value: number) {
  return new Intl.NumberFormat('nl-NL').format(value);
}

function App() {
  const [game, setGame] = useState<GameState>(() => loadGame());
  const [activeCategory, setActiveCategory] = useState<BuildCategory>('extractors');
  const [buildChoice, setBuildChoice] = useState<BuildId | null>(null);
  const [selectedEntityId, setSelectedEntityId] = useState<string | null>(null);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<ItemId | null>(null);
  const [playing, setPlaying] = useState(true);
  const [speed, setSpeed] = useState<1 | 2>(1);
  const [toast, setToast] = useState('');
  const [showGuide, setShowGuide] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => saveGame(game), [game]);

  useEffect(() => {
    if (!playing) return;
    const interval = window.setInterval(() => setGame((current) => tickGame(current)), speed === 1 ? 1000 : 500);
    return () => window.clearInterval(interval);
  }, [playing, speed]);

  useEffect(() => {
    if (!toast) return;
    const timeout = window.setTimeout(() => setToast(''), 2400);
    return () => window.clearTimeout(timeout);
  }, [toast]);

  const selectedEntity = game.entities.find((entity) => entity.id === selectedEntityId) ?? null;
  const inventory = inventoryEntries(game.inventory);
  const visibleBuilds = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (activeCategory === 'extractors') return Object.values(MACHINES).filter((machine) => machine.group === 'extractor' && (!q || machine.name.toLowerCase().includes(q)));
    if (activeCategory === 'processors') return Object.values(MACHINES).filter((machine) => machine.group === 'processor' && (!q || machine.name.toLowerCase().includes(q)));
    if (activeCategory === 'transport') return [{ id: 'belt' as const, name: 'Transportband', description: 'Verplaatst één item per tick in de richting van de pijl.', cost: 12 }].filter((item) => !q || item.name.toLowerCase().includes(q));
    return Object.values(CONTAINERS).filter((container) => !q || container.name.toLowerCase().includes(q));
  }, [activeCategory, search]);

  const notify = useCallback((message: string) => setToast(message), []);

  function chooseBuild(id: BuildId) {
    setBuildChoice((current) => current === id ? null : id);
    setSelectedEntityId(null);
    setSelectedInventoryItem(null);
  }

  function handleCellClick(x: number, y: number) {
    const entity = entityAt(game, x, y);
    if (selectedInventoryItem && entity) {
      const next = entity.type === 'machine'
        ? moveInventoryIntoMachine(game, entity.id, selectedInventoryItem)
        : entity.type === 'container'
          ? moveInventoryIntoContainer(game, entity.id, selectedInventoryItem)
          : game;
      if (next !== game) {
        setGame(next);
        setSelectedInventoryItem(null);
        notify(`Items toegevoegd: ${ITEM_DEFS[selectedInventoryItem].name}`);
      } else {
        notify('Dit item past niet in deze machine of opslag.');
      }
      return;
    }
    if (buildChoice && !entity) {
      const next = placeBuild(game, buildChoice, x, y);
      if (next === game) {
        notify(game.coins < getBuildCost(buildChoice) ? 'Niet genoeg Kaasmunten.' : 'Dit vak kan niet worden gebruikt.');
      } else {
        setGame(next);
        setSelectedEntityId(next.entities[next.entities.length - 1]?.id ?? null);
      }
      return;
    }
    if (entity) {
      setSelectedEntityId(entity.id);
      setSelectedInventoryItem(null);
      setBuildChoice(null);
    } else {
      setSelectedEntityId(null);
      setSelectedInventoryItem(null);
    }
  }

  function handleDropOnCell(event: DragEvent<HTMLButtonElement>, x: number, y: number) {
    event.preventDefault();
    const item = event.dataTransfer.getData('application/holland-item') as ItemId;
    const build = event.dataTransfer.getData('application/holland-build') as BuildId;
    const target = entityAt(game, x, y);
    if (item && target) {
      const next = target.type === 'machine'
        ? moveInventoryIntoMachine(game, target.id, item)
        : target.type === 'container'
          ? moveInventoryIntoContainer(game, target.id, item)
          : game;
      if (next !== game) {
        setGame(next);
        setSelectedEntityId(target.id);
        setSelectedInventoryItem(null);
      } else notify('Dit item past niet in de geselecteerde opslag of machine.');
      return;
    }
    if (build && !target) {
      const next = placeBuild(game, build, x, y);
      if (next !== game) {
        setGame(next);
        setSelectedEntityId(next.entities[next.entities.length - 1]?.id ?? null);
        setBuildChoice(null);
      } else notify('Plaatsen mislukt: controleer je Kaasmunten of het grid.');
    }
  }

  function buyExpansion(side: keyof GameState['expansions']) {
    const cost = expansionCost(game, side);
    if (game.coins < cost) {
      notify('Niet genoeg Kaasmunten voor deze plot.');
      return;
    }
    setGame((current) => expandGrid(current, side));
    notify('Nieuwe factory-plot gekocht.');
  }

  function onDropInventory(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    const item = event.dataTransfer.getData('application/holland-item') as ItemId;
    const target = selectedEntity;
    if (!item || !target) return;
    const next = target.type === 'machine'
      ? moveInventoryIntoMachine(game, target.id, item)
      : target.type === 'container'
        ? moveInventoryIntoContainer(game, target.id, item)
        : game;
    if (next !== game) setGame(next);
  }

  function resetGame() {
    if (!window.confirm('Weet je zeker dat je jouw lokale fabriek en save wilt resetten?')) return;
    clearSave();
    setGame(initialState());
    setSelectedEntityId(null);
    setBuildChoice(null);
    setSelectedInventoryItem(null);
    notify('Nieuwe fabriek gestart.');
  }

  function collectSelected() {
    if (!selectedEntity) return;
    const next = collectEntity(game, selectedEntity.id);
    setGame(next);
    notify('Items opgehaald naar je inventaris.');
  }

  function rotateSelected() {
    if (!selectedEntity) return;
    setGame((current) => rotateEntity(current, selectedEntity.id));
  }

  function demolishSelected() {
    if (!selectedEntity) return;
    setGame((current) => removeEntity(current, selectedEntity.id));
    setSelectedEntityId(null);
    notify('Object verwijderd. Er wordt geen bouwprijs terugbetaald.');
  }

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (target?.tagName === 'INPUT' || target?.tagName === 'TEXTAREA') return;
      if (event.key.toLowerCase() === 'r') rotateSelected();
      if (event.key === 'Escape') {
        setBuildChoice(null);
        setSelectedInventoryItem(null);
        setSelectedEntityId(null);
      }
    }
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  });

  const occupied = game.entities.length;
  const totalItems = inventory.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="brand-block">
          <div className="brand-mark">H</div>
          <div>
            <div className="brand-name">HOLLAND<span>_</span>GAME</div>
            <div className="brand-subtitle">OWN FACTORY <span className="live-dot" /> LOKALE PROTOTYPE</div>
          </div>
        </div>
        <div className="topbar-right">
          <div className="coin-wallet">
            <img src="./cheese-coin.svg" alt="" />
            <div><strong>{formatNumber(game.coins)}</strong><small>KAASMUNTEN</small></div>
          </div>
          <div className="top-divider" />
          <div className="sim-controls">
            <button className={`icon-control ${playing ? 'active' : ''}`} onClick={() => setPlaying((value) => !value)} title={playing ? 'Pauzeren' : 'Verder spelen'}>
              {playing ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button className={`speed-control ${speed === 1 ? 'active' : ''}`} onClick={() => setSpeed(1)}>1×</button>
            <button className={`speed-control ${speed === 2 ? 'active' : ''}`} onClick={() => setSpeed(2)}>2×</button>
          </div>
          <div className="top-divider" />
          <button className="icon-control help-control" onClick={() => setShowGuide(true)} title="Speluitleg"><CircleHelp size={17} /></button>
          <button className="icon-control reset-control" onClick={resetGame} title="Save resetten"><RotateCw size={16} /></button>
        </div>
      </header>

      <main className="workspace">
        <aside className="left-panel panel">
          <div className="panel-heading">
            <div><span className="eyebrow">FACTORY TOOLS</span><h2>Bouwen</h2></div>
            <span className="count-chip">{occupied} / {game.width * game.height}</span>
          </div>
          <div className="build-search">
            <span>⌕</span>
            <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Zoek machine..." aria-label="Zoek machine" />
            {search && <button onClick={() => setSearch('')} aria-label="Zoekveld wissen"><X size={14} /></button>}
          </div>
          <div className="category-tabs">
            {BUILD_CATEGORIES.map((category) => (
              <button key={category.id} className={activeCategory === category.id ? 'selected' : ''} onClick={() => setActiveCategory(category.id)}>
                {category.id === 'extractors' ? 'Grondstoffen' : category.id === 'processors' ? 'Verwerking' : category.label}
              </button>
            ))}
          </div>
          <div className="build-list">
            {visibleBuilds.length === 0 && <div className="empty-note">Geen objecten gevonden.</div>}
            {visibleBuilds.map((item) => {
              const id = item.id as BuildId;
              const selected = buildChoice === id;
              const isBelt = id === 'belt';
              return (
                <button
                  key={id}
                  className={`build-card ${selected ? 'chosen' : ''}`}
                  onClick={() => chooseBuild(id)}
                  draggable
                  onDragStart={(event) => event.dataTransfer.setData('application/holland-build', id)}
                >
                  <div className={`build-symbol ${activeCategory}`}>
                    {isBelt ? <ArrowRight size={19} /> : id in MACHINES ? <span>{MACHINE_BADGES[id] ?? 'M'}</span> : <Package size={19} />}
                  </div>
                  <div className="build-copy"><strong>{item.name}</strong><small>{item.description}</small></div>
                  <div className="build-price"><img src="./cheese-coin.svg" alt="" />{formatNumber(item.cost)}</div>
                  {selected && <Check className="build-check" size={15} />}
                </button>
              );
            })}
          </div>
          <div className="build-hint"><Info size={14} /><span>Kies een object en klik op een leeg gridvak, of sleep het object naar het grid.</span></div>

          <div className="inventory-panel" onDragOver={(event) => event.preventDefault()} onDrop={onDropInventory}>
            <div className="inventory-heading">
              <div><span className="eyebrow">OPGEHAALDE ITEMS</span><h3>Inventaris</h3></div>
              <span>{formatNumber(totalItems)} stuks</span>
            </div>
            {inventory.length === 0 ? (
              <div className="inventory-empty">Je inventaris is leeg. Klik op de output van een machine of container om items op te halen.</div>
            ) : (
              <div className="inventory-items">
                {inventory.map(({ id, qty }) => (
                  <button
                    key={id}
                    className={`inventory-item ${selectedInventoryItem === id ? 'selected' : ''}`}
                    draggable
                    onClick={() => { setSelectedInventoryItem((current) => current === id ? null : id); setBuildChoice(null); }}
                    onDragStart={(event) => { event.dataTransfer.setData('application/holland-item', id); setSelectedInventoryItem(id); }}
                    title={`${ITEM_DEFS[id].name} — sleep naar een machine of container`}
                  >
                    <span className="item-dot" style={{ background: ITEM_DEFS[id].color }}>{ITEM_DEFS[id].short}</span>
                    <span className="inventory-item-name">{ITEM_DEFS[id].name}</span>
                    <strong>{formatNumber(qty)}</strong>
                  </button>
                ))}
              </div>
            )}
            {selectedInventoryItem && <div className="inventory-selection">Geselecteerd: {ITEM_DEFS[selectedInventoryItem].name}. Klik op een machine om te vullen.</div>}
          </div>
        </aside>

        <section className="factory-area">
          <div className="factory-toolbar">
            <div>
              <span className="eyebrow">JOUW PRODUCTIEGEBIED</span>
              <h1>Own Factory</h1>
              <p>Bouw productielijnen, verbind machines en automatiseer je grondstoffen.</p>
            </div>
            <div className="factory-stats">
              <div><span>GRID</span><strong>{game.width} × {game.height}</strong></div>
              <div><span>OBJECTEN</span><strong>{occupied}</strong></div>
              <div><span>TICKS</span><strong>{formatNumber(game.tick)}</strong></div>
            </div>
          </div>

          <div className="plot-toolbar">
            <span><Plus size={14} /> PLOTS UITBREIDEN</span>
            <div className="plot-actions">
              <button onClick={() => buyExpansion('left')}><ArrowLeft size={13} /> Links <b>{formatNumber(expansionCost(game, 'left'))}</b><img src="./cheese-coin.svg" alt="" /></button>
              <button onClick={() => buyExpansion('top')}><ArrowUp size={13} /> Boven <b>{formatNumber(expansionCost(game, 'top'))}</b><img src="./cheese-coin.svg" alt="" /></button>
              <button onClick={() => buyExpansion('bottom')}><ArrowDown size={13} /> Onder <b>{formatNumber(expansionCost(game, 'bottom'))}</b><img src="./cheese-coin.svg" alt="" /></button>
              <button onClick={() => buyExpansion('right')}><ArrowRight size={13} /> Rechts <b>{formatNumber(expansionCost(game, 'right'))}</b><img src="./cheese-coin.svg" alt="" /></button>
            </div>
          </div>

          <div className="grid-scroll-area">
            <div className="factory-grid" style={{ gridTemplateColumns: `repeat(${game.width}, var(--cell-size))`, gridTemplateRows: `repeat(${game.height}, var(--cell-size))` }}>
              {Array.from({ length: game.width * game.height }, (_, index) => {
                const x = index % game.width;
                const y = Math.floor(index / game.width);
                const entity = entityAt(game, x, y);
                const isSelected = entity?.id === selectedEntityId;
                const canPlace = !!buildChoice && !entity;
                return (
                  <button
                    key={`${x}-${y}`}
                    className={`grid-cell ${entity ? 'occupied' : ''} ${isSelected ? 'entity-selected' : ''} ${canPlace ? 'placement-ready' : ''} ${selectedInventoryItem && entity ? 'drop-ready' : ''}`}
                    onClick={() => handleCellClick(x, y)}
                    onDragOver={(event) => event.preventDefault()}
                    onDrop={(event) => handleDropOnCell(event, x, y)}
                    title={entity ? entityLabel(entity) : `Leeg vak ${x + 1}, ${y + 1}`}
                    aria-label={entity ? entityLabel(entity) : `Leeg vak ${x + 1}, ${y + 1}`}
                  >
                    {entity && <EntityTile entity={entity} selected={isSelected} />}
                    {!entity && canPlace && <span className="placement-plus">+</span>}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid-footer">
            <div className="legend"><span><i className="legend-machine" /> Machine</span><span><i className="legend-belt" /> Transportband</span><span><i className="legend-storage" /> Opslag</span></div>
            <div className="grid-tip"><span className="keycap">R</span> geselecteerd object draaien <span className="separator">·</span> <span className="keycap">ESC</span> selectie wissen</div>
          </div>
        </section>

        <aside className="right-panel panel">
          {selectedEntity ? (
            <EntityInspector
              entity={selectedEntity}
              onRotate={rotateSelected}
              onCollect={collectSelected}
              onDelete={demolishSelected}
              onDropItem={(item) => {
                const next = selectedEntity.type === 'machine'
                  ? moveInventoryIntoMachine(game, selectedEntity.id, item)
                  : selectedEntity.type === 'container'
                    ? moveInventoryIntoContainer(game, selectedEntity.id, item)
                    : game;
                if (next !== game) setGame(next);
                else notify('Dit item kan hier niet worden ingevoerd.');
              }}
            />
          ) : buildChoice ? (
            <div className="inspector-empty selected-build-info">
              <div className="empty-icon build-empty-icon"><Factory size={25} /></div>
              <span className="eyebrow">PLAATSEN</span>
              <h2>{getBuildName(buildChoice)}</h2>
              <p>Klik op een leeg gridvak om dit object te plaatsen. Je kunt het ook rechtstreeks vanuit de bouwlijst slepen.</p>
              <div className="selected-build-cost"><img src="./cheese-coin.svg" alt="" />{formatNumber(getBuildCost(buildChoice))} Kaasmunten</div>
              <button className="subtle-button" onClick={() => setBuildChoice(null)}>Annuleren</button>
            </div>
          ) : selectedInventoryItem ? (
            <div className="inspector-empty">
              <div className="empty-icon inventory-empty-icon"><Package size={25} /></div>
              <span className="eyebrow">ITEM GESELECTEERD</span>
              <h2>{ITEM_DEFS[selectedInventoryItem].name}</h2>
              <p>Sleep dit item naar een verwerkingsmachine die het nodig heeft, of klik op een machine om je inventaris te gebruiken.</p>
              <div className="selected-build-cost">In bezit: {formatNumber(game.inventory.items[selectedInventoryItem] ?? 0)}</div>
            </div>
          ) : (
            <div className="inspector-empty">
              <div className="empty-icon"><Factory size={25} /></div>
              <span className="eyebrow">FACTORY CONTROL</span>
              <h2>Selecteer een object</h2>
              <p>Klik op een machine, transportband of container om productie, buffers en instellingen te bekijken.</p>
              <div className="quick-tips">
                <strong>SNELLE TIPS</strong>
                {INITIAL_TIPS.slice(0, 3).map((tip, index) => <div key={tip}><span>{index + 1}</span>{tip}</div>)}
              </div>
            </div>
          )}
        </aside>
      </main>

      {toast && <div className="toast-message"><Check size={15} />{toast}</div>}

      {showGuide && <div className="modal-backdrop" onClick={() => setShowGuide(false)}>
        <div className="guide-modal" onClick={(event) => event.stopPropagation()}>
          <button className="modal-close" onClick={() => setShowGuide(false)}><X size={18} /></button>
          <div className="guide-icon"><HardDrive size={25} /></div>
          <span className="eyebrow">HOLLAND_GAME · OWN FACTORY</span>
          <h2>Je fabriek opbouwen</h2>
          <p>Dit is de eerste speelbare basis. De focus ligt volledig op bouwen en automatiseren; winkels, verkopen en Holland_Markt worden later toegevoegd.</p>
          <div className="guide-steps">
            {INITIAL_TIPS.map((tip, index) => <div key={tip}><b>{String(index + 1).padStart(2, '0')}</b><span>{tip}</span></div>)}
            <div><b>05</b><span>Sleep items uit je inventaris naar een machine om de input handmatig te vullen.</span></div>
            <div><b>06</b><span>Gebruik de plotknoppen boven het grid om links, rechts, boven of onder uit te breiden.</span></div>
          </div>
          <div className="guide-note"><Info size={15} /> Je voortgang wordt automatisch lokaal in deze browser opgeslagen.</div>
          <button className="primary-button" onClick={() => setShowGuide(false)}>Begrepen</button>
        </div>
      </div>}
    </div>
  );
}

function entityLabel(entity: Entity): string {
  if (entity.type === 'belt') return 'Transportband';
  if (entity.type === 'container') return CONTAINERS[entity.containerId].name;
  return MACHINES[entity.machineId].name;
}

function EntityTile({ entity, selected }: { entity: Entity; selected: boolean }) {
  if (entity.type === 'belt') {
    const rotation = entity.rotation === 'right' ? 0 : entity.rotation === 'down' ? 90 : entity.rotation === 'left' ? 180 : 270;
    return <div className={`entity-visual belt-visual ${selected ? 'selected' : ''}`}>
      <div className="belt-track"><span style={{ transform: `rotate(${rotation}deg)` }}>➜</span></div>
      {entity.item && <i className="belt-cargo" style={{ background: ITEM_DEFS[entity.item].color }} />}
    </div>;
  }
  if (entity.type === 'container') {
    const qty = bagTotal(entity.contents);
    const totalCapacity = CONTAINERS[entity.containerId].capacity;
    const rotation = entity.rotation === 'right' ? 0 : entity.rotation === 'down' ? 90 : entity.rotation === 'left' ? 180 : 270;
    return <div className={`entity-visual container-visual ${selected ? 'selected' : ''}`}>
      <Package size={22} strokeWidth={1.8} />
      <span className="entity-code">BOX</span>
      <span className="entity-mini-count">{qty}/{totalCapacity > 999 ? `${Math.round(totalCapacity / 1000)}k` : totalCapacity}</span>
      <i className="container-port" style={{ transform: `translate(-50%, -50%) rotate(${rotation}deg)` }} />
    </div>;
  }
  const definition = MACHINES[entity.machineId];
  const isExtractor = definition.mode === 'extractor';
  const outputCount = bagTotal(entity.output);
  const inputCount = bagTotal(entity.input);
  const progress = definition.cycle > 0 ? Math.min(100, entity.progress / definition.cycle * 100) : 0;
  return <div className={`entity-visual machine-visual ${isExtractor ? 'extractor-visual' : 'processor-visual'} ${selected ? 'selected' : ''}`}>
    <div className="machine-roof"><span>{MACHINE_BADGES[entity.machineId] ?? 'M'}</span><i /></div>
    <strong>{entity.machineId === 'wood_farm' ? 'FARM' : isExtractor ? 'MINE' : 'FACTORY'}</strong>
    <div className="machine-lights"><i /><i /><i /></div>
    <div className="machine-buffer-bars"><i style={{ width: `${Math.min(100, outputCount * 5)}%` }} /><i style={{ width: `${Math.min(100, inputCount * 5)}%` }} /></div>
    <div className="machine-progress"><i style={{ width: `${progress}%` }} /></div>
  </div>;
}

function EntityInspector({
  entity, onRotate, onCollect, onDelete, onDropItem,
}: {
  entity: Entity;
  onRotate: () => void;
  onCollect: () => void;
  onDelete: () => void;
  onDropItem: (item: ItemId) => void;
}) {
  const rotationIcon = ROTATION_ICON[entity.rotation];
  const RotationIcon = rotationIcon;
  const [showDelete, setShowDelete] = useState(false);
  useEffect(() => setShowDelete(false), [entity.id]);
  const machine = entity.type === 'machine' ? MACHINES[entity.machineId] : null;
  const container = entity.type === 'container' ? CONTAINERS[entity.containerId] : null;
  const inventoryOutputs = entity.type === 'machine' ? itemsInBag(entity.output) : entity.type === 'container' ? itemsInBag(entity.contents) : [];
  const inputs = entity.type === 'machine' ? itemsInBag(entity.input) : [];
  const totalStorage = entity.type === 'container' ? bagTotal(entity.contents) : 0;
  const storagePercent = container ? Math.min(100, totalStorage / container.capacity * 100) : 0;
  const machineProgress = machine && entity.type === 'machine' ? Math.min(100, entity.progress / machine.cycle * 100) : 0;

  return <div className="entity-inspector">
    <div className="inspector-header">
      <span className="eyebrow">OBJECT DETAILS</span>
      <span className="object-id">{entity.id.toUpperCase()}</span>
    </div>
    <div className="inspector-title-row">
      <div className={`inspector-object-icon ${entity.type}`}>
        {entity.type === 'belt' ? <ArrowRight size={23} /> : entity.type === 'container' ? <Package size={23} /> : <Factory size={23} />}
      </div>
      <div><h2>{entityLabel(entity)}</h2><span>{entity.type === 'belt' ? 'Transport · Richting instelbaar' : entity.type === 'container' ? 'Opslag · Alleen input/output' : machine?.mode === 'extractor' ? 'Grondstofwinning' : 'Productieverwerking'}</span></div>
    </div>

    {entity.type === 'machine' && machine && <>
      <div className="inspector-description">{machine.description}</div>
      <div className="inspector-section">
        <div className="section-title">PRODUCTIESTATUS <span>{entity.produced} cycli voltooid</span></div>
        <div className="progress-card">
          <div className="progress-label"><span>{machine.mode === 'extractor' ? `Maakt ${ITEM_DEFS[machine.produces!].name}` : `Maakt ${itemsInBag(machine.results ?? {})[0]?.qty ? `${itemsInBag(machine.results ?? {})[0].qty}× ` : ''}${ITEM_DEFS[itemsInBag(machine.results ?? {})[0]?.id ?? 'iron_ingot'].name}`}</span><b>{Math.round(machineProgress)}%</b></div>
          <div className="progress-track"><i style={{ width: `${machineProgress}%` }} /></div>
          <small>{machine.mode === 'extractor' ? `Elke ${machine.cycle} ticks · outputbuffer maximaal 5 itemsoorten` : `Recept: ${Object.entries(machine.recipe ?? {}).map(([id, qty]) => `${qty}× ${ITEM_DEFS[id as ItemId].name}`).join(' + ')}`}</small>
        </div>
      </div>
      {machine.mode === 'processor' && <div className="inspector-section">
        <div className="section-title">INPUT <span>{inputs.reduce((sum, item) => sum + item.qty, 0)} items</span></div>
        <div className="buffer-list">
          {Object.entries(machine.recipe ?? {}).map(([itemId, required]) => {
            const id = itemId as ItemId;
            const amount = entity.input[id] ?? 0;
            return <div className="buffer-row" key={id}>
              <span className="item-dot small" style={{ background: ITEM_DEFS[id].color }}>{ITEM_DEFS[id].short}</span>
              <span>{ITEM_DEFS[id].name}</span><strong className={amount >= required ? 'enough' : 'needed'}>{amount} / {required}</strong>
            </div>;
          })}
        </div>
        <div className="micro-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const item = event.dataTransfer.getData('application/holland-item') as ItemId; if (item) onDropItem(item); }}>Sleep passend item hierheen om input toe te voegen</div>
        <p className="micro-hint">Je kunt items ook rechtstreeks vanuit de inventaris op deze machine slepen.</p>
      </div>}
      <div className="inspector-section">
        <div className="section-title">OUTPUTBUFFER <span>{inventoryOutputs.length} / 5 slots</span></div>
        {inventoryOutputs.length === 0 ? <div className="empty-buffer">Nog geen items beschikbaar.</div> : <div className="buffer-list">
          {inventoryOutputs.map(({ id, qty }) => <div className="buffer-row" key={id}><span className="item-dot small" style={{ background: ITEM_DEFS[id].color }}>{ITEM_DEFS[id].short}</span><span>{ITEM_DEFS[id].name}</span><strong>{qty}×</strong></div>)}
        </div>}
        <button className="collect-button" onClick={onCollect} disabled={inventoryOutputs.length === 0}><Package size={15} /> Verzamel output</button>
      </div>
    </>}

    {entity.type === 'container' && container && <>
      <div className="inspector-description">{container.description} De container verwerkt items niet, maar kan ze automatisch doorgeven aan een transportband aan de uitgangszijde.</div>
      <div className="inspector-section">
        <div className="section-title">OPSLAGCAPACITEIT <span>{formatNumber(totalStorage)} / {formatNumber(container.capacity)}</span></div>
        <div className="progress-track storage-progress"><i style={{ width: `${storagePercent}%` }} /></div>
        <div className="storage-quantity">{Math.round(storagePercent)}% gevuld</div>
      </div>
      <div className="inspector-section">
        <div className="section-title">INHOUD <span>{inventoryOutputs.length} itemsoorten</span></div>
        {inventoryOutputs.length === 0 ? <div className="empty-buffer">Deze container is leeg.</div> : <div className="buffer-list">{inventoryOutputs.map(({ id, qty }) => <div className="buffer-row" key={id}><span className="item-dot small" style={{ background: ITEM_DEFS[id].color }}>{ITEM_DEFS[id].short}</span><span>{ITEM_DEFS[id].name}</span><strong>{formatNumber(qty)}×</strong></div>)}</div>}
        <div className="micro-drop-zone" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); const item = event.dataTransfer.getData('application/holland-item') as ItemId; if (item) onDropItem(item); }}>Sleep items hierheen om ze op te slaan</div>
        <button className="collect-button" onClick={onCollect} disabled={inventoryOutputs.length === 0}><Package size={15} /> Verzamel inhoud</button>
      </div>
    </>}

    {entity.type === 'belt' && <>
      <div className="inspector-description">Een transportband verplaatst één item per tick in de richting van de pijl. Klik op draaien om de route aan te passen.</div>
      <div className="direction-card">
        <div className="direction-arrow"><RotationIcon size={34} /></div>
        <div><small>TRANSPORTRICHTING</small><strong>{entity.rotation === 'right' ? 'Rechts' : entity.rotation === 'left' ? 'Links' : entity.rotation === 'up' ? 'Omhoog' : 'Omlaag'}</strong></div>
      </div>
      <div className="inspector-section"><div className="section-title">BANDSTATUS</div><div className="belt-state">{entity.item ? <><span className="item-dot small" style={{ background: ITEM_DEFS[entity.item].color }}>{ITEM_DEFS[entity.item].short}</span><b>{ITEM_DEFS[entity.item].name}</b><span>1 item onderweg</span></> : <span>Geen item op deze band</span>}</div><button className="collect-button" onClick={onCollect} disabled={!entity.item}><Package size={15} /> Pak item op</button></div>
    </>}

    <div className="inspector-actions">
      <button className="rotate-button" onClick={onRotate}><RotateCw size={15} /> Draaien <span>R</span></button>
      {showDelete ? <div className="delete-confirm"><span>Object verwijderen?</span><button onClick={onDelete}>Ja</button><button onClick={() => setShowDelete(false)}>Nee</button></div> : <button className="delete-button" onClick={() => setShowDelete(true)}><Trash2 size={15} /> Verwijderen</button>}
    </div>
  </div>;
}

export default App;
