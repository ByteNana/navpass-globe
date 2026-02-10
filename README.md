# NAVPASS Globe Interaction

Visualização 3D interativa de rotas aéreas globais com foco em estética de pesquisa (Google Research style), estabilidade espacial e performance em GPU.

## Visão geral

Este projeto renderiza um globo em **Three.js puro** (sem React), com camadas visuais físicas e consistentes: atmosfera, malha geodésica, fronteiras de países, pontos de aeroportos, rotas aéreas animadas e painel contextual por país/rota.

A proposta é entregar uma experiência de exploração de dados aérea com linguagem visual sofisticada, evitando look de dashboard tradicional e preservando comportamento coerente do globo em interação, foco e picking.

## Principais recursos

- Rotação do globo por **quaternion** (yaw/pitch estáveis, sem roll indesejado).
- Picking robusto por esfera invisível + lookup geográfico de país.
- Fronteiras, hover e seleção de países com destaque progressivo.
- Rotas de voo animadas com pontos de aeronave em movimento.
- Heatmap de rotas (via toggle) para densidade de tráfego.
- Presets de story mode (foco regional com transições suaves).
- Iluminação dia/noite com direção solar em tempo real (UTC).
- Atmosfera, night lights, starfield e pós-processamento (bloom + vignette/grain).
- Tooltip/painel de país no estilo Figma com bandeira, métricas e live monitoring.

## Stack técnica

- **Three.js**
- **TypeScript**
- **Vite (rolldown-vite)**
- **WebGL / ShaderMaterial** customizado
- Dados geográficos: **Natural Earth GeoJSON**

## Arquitetura visual

Camadas do globo com controle de render e oclusão:

- `depthMaskSphere`: escreve no depth buffer para ocultar backside.
- `innerSphere` + `land/water` + fronteiras.
- grids adaptativos (tri/lat-lon) com fade por distância.
- rotas de voo, pontos de aeroportos e aeronaves.
- atmosfera/fresnel e efeitos de cena.

## Estrutura do projeto

- `src/index.ts`: bootstrap da cena, interação, integração UI/globo.
- `src/globe/*`: camadas do globo, rotas, picking, highlights, atmosfera, solar.
- `src/shaders/*`: shaders de rotas, heatmap, pontos, atmosfera e night lights.
- `src/scene/camera.ts`: painel/tooltip contextual do país.
- `src/ui/*`: componentes auxiliares de UI.
- `public/data/*`: datasets (países e aeroportos).

## Como executar

```bash
npm install
npm run dev
```

Build de produção:

```bash
npm run build
npm run preview
```

## Dados

- Países: `public/data/ne_110m_admin_0_countries.geojson`
- Aeroportos: `public/data/airports_points.json`
- Bandeiras (SVG): `public/flags/*.svg`

## Objetivo de produto

Entregar um globo de exploração aérea com aparência e movimento de nível "research-grade":

- visualmente limpo e intencional;
- interação estável e previsível;
- renderização eficiente para cenários de alta densidade.

---

## Descrição curta para o GitHub (About)

Plataforma de visualização 3D de rotas aéreas globais em Three.js, com interação por país, shaders customizados, heatmap de tráfego e UI estilo Google Research.
