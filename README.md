# Cinematix

A beautiful, modern web interface for Transmission BitTorrent client with a focus on movie downloading and management. Built with React, TypeScript, and Tailwind CSS.

![License](https://img.shields.io/badge/license-MIT-blue.svg)

## Features

- 🎬 Seamless integration with YTS movies database
- 🌙 Beautiful dark mode interface
- 📊 Real-time torrent statistics and graphs
- 🔍 Advanced torrent search and filtering
- 📁 Detailed file management
- 🔄 Real-time updates via WebSocket
- ⚡ Fast and responsive UI
- 🎨 Modern design with smooth animations
- 🛠️ Advanced settings management

## Prerequisites

- Node.js >= 18
- npm or yarn
- Running Transmission daemon with RPC enabled

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/cinematix.git
cd cinematix
```

2. Install dependencies:
```bash
# Install main app dependencies
npm install

# Install config server dependencies
cd cinematix-config-server
npm install
cd ..
```

3. Configure the application:
   - Copy `.env.example` to `.env` if needed
   - The first time you run the application, you'll be prompted to enter your Transmission connection details

## Development

Run the development server:

```bash
# Start both the main app and config server
npm run dev
```

The application will be available at `http://localhost:5173`.

### Project Structure

```
cinematix/
├── src/
│   ├── components/      # Reusable UI components
│   ├── features/        # Feature-specific components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and API clients
│   ├── store/          # Global state management
│   ├── styles/         # Global styles and themes
│   └── types/          # TypeScript type definitions
├── cinematix-config-server/  # Configuration server
└── public/             # Static assets
```

## Building for Production

1. Build the project:
```bash
npm run build
```

2. The built files will be in the `dist` directory. Serve using your preferred web server.

## Configuration

### Transmission Settings

Make sure your Transmission daemon has RPC enabled and accessible. Default connection settings:

- Host: localhost
- Port: 9091
- RPC URL: /transmission/rpc

### Environment Variables

- `VITE_API_URL`: Transmission RPC endpoint URL
- `VITE_DEFAULT_THEME`: Default theme (light/dark)

## Features in Detail

### Movie Integration
- Search and browse YTS movie database
- One-click movie downloads
- Auto-filled torrent information

### Torrent Management
- Real-time status updates
- Detailed torrent information
- File selection and priority management
- Bandwidth graphs and statistics
- Advanced queue management

### User Interface
- Responsive design works on all devices
- Beautiful animations and transitions
- Intuitive drag-and-drop interface
- Context menus for quick actions
- Keyboard shortcuts for power users

### Advanced Features
- Multiple view modes
- Advanced filtering and sorting
- Detailed peer information
- Tracker management
- Download location management

## Keyboard Shortcuts

- `Space`: Toggle selected torrents
- `Delete`: Remove selected torrents
- `Ctrl/Cmd + A`: Select all torrents
- `Escape`: Clear selection

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgments

- Built with [React](https://reactjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons by [Lucide](https://lucide.dev/)
- Movie data from [YTS](https://yts.mx/)
- Transmission BitTorrent client