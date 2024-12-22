.
├── Dockerfile
├── README.md
├── cinematix-config-server
│   ├── Dockerfile
│   ├── db.json
│   ├── package-lock.json
│   ├── package.json
│   ├── src
│   │   ├── index.ts
│   │   ├── middleware
│   │   │   └── validate.ts
│   │   └── utils
│   │       └── logger.ts
│   └── tsconfig.json
├── docker-compose.yml
├── eslint.config.js
├── index.html
├── package-lock.json
├── package.json
├── postcss.config.js
├── project-documentation.md
├── rpc-spec.md
├── src
│   ├── App.css
│   ├── App.tsx
│   ├── app
│   │   └── layout.tsx
│   ├── backend
│   │   └── config.js
│   ├── components
│   │   ├── InitializationDialog.tsx
│   │   ├── Toast.tsx
│   │   ├── layout
│   │   │   ├── Header.tsx
│   │   │   ├── MainLayout_.tsx
│   │   │   ├── Sidebar.tsx
│   │   │   └── StatusBar.tsx
│   │   ├── modals
│   │   │   └── ConfirmDialog.tsx
│   │   ├── movies
│   │   │   └── MovieSearchBar.tsx
│   │   ├── torrents
│   │   │   ├── TorrentContextMenu.tsx
│   │   │   ├── TorrentFilters.tsx
│   │   │   └── TorrentsList.tsx
│   │   └── ui
│   │       ├── Button.tsx
│   │       ├── Card.tsx
│   │       ├── Dialog.tsx
│   │       ├── Input.tsx
│   │       ├── ProgressBar.tsx
│   │       ├── Table.tsx
│   │       └── tabs.tsx
│   ├── features
│   │   ├── settings
│   │   │   ├── SettingsDialog.tsx
│   │   │   └── SettingsForm.tsx
│   │   ├── stats
│   │   │   ├── RatioStats.tsx
│   │   │   ├── SpeedGraph.tsx
│   │   │   └── StatsDisplay.tsx
│   │   └── torrents
│   │       ├── AddTorrent.tsx
│   │       └── details
│   │           ├── FilesList.tsx
│   │           ├── GeneralInfo.tsx
│   │           ├── PeersList.tsx
│   │           ├── TorrentDetails.tsx
│   │           └── TrackersList.tsx
│   ├── hooks
│   │   ├── useSession.ts
│   │   ├── useTorrents.ts
│   │   └── useWebSocket.ts
│   ├── index.css
│   ├── lib
│   │   ├── api
│   │   │   ├── client.ts
│   │   │   ├── configClient.ts
│   │   │   ├── session.ts
│   │   │   ├── torrents.ts
│   │   │   └── yts.ts
│   │   ├── config.ts
│   │   ├── constants.ts
│   │   └── utils.ts
│   ├── main.tsx
│   ├── store
│   │   ├── middleware
│   │   │   └── logger.ts
│   │   ├── session.ts
│   │   ├── store.ts
│   │   └── torrents.ts
│   ├── styles
│   │   └── globals.css
│   ├── types
│   │   ├── models.ts
│   │   ├── rpc.ts
│   │   └── session.ts
│   ├── utils
│   │   ├── calculations.ts
│   │   ├── formatters.ts
│   │   └── validators.ts
│   └── vite-env.d.ts
├── structure.md
├── tailwind.config.js
├── tsconfig.app.json
├── tsconfig.json
├── tsconfig.node.json
├── tsconfig.tsbuildinfo
├── vite.config.ts
└── yts.mx.txt

27 directories, 84 files