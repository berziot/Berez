# Berez Frontend 💧

Next.js 14 frontend for the Berez drinking fountain finder app. Mobile-first React application with TypeScript, Tailwind CSS, and interactive maps.

## 🎯 Features

### User Experience
- **📱 Mobile-First Design**: Optimized for phones, thumb-friendly navigation
- **🗺️ Interactive Map**: Leaflet-powered map with custom fountain markers
- **🔍 Smart Search**: Find fountains by distance from your location
- **⭐ Multi-Criteria Ratings**: Rate overall quality, temperature, stream, and quenching
- **📸 Photo Upload**: Add photos from camera or gallery
- **💬 Community Reviews**: Read and write fountain reviews
- **🔐 User Authentication**: Register, login, manage profile
- **🧭 Google Maps Integration**: One-tap navigation to any fountain

### Technical Features
- **Server-Side Rendering**: Fast initial page loads with Next.js 14 App Router
- **Type Safety**: Full TypeScript coverage
- **Responsive Design**: Works seamlessly from 320px mobile to 4K desktop
- **RTL Support**: Full Hebrew language support
- **Progressive Web App**: Installable on mobile devices
- **Optimistic Updates**: Instant UI feedback
- **Loading States**: Skeleton screens for better perceived performance

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend/README.md)

### Installation

1. **Install dependencies**:
```bash
npm install
```

2. **Configure environment**:
```bash
cp .env.example .env.local
```

Edit `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Run development server**:
```bash
npm run dev
```

Open http://localhost:3000

### Build for Production
```bash
npm run build
npm start
```

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                          # Next.js 14 App Router
│   │   ├── layout.tsx                # Root layout (providers, metadata)
│   │   ├── page.tsx                  # Homepage (list/map view)
│   │   ├── globals.css               # Global styles, Tailwind, themes
│   │   ├── types.tsx                 # TypeScript types/interfaces
│   │   ├── consts.tsx                # App constants, API URL
│   │   │
│   │   ├── [fountain_id]/            # Dynamic fountain pages
│   │   │   └── page.tsx              # Fountain detail + reviews
│   │   │
│   │   ├── login/                    # Authentication
│   │   │   └── page.tsx              # Login form
│   │   │
│   │   ├── register/                 
│   │   │   └── page.tsx              # Registration form
│   │   │
│   │   └── profile/                  
│   │       └── page.tsx              # User profile page
│   │
│   ├── components/                   # Reusable React components
│   │   ├── FountainMap.tsx           # Leaflet map with markers
│   │   ├── FountainCard.tsx          # Fountain list item
│   │   ├── BottomSheet.tsx           # Draggable map detail sheet
│   │   ├── BottomNav.tsx             # Mobile bottom navigation
│   │   ├── StarRating.tsx            # Interactive star rating
│   │   ├── PhotoUpload.tsx           # Camera/gallery photo picker
│   │   ├── PhotoCarousel.tsx         # Swipeable image carousel
│   │   ├── LoadingSkeleton.tsx       # Loading placeholders
│   │   └── AddReviewCard.tsx         # Review submission form
│   │
│   └── contexts/                     # React Context providers
│       ├── AuthContext.tsx           # User auth state & functions
│       └── FountainContext.tsx       # Fountain data & geolocation
│
├── public/                           # Static assets
│   ├── next.svg
│   └── vercel.svg
│
├── .env.example                      # Environment variables template
├── .env.local                        # Local environment (gitignored)
├── next.config.js                    # Next.js configuration
├── tailwind.config.ts                # Tailwind CSS configuration
├── tsconfig.json                     # TypeScript configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

## 🎨 Design System

### Colors (Tailwind)
```css
/* Water-themed blue palette */
--primary: #0066CC;        /* Ocean blue */
--primary-dark: #0052A3;   /* Deep water */
--primary-light: #3399FF;  /* Sky blue */
--success: #10B981;        /* Green */
--error: #EF4444;          /* Red */
--warning: #F59E0B;        /* Orange */
```

### Typography
```css
/* Tailwind defaults optimized for mobile */
--font-body: system-ui, sans-serif;
--text-base: 16px;   /* Prevents iOS zoom on input focus */
--text-lg: 18px;
--text-xl: 20px;
--text-2xl: 24px;
```

### Spacing
```css
/* Mobile-first spacing (Tailwind scale) */
--space-1: 0.25rem;  /* 4px */
--space-2: 0.5rem;   /* 8px */
--space-4: 1rem;     /* 16px */
--space-6: 1.5rem;   /* 24px */
--space-8: 2rem;     /* 32px */
```

### Touch Targets
All interactive elements follow Apple HIG:
- Minimum: 44x44px
- Preferred: 48x48px for primary actions
- Spacing: 8px between targets

## 🗺️ Page Descriptions

### Homepage (`/`)
**Purpose**: Main entry point, fountain discovery

**Layout**:
```
┌─────────────────────────┐
│  BEREZ          [👤]    │  Header
├─────────────────────────┤
│  [List] [Map]           │  View toggle
├─────────────────────────┤
│                         │
│  Fountain Cards         │  List view
│  or                     │
│  Interactive Map        │  Map view
│                         │
├─────────────────────────┤
│  [🏠]  [🗺️]  [👤]      │  Bottom nav
└─────────────────────────┘
```

**Features**:
- GPS location request on mount
- Toggle between list/map views (persisted in localStorage)
- Fountain cards with distance, rating, features
- Leaflet map with color-coded markers
- Bottom sheet for fountain preview on map
- Pull-to-refresh on list view

### Fountain Detail (`/[fountain_id]`)
**Purpose**: View fountain details, reviews, photos

**Layout**:
```
┌─────────────────────────┐
│ [←]  Fountain #123      │
├─────────────────────────┤
│ [Photo Carousel]        │  Swipeable
├─────────────────────────┤
│ 🐕 Dog  🍼 Bottle       │  Features
│ 150m away               │
│ ★★★★☆ 4.2 (12 ratings) │
├─────────────────────────┤
│                         │
│  Reviews List           │  Scrollable
│                         │
├─────────────────────────┤
│ [Add Review] [Navigate] │  Sticky CTAs
└─────────────────────────┘
```

**Features**:
- Photo carousel with fullscreen view
- Overall and sub-ratings display
- Review list with user info, ratings, text
- Sticky action buttons
- Google Maps navigation

### Login (`/login`)
**Purpose**: User authentication

**Features**:
- Email + password form
- Client-side validation
- Error messages
- Link to registration
- Auto-redirect after login

### Register (`/register`)
**Purpose**: New user signup

**Features**:
- Username, email, password fields
- Password confirmation
- Validation (length, match, format)
- Link to login
- Auto-login after successful registration

### Profile (`/profile`)
**Purpose**: User account management

**Features**:
- Display username, email, join date
- Logout button
- Protected route (requires auth)

## 🧩 Component Details

### `FountainMap.tsx`
Interactive Leaflet map with custom markers.

**Props**: None (uses FountainContext)

**Features**:
- User location with blue dot marker
- Fountain markers (color-coded by rating)
- Tap marker → show bottom sheet
- Re-center button
- Loading state
- Mobile-optimized controls

**Implementation**:
```tsx
// Direct Leaflet usage (not react-leaflet for better SSR)
useEffect(() => {
  if (typeof window === 'undefined') return;
  
  const L = require('leaflet');
  const map = L.map(mapRef.current).setView([lat, lng], 13);
  // ... marker logic
}, []);
```

### `BottomSheet.tsx`
Draggable bottom sheet for map fountain preview.

**Props**:
- `fountain: Fountain | null`
- `onClose: () => void`
- `onNavigate: () => void`

**Features**:
- Touch drag to adjust height
- Snap points (collapsed, half, full)
- Swipe down to close
- Smooth animations
- Background overlay

### `StarRating.tsx`
Interactive star rating component.

**Props**:
- `value: number` (1-5)
- `onChange?: (rating: number) => void`
- `size?: 'sm' | 'md' | 'lg'`
- `readonly?: boolean`

**Features**:
- 48px touch targets (when interactive)
- Half-star support
- Hover preview (desktop)
- Tap feedback (mobile)
- Accessible (keyboard navigation)

### `PhotoUpload.tsx`
Camera/gallery image upload.

**Props**:
- `onUpload: (photoIds: string[]) => void`
- `maxPhotos?: number`

**Features**:
- Camera access (mobile)
- Gallery picker
- Image preview before upload
- Remove uploaded photos
- File type validation (JPG, PNG, GIF, WebP)
- Size validation (max 10MB)
- Upload progress

### `PhotoCarousel.tsx`
Swipeable image carousel.

**Props**:
- `photos: string[]` (URLs)

**Features**:
- Touch swipe navigation
- Dot indicators
- Fullscreen modal view
- Pinch to zoom (in modal)
- Empty state placeholder

### `LoadingSkeleton.tsx`
Collection of skeleton loaders.

**Exports**:
- `FountainCardSkeleton`
- `FountainListSkeleton`
- `FountainDetailSkeleton`
- `MapSkeleton`

**Purpose**: Better perceived performance during data loading

## 🔄 State Management

### AuthContext
```tsx
interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (username: string, email: string, password: string) => Promise<void>;
  logout: () => void;
}
```

**Storage**: JWT token in `localStorage`  
**Auto-fetch**: User info on app load  
**Auto-redirect**: Login page if accessing protected routes

### FountainContext
```tsx
interface FountainContextType {
  fountains: Fountain[];
  userLocation: {lat: number, lng: number} | null;
  isLoadingLocation: boolean;
  isLoadingFountains: boolean;
  error: string | null;
  fetchFountains: () => Promise<void>;
  getDistance: (fountain: Fountain) => number;
}
```

**Features**:
- GPS location request
- Fetch fountains by distance
- Calculate distances (Haversine formula)
- Error handling

## 📱 Mobile-First Principles

### Viewport Configuration
```html
<meta name="viewport" 
  content="width=device-width, initial-scale=1, maximum-scale=5, user-scalable=yes">
```

### Safe Area Insets
```css
/* Support iPhone notch */
padding-bottom: calc(1rem + env(safe-area-inset-bottom));
```

### Touch Targets
```tsx
// Minimum 44x44px
className="min-w-[44px] min-h-[44px] flex items-center justify-center"
```

### Text Size
```css
/* Prevent iOS auto-zoom on input focus */
input, textarea {
  font-size: 16px;  /* Never less than 16px */
}
```

### Bottom Navigation
```tsx
// Sticky at bottom, safe-area aware
className="fixed bottom-0 inset-x-0 pb-safe bg-white border-t"
```

## 🌍 RTL Support

All components support right-to-left languages:

```tsx
// Layout.tsx
<html lang="he" dir="rtl">
```

```css
/* Tailwind RTL plugin handles:
 * - Padding/margin flips
 * - Text alignment
 * - Border directions
 */
```

Test RTL:
```bash
# Toggle in browser DevTools
document.documentElement.dir = 'rtl'
```

## 🎭 Styling Approach

### Tailwind CSS
- **Utility-first**: Compose styles with utility classes
- **Mobile-first**: Base styles for mobile, `md:` for desktop
- **Custom colors**: Extended with water theme
- **RTL plugin**: Automatic RTL transformations

### Custom CSS (globals.css)
Used only for:
- CSS variables (colors, spacing)
- Component styles (complex animations)
- Third-party overrides (Leaflet)
- Print styles

### Example Component
```tsx
export function FountainCard({ fountain }: Props) {
  return (
    <div className="
      bg-white rounded-lg p-4 shadow-sm
      hover:shadow-md transition-shadow
      min-h-[120px]
      md:p-6
    ">
      <h3 className="text-lg font-semibold mb-2">
        Fountain #{fountain.id}
      </h3>
      {/* ... */}
    </div>
  );
}
```

## 🔌 API Integration

### Configuration
```tsx
// src/app/consts.tsx
export const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
```

### Fetch Example
```tsx
async function getFountains(lat: number, lng: number) {
  const response = await fetch(
    `${API_URL}/fountains/${lng},${lat}?limit=50`
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch fountains');
  }
  
  const data = await response.json();
  return data.items;
}
```

### Authenticated Requests
```tsx
const token = localStorage.getItem('token');

const response = await fetch(`${API_URL}/auth/me`, {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
```

## 🚀 Deployment (Vercel)

### Automatic (Recommended)
1. Push code to GitHub
2. Connect repo to Vercel
3. Set environment variable:
   - `NEXT_PUBLIC_API_URL` = your API Gateway URL
4. Deploy automatically on every push

### Manual (Vercel CLI)
```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Set production environment variable
vercel env add NEXT_PUBLIC_API_URL production
# Paste: https://[api-id].execute-api.[region].amazonaws.com/prod

# Deploy to production
vercel --prod
```

### Custom Domain
```bash
vercel domains add berez.app
# Follow DNS instructions
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] Homepage loads fountains
- [ ] Map displays markers
- [ ] Bottom sheet works on map
- [ ] List view shows distances
- [ ] Registration creates account
- [ ] Login works with valid credentials
- [ ] Profile shows user info
- [ ] Logout clears token
- [ ] Fountain detail shows reviews
- [ ] Review form submits successfully
- [ ] Photo upload works
- [ ] Star rating is interactive
- [ ] Navigation buttons work
- [ ] RTL mode renders correctly
- [ ] Mobile navigation is visible
- [ ] Touch targets are adequate (44px+)

### Browser Testing
- ✅ Chrome/Edge (Chromium)
- ✅ Safari (iOS, macOS)
- ✅ Firefox
- ⚠️ IE11 (not supported)

### Device Testing
- ✅ iPhone SE (320px - smallest)
- ✅ iPhone 12/13/14 (390px)
- ✅ iPhone Pro Max (428px)
- ✅ Android (various)
- ✅ iPad (768px+)
- ✅ Desktop (1920px+)

## 🔧 Development Tips

### Hot Reload
Next.js automatically reloads on file changes. No configuration needed.

### Component Development
```bash
# Create new component
touch src/components/MyComponent.tsx

# Use in page
import { MyComponent } from '@/components/MyComponent';
```

### Debugging
```tsx
// Client-side console
console.log('Debug:', data);

// Server-side (App Router)
console.log('Server:', data);  // Shows in terminal
```

### Type Safety
```bash
# Type check entire project
npm run type-check

# Or via TypeScript
npx tsc --noEmit
```

### Environment Variables
- Must start with `NEXT_PUBLIC_` to be exposed to browser
- Rebuild required after changes
- Never commit `.env.local`

## ⚡ Performance Optimizations

### Implemented
- ✅ Server-side rendering (Next.js 14)
- ✅ Image optimization (Next.js Image component)
- ✅ Code splitting (automatic)
- ✅ Font optimization (next/font)
- ✅ CSS purging (Tailwind)
- ✅ Bundle analysis (`npm run analyze`)

### TODO
- [ ] Service worker (offline mode)
- [ ] Cache API responses
- [ ] Lazy load images below fold
- [ ] Prefetch fountain data on hover

## 📦 Dependencies

### Core
- `next@14` - React framework
- `react@18` - UI library
- `react-dom@18` - React renderer
- `typescript@5` - Type safety

### Styling
- `tailwindcss@3` - Utility CSS
- `postcss@8` - CSS processing
- `autoprefixer@10` - CSS prefixing

### Maps
- `leaflet@1.9` - Interactive maps
- `@types/leaflet` - TypeScript types

### UI Components
- `embla-carousel-react@8` - Touch carousels

### Development
- `eslint@8` - Code linting
- `eslint-config-next@14` - Next.js lint rules

## 🐛 Troubleshooting

### "Hydration failed" error
**Cause**: Server/client HTML mismatch  
**Fix**: Ensure components render identically on server and client

```tsx
// ❌ Wrong (uses window on server)
const isMobile = window.innerWidth < 768;

// ✅ Correct
const [isMobile, setIsMobile] = useState(false);
useEffect(() => {
  setIsMobile(window.innerWidth < 768);
}, []);
```

### "localStorage is not defined"
**Cause**: Accessing localStorage during SSR  
**Fix**: Use useEffect

```tsx
// ❌ Wrong
const token = localStorage.getItem('token');

// ✅ Correct
const [token, setToken] = useState<string | null>(null);
useEffect(() => {
  setToken(localStorage.getItem('token'));
}, []);
```

### Map not rendering
**Cause**: Leaflet needs `window` object  
**Fix**: Already handled in FountainMap.tsx with dynamic import

### Environment variable not working
**Cause**: Forgot `NEXT_PUBLIC_` prefix or didn't rebuild  
**Fix**: 
```bash
# Rename variable
NEXT_PUBLIC_API_URL=...

# Restart dev server
npm run dev
```

## 📚 Resources

- [Next.js 14 Documentation](https://nextjs.org/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Leaflet Documentation](https://leafletjs.com/reference.html)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

## 🤝 Contributing

See main project README for contribution guidelines.

---

Built with ⚛️ React and 🎨 Tailwind CSS
