# Holland_Game — Own Factory

Een eerste speelbare basis voor **Holland_Game**. De game is 2D top-down en focust nu uitsluitend op het bouwen en automatiseren van een eigen fabriek.

## Wat zit erin?

- Grid-based factory builder met uitbreiding aan alle vier de kanten.
- 15 grondstofmachines, waaronder ijzererts-, steenkool-, kopererts-, bauxiet-, kwarts- en lithiummijnen, hout- en katoenplantages, groeves, olie- en waterpompen.
- 20 verwerkingsmachines, waaronder zagerij, ijzer- en kopersmelter, staaloven, aluminiumsmelter, siliciumoven, olieraffinaderij, glas- en cementoven, steenbakkerij, chemische fabriek, batterijfabriek, kabelfabriek, elektronica-, textiel-, keramiek- en rubberfabriek.
- 35 grondstoffen en halffabricaten als basis voor meer uitgebreide productieketens.
- Directionele transportbanden. Elke band verplaatst maximaal één vak per tick.
- Vier containers met verschillende opslagcapaciteiten. Containers verwerken niets; ze slaan alleen items op en voeren items via hun gerichte uitgang af.
- Machinebuffers met maximaal vijf verschillende input- en outputsoorten. Per itemsoort is de buffer in deze prototypeversie maximaal 100 stuks.
- Inventaris: output verzamelen en items naar machines of containers slepen.
- Kaasmunten als bouw- en uitbreidingsvaluta.
- Pauze, 1×- en 2×-simulatiesnelheid.
- Automatisch lokaal opslaan in de browser (`localStorage`).
- Een eigen SVG-asset voor de Kaasmunten. Machines en gebouwen gebruiken voorlopig eenvoudige UI-vormen, geen definitieve illustraties.

## Bewust nog niet toegevoegd

Winkels, Holland_Markt, verkopen, crates met zeldzame items, multiplayer, leaderboards en Supabase/render-serverkoppelingen zijn nog niet geïmplementeerd. De huidige Kaasmuntenstand is prototype-startkapitaal; er is nog geen inkomstenloop omdat verkopen later wordt gebouwd.

## Lokaal starten

Vereist Node.js 20.19+ of 22.12+.

```bash
npm install
npm run dev
```

Open daarna de lokale URL die Vite toont.

## Build controleren

```bash
npm run typecheck
npm run build
npm run preview
```

## Naar GitHub pushen

1. Maak een lege GitHub-repository aan.
2. Pak deze ZIP uit.
3. Commit en push de bestanden naar de repository.
4. Ga in GitHub naar **Settings → Pages** en kies **GitHub Actions** als deployment source.
5. De workflow in `.github/workflows/deploy.yml` bouwt de game en publiceert `dist/` automatisch bij een push naar `main`.

## Controls

- Klik op een bouwobject en klik daarna op een leeg gridvak, of sleep het bouwobject naar het grid.
- Selecteer een transportband, machine of container om de details te openen.
- Druk op `R` of gebruik **Draaien** om het geselecteerde object te draaien.
- Druk op `Esc` om je huidige selectie te wissen.
- Sleep items uit je inventaris naar een verwerkingsmachine of container.
- Klik op output bij een machine/container en gebruik **Verzamel output** om items naar je inventaris te verplaatsen.
- Gebruik de plotknoppen boven het grid om het speelgebied te vergroten.

## Projectstructuur

```text
public/
  cheese-coin.svg       # enige eigen spelillustratie in deze basisversie
src/
  game/
    catalog.ts          # item-, machine- en containerdefinities
    engine.ts           # bouwen, buffers, transport en productie-ticks
    storage.ts          # versiegebonden lokale save
    types.ts            # gedeelde TypeScript-types
  App.tsx               # game-interface en interacties
  main.tsx              # React-entrypoint
  styles.css            # interface en 2D top-down grid
```

## Technische richting

De game-logica is losgekoppeld van de interface. Dat maakt het later eenvoudiger om opslag en simulatie te verplaatsen naar een server en accounts/leaderboards via Supabase toe te voegen. De lokale save is voorlopig de enige opslagbron; er is nog geen backend of multiplayer-authoriteit.
