# Transmission UI - Personal Edition

## Vision
A beautiful, minimalist interface for Transmission that prioritizes visual appeal and user experience. The UI should feel both powerful and effortless, with a focus on dark mode aesthetics and modern design principles.

## Design Philosophy

### Visual Aesthetics
- **Dark-First Design**: Dark theme as the primary design, optimized for low-light environments
- **Color Palette**:
  - Background: Deep slate (#0f172a)
  - Surface: Navy slate (#1e293b)
  - Accent: Electric blue (#3b82f6)
  - Success: Emerald (#10b981)
  - Warning: Amber (#f59e0b)
  - Error: Rose (#ef4444)
  - Text: Soft white (#f8fafc)
  - Muted Text: Slate (#94a3b8)

### Design Principles
1. **Minimalist Interface**
   - Clean, uncluttered layouts
   - Essential information at first glance
   - Progressive disclosure for detailed information
   - Smooth transitions and animations

2. **Visual Hierarchy**
   - Important actions and information stand out
   - Secondary functions accessible but not intrusive
   - Clear visual grouping of related elements

3. **Responsive Design**
   - Fluid layouts that adapt to any screen size
   - Mobile-friendly touch targets
   - Consistent experience across devices

## Core Features

### 1. Main Torrent View
![Main View Layout](placeholder-image)
```
┌─────────────────────────────────────────┐
│ Global Stats & Controls                 │
├─────────────────────────────────────────┤
│ ┌─────┐ ┌─────┐ ┌─────┐               │
│ │Speed│ │Ratio│ │Space│   Actions     │
│ └─────┘ └─────┘ └─────┘               │
├─────────────────────────────────────────┤
│                                         │
│ Torrent List                           │
│ - Progress bars with gradient          │
│ - Status indicators                    │
│ - Essential info                       │
│                                         │
├─────────────────────────────────────────┤
│ Detailed View (Expandable)              │
└─────────────────────────────────────────┘
```

### 2. Quick Actions
- Floating action button for adding torrents
- Speed limit toggle with visual indicator
- Global start/pause with smooth animation
- Quick search with instant filtering

### 3. Torrent Details
Expandable panel with:
- Visual bandwidth graphs
- File tree with size visualization
- Peer map with connection quality indicators
- Tracker status with uptime visualization

### 4. Status Display
```
┌──────────────────────┐
│ Download: 2.1 MB/s ▼ │
│ Upload:   1.5 MB/s ▲ │
│ Active:   5 ↺        │
└──────────────────────┘
```

## Key Components

### 1. Speed Display
- Real-time graph with gradient fills
- Smooth animation for changes
- Hover details for historical data
```typescript
interface SpeedGraphProps {
  downloadSpeeds: number[]
  uploadSpeeds: number[]
  timeSpan: '1h' | '6h' | '24h'
}
```

### 2. Torrent Progress
- Custom progress bar with:
  - Gradient fill based on status
  - Piece completion visualization
  - Hover state with detailed stats
```typescript
interface ProgressBarProps {
  progress: number
  status: TorrentStatus
  pieces?: string // Base64 piece data
  showPieces?: boolean
}
```

### 3. Status Indicators
- Animated icons for different states
- Color-coded status pills
- Tooltip with detailed information
```typescript
interface StatusIndicatorProps {
  status: TorrentStatus
  error?: string
  ratio: number
  seeds: number
  peers: number
}
```

## State Management

### Core State
```typescript
interface AppState {
  // Essential torrent state
  torrents: {
    items: Map<number, TorrentData>
    selected: number | null
    view: 'grid' | 'list'
  }
  
  // UI state
  ui: {
    speedGraph: {
      visible: boolean
      timespan: '1h' | '6h' | '24h'
    }
    detailsPanel: {
      open: boolean
      tab: 'files' | 'peers' | 'trackers'
    }
    theme: {
      mode: 'dark' | 'darker'
      accentColor: string
    }
  }
  
  // Session state
  session: {
    speeds: {
      down: number
      up: number
    }
    altSpeedEnabled: boolean
    stats: SessionStats
  }
}
```

## Key Features Implementation

### 1. Real-time Updates
```typescript
const useSpeedUpdates = () => {
  const [speeds, setSpeeds] = useState<SpeedData>([])
  
  useEffect(() => {
    const interval = setInterval(async () => {
      const stats = await client.getSessionStats()
      setSpeeds(prev => [...prev.slice(-60), stats.speeds])
    }, 1000)
    
    return () => clearInterval(interval)
  }, [])
  
  return speeds
}
```

### 2. Smooth Animations
```typescript
// Tailwind config extension
const animations = {
  'progress-fill': {
    '0%': { transform: 'translateX(-100%)' },
    '100%': { transform: 'translateX(0)' }
  },
  'status-pulse': {
    '0%, 100%': { opacity: 1 },
    '50%': { opacity: 0.5 }
  }
}
```

### 3. Theme System
```typescript
const theme = {
  colors: {
    // Dark theme
    dark: {
      background: '#0f172a',
      surface: '#1e293b',
      accent: '#3b82f6',
      text: '#f8fafc'
    },
    // Darker theme
    darker: {
      background: '#020617',
      surface: '#0f172a',
      accent: '#2563eb',
      text: '#e2e8f0'
    }
  }
}
```

## Usage

### Starting the Project
```bash
# Clone and install
git clone [your-repo]
cd transmission-ui
npm install

# Start development
npm run dev
```

### Configuration
Create `.env`:
```env
VITE_API_URL=http://localhost:9091
VITE_DEFAULT_THEME=dark
VITE_ACCENT_COLOR=#3b82f6
```

This focused version emphasizes:
- Beautiful dark mode interface
- Real-time visualizations
- Smooth animations
- Essential features without clutter
- Personal use optimization