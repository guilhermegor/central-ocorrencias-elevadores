<!-- readme-archetype: spa -->
# central-ocorrencias-elevadores

[![Project Status: Active](https://www.repostatus.org/badges/latest/active.svg)](https://www.repostatus.org/#active)
![Node](https://img.shields.io/badge/node-%E2%89%A522-339933?logo=node.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/typescript-5.x-3178C6?logo=typescript&logoColor=white)
![React](https://img.shields.io/badge/react-19-61DAFB?logo=react&logoColor=white)
![Webpack](https://img.shields.io/badge/webpack-5-8DD6F9?logo=webpack&logoColor=white)
[![Linting](https://img.shields.io/badge/linting-eslint_|_stylelint_|_prettier-blue)](https://eslint.org)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Open Issues](https://img.shields.io/github/issues/guilhermegor/central-ocorrencias-elevadores)
![Contributions Welcome](https://img.shields.io/badge/contributions-welcome-darkgreen.svg)

<!-- slug: overview -->
## Overview

Registro, classificação, priorização e despacho de ocorrências de elevadores, com painel de gestão (FIAP Challenge OTIS 2026)

<!-- slug: features -->
## Features

### Pages & Routes
- [Page placeholder 1](#)
- [Page placeholder 2](#)
- [Page placeholder 3](#)

### Capabilities (vertical slices)
- [Capability placeholder 1](#)
- [Capability placeholder 2](#)
- [Capability placeholder 3](#)

### State Management
- Variant: **React Context** — see `src/capabilities/<feature>/context.tsx`

### UI & Accessibility
- [a11y / i18n / theming placeholder](#)
- [Design-system placeholder](#)

### Performance
- [Code-splitting / lazy-loading placeholder](#)
- [Bundle-analysis placeholder](#)

### Testing
- Unit / component: **Jest + React Testing Library**
- End-to-end: **Playwright** (chromium)

<!-- slug: getting-started -->
## Getting Started

<!-- slug: install -->
### Install

#### Prerequisites
- Node ≥ 22 — the exact version is pinned in `.nvmrc` (`nvm use` / `fnm use`)
- npm (bundled with Node) — pnpm / yarn also work
- A modern browser for development (Chrome, Firefox, Safari)

Clone and install:

```bash
git clone https://github.com/guilhermegor/central-ocorrencias-elevadores.git
cd central-ocorrencias-elevadores
npm install
```

<!-- slug: usage -->
### Usage

```bash
npm start      # webpack-dev-server with HMR at http://localhost:3000
npm run build  # production build, emits to dist/
```

<!-- slug: project-structure -->
## Project Structure

```text
central-ocorrencias-elevadores/
├── .github/
│   ├── workflows/             # CI: build, lint, test, type-check (+ deploy-spa for Pages)
│   ├── CLAUDE.md              # guidance for adding recurrent / scheduled automation
│   ├── CODEOWNERS
│   └── PULL_REQUEST_TEMPLATE.md
├── .husky/                    # pre-commit / pre-push hooks
├── .specs/
│   ├── CLAUDE.md               # layout rules + spec template (US-/AC-/ASM-/Q-XXX ids)
│   └── features/               # one subfolder per feature spec
├── .vscode/
├── public/
│   └── index.html             # ships <meta name="viewport"> — do not remove
├── src/
│   ├── capabilities/          # vertical slices: domain / application / infrastructure / ui
│   │   └── <feature>/
│   │       ├── domain/        # entities, dto, enums, ports — no I/O, no React
│   │       ├── application/   # use-cases, factories — depends on domain only
│   │       ├── infrastructure/# adapters implementing domain ports
│   │       ├── ui/            # components, pages, styles.module.css
│   │       ├── context.tsx    # composition root — wires infra → app → React tree
│   │       └── index.ts       # public barrel
│   ├── shared/
│   │   └── styles/            # design tokens + theme
│   ├── routes/                # app-level routing
│   ├── App.tsx
│   └── index.tsx
├── tests/
│   └── e2e/                   # Playwright specs
├── .babelrc
├── .editorconfig
├── .gitignore
├── .nvmrc                     # pinned Node version (single source of truth)
├── .prettierrc.js
├── .stylelintrc.json
├── eslint.config.js
├── jest.config.cjs
├── jest.setup.ts
├── lint-staged.config.js
├── package.json
├── playwright.config.ts
├── tsconfig.json
├── webpack.config.js
├── LICENSE
└── README.md
```

<!-- slug: development -->
## Development

### Running Tests

```bash
npm test                       # Jest + RTL (unit / component)
npm test -- --watch            # watch mode
npm run test:e2e:frontend      # Playwright e2e
npm run test:e2e:frontend:ui   # Playwright UI runner
```

### Type-check & lint

```bash
npm run type-check  # tsc --noEmit
npm run lint        # eslint --fix
```

<!-- slug: deployment -->
## Deployment

### GitHub Pages

The scaffold ships `.github/workflows/deploy-spa.yml`, which builds the SPA
with `PUBLIC_PATH=/<repo-name>/`, adds a `404.html` fallback for client-side
routes, and pushes `dist/` to `gh-pages` on every push to `main`.

**One-time setup is required** — GitHub no longer auto-enables Pages on
first `gh-pages` push. After the first successful workflow run, run:

```bash
gh api -X POST repos/guilhermegor/central-ocorrencias-elevadores/pages \
  -f 'source[branch]=gh-pages' -f 'source[path]=/'
```

…or enable it manually via `Settings → Pages → Source: gh-pages → /`.

See `CLAUDE.md → Deployment` for the full rationale (token scopes, router
basename, custom domains).

### Docker (optional)

If you scaffolded with the Docker option, the project root has a `Dockerfile`,
`nginx.conf`, and `.dockerignore`. The build is **multi-stage** (Node build →
nginx serve), so the final image carries only the static `dist/` on nginx
(~30 MB — no Node, no `node_modules`, no source).

```bash
# Build — the BuildKit secret passes .env at build time without baking it into a layer
docker build --secret id=env,src=.env -t central-ocorrencias-elevadores .

# Run — nginx serves the SPA on port 80
docker run --rm -p 8080:80 central-ocorrencias-elevadores   # → http://localhost:8080
```

To pin the build to the Node version in `.nvmrc`, add
`--build-arg NODE_VERSION="$(cat .nvmrc)"`. See `CLAUDE.md → Docker` for details.

### Pasta `ship/` — entrega em JavaScript puro

A entrega para a FIAP não pode conter TypeScript. O projeto é desenvolvido em
TypeScript, e `ship/` guarda a tradução versionada: só arquivos `.js`, `.jsx`,
`.html` e `.css`, gerados a partir de `src/` e `public/` (testes ficam de fora).

```bash
npm run ship:build   # remove os tipos com Babel e gera ship/
npm run ship:verify  # falha se sobrar qualquer arquivo fora de .js/.jsx/.html/.css ou menção a TypeScript
npm run ship         # os dois, em ordem
```

Regere `ship/` sempre que mexer em `src/` e commite junto; o CI falha se `ship/`
estiver desatualizado. A cópia remove só os tipos (o JSX continua legível) e sai sem
comentários, porque a verificação de orçamento de comentários também lê `ship/`.

```bash
npm run delivery     # ship + build da cópia em ship/dist/ (ignorado pelo git)
```

`ship/dist/index.html` abre direto do disco (`file://`, duplo clique): rotas por hash,
caminhos relativos e CSS em arquivos (`css/`), sem `<style>` embutido.

<!-- slug: contributing -->
## Contributing

See `CLAUDE.md` for the layout and gate rules; branch from `main`, use Conventional Commits,
and open a pull request.

<!-- slug: license -->
## License

This project is licensed under MIT; see [LICENSE](LICENSE).

<!-- slug: authors -->
## Authors

- guilhermegor — [GitHub](https://github.com/guilhermegor) | [LinkedIn](https://www.linkedin.com/in/guilhermegor)

<!-- slug: useful-links -->
## Useful Links

- [GitHub Repository](https://github.com/guilhermegor/central-ocorrencias-elevadores)
- [Issue Tracker](https://github.com/guilhermegor/central-ocorrencias-elevadores/issues)

---

<sub>Generated from the react-spa-webpack template via [BlueprintX](https://github.com/guilhermegor/blueprintx).</sub>
