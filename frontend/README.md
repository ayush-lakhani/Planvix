# Frontend - AI Content Strategy Planner

Premium React application with beautiful UI for generating and managing content strategies.

## 🎨 Design Philosophy

### Premium Aesthetics
- **Glassmorphism**: Semi-transparent cards with backdrop blur
- **Smooth Gradients**: Primary-to-accent color transitions
- **Micro-animations**: Fade-ins, slide-ups, hover effects
- **Dark Mode**: Fully supported with smooth transitions
- **Responsive**: Mobile-first design (375px - 1920px)

### Color Palette
```css
Primary: #0ea5e9 (Sky Blue)
Accent: #d946ef (Purple)
Gradients: Linear combinations
Dark Mode: Gray-900/950 backgrounds
```

## 📦 Components

### Pages
- **Login.jsx** - Authentication with email/password
- **Signup.jsx** - User registration with validation
- **Dashboard.jsx** - Main hub with stats and quick actions
- **Generate.jsx** - Strategy generation orchestrator
- **History.jsx** - Past strategies list with view/delete

### Core Components
- **StrategyForm.jsx** - Input form with validation
- **StrategyResults.jsx** - Tabbed results display
- **AgentTerminal.jsx** - Live agent logs terminal

### Features
- **App.jsx** - Routing, auth context, dark mode
- **api.js** - Axios API client with interceptors

## 🚀 Running Locally

### Development Mode
```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

Access at **http://localhost:5173**

### Production Build
```bash
npm run build
npm run preview
```

## 🔧 Configuration

### Environment Variables
Create `.env` file:
```bash
VITE_API_URL=http://localhost:8000
```

### Vite Config
```javascript
// vite.config.js
server: {
  proxy: {
    '/api': 'http://localhost:8000'
  }
}
```

## 🎯 User Flows

### Authentication Flow
1. User lands on `/login`
2. Enters email/password
3. API returns JWT token
4. Token stored in localStorage
5. Redirect to `/dashboard`
6. Token auto-attached to all requests

### Strategy Generation Flow
1. User clicks "Generate" from dashboard
2. Fills form (goal, audience, industry, platform)
3. Submits → POST /api/strategy
4. Agent logs display in real-time
5. Results show in tabbed interface
6. User can export or create new

### History Flow
1. User clicks "History" from dashboard
2. GET /api/history loads past strategies
3. Click "View" → loads full strategy
4. Click "Delete" → removes strategy

## 🧩 Component API

### StrategyForm
```jsx
<StrategyForm 
  onGenerate={(data) => {...}}  // Callback with strategy data
  setLoading={(bool) => {...}}  // Loading state
  setAgentLogs={(logs) => {...}} // Agent log updates
/>
```

### StrategyResults
```jsx
<StrategyResults 
  strategy={strategyData}  // Complete strategy object
  onReset={() => {...}}    // Reset to new generation
/>
```

### AgentTerminal
```jsx
<AgentTerminal 
  logs={[...]}      // Array of log objects
  loading={bool}    // Show loading animation
/>
```

## 🎨 Custom Styles

### Tailwind Classes
```css
.glass-card        /* Glassmorphism card */
.btn-gradient      /* Gradient button */
.input-premium     /* Styled input field */
.transition-smooth /* 300ms transitions */
```

### Animations
```css
.animate-fade-in   /* 0.5s fade in */
.animate-slide-up  /* 0.5s slide from bottom */
.animate-shimmer   /* Loading skeleton */
```

## 📱 Responsive Breakpoints

```
Mobile:  375px - 639px
Tablet:  640px - 1023px
Desktop: 1024px+

Grid: 1 col mobile → 2 cols tablet → 3 cols desktop
Forms: Full width mobile → max-w-md center desktop
```

## 🔐 Authentication

### Context API
```jsx
const { user, login, logout } = useAuth();

// Login
login(userData, token);

// Logout
logout(); // Clears localStorage + state

// Protected Routes
{user ? <Dashboard /> : <Navigate to="/login" />}
```

### Token Management
- Stored in `localStorage.token`
- Auto-attached via axios interceptor
- 24-hour expiration
- Auto-clear on 401 errors

## 🧪 Testing Locally

1. **Start backend**: `docker-compose up` (or manual)
2. **Start frontend**: `npm run dev`
3. **Sign up**: Create account at http://localhost:5173/signup
4. **Generate**: Fill form → Submit → Wait 20-30s
5. **View results**: Tabs for persona, gaps, keywords, calendar, posts
6. **Check history**: See all past generations

## 📦 Build & Deploy

### Build for Production
```bash
npm run build
# Output: dist/
```

### Deploy to Vercel

#### Option 1: CLI
```bash
npm i -g vercel
vercel --prod
```

#### Option 2: GitHub Integration
1. Push to GitHub
2. Import project in Vercel dashboard
3. Set environment variable: `VITE_API_URL`
4. Deploy automatically on push

### Environment Variables (Vercel)
```
VITE_API_URL=https://your-backend-url.com
```

### Razorpay Integration
Ensure you have the Razorpay script in `index.html`:
```html
<script src="https://checkout.razorpay.com/v1/checkout.js"></script>
```

## 🔍 File Structure

```
frontend/
├── public/
│   └── vite.svg
├── src/
│   ├── components/
│   │   ├── Login.jsx
│   │   ├── Signup.jsx
│   │   ├── Dashboard.jsx
│   │   ├── Generate.jsx
│   │   ├── StrategyForm.jsx
│   │   ├── StrategyResults.jsx
│   │   ├── AgentTerminal.jsx
│   │   └── History.jsx
│   ├── App.jsx           # Routing + Auth Context
│   ├── api.js            # API client
│   ├── index.css         # Tailwind + custom styles
│   └── main.jsx          # React entry point
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── postcss.config.js
└── README.md
```

## 🎨 Design Tokens

### Typography
```
Font: 'Inter' (Google Fonts)
Weights: 300, 400, 500, 600, 700, 800, 900
```

### Shadows
```
Card: shadow-xl (0 20px 25px -5px rgba(0,0,0,0.1))
Button: shadow-lg (0 10px 15px -3px rgba(0,0,0,0.1))
```

### Border Radius
```
Buttons: rounded-xl (12px)
Cards: rounded-2xl (16px)
```

## 🐛 Troubleshooting

**Dark mode not persisting**
- Check localStorage.darkMode
- Verify `dark` class on `<html>`

**API requests failing**
- Check VITE_API_URL
- Verify backend is running
- Check CORS configuration

**Routing issues**
- Ensure vercel.json has SPA rewrite
- Check React Router setup

**Styles not applying**
- Run `npm run build` to rebuild
- Clear browser cache
- Check Tailwind purge config

## 📈 Performance

### Metrics
- **First Load**: <2s
- **Time to Interactive**: <3s
- **Lighthouse Score**: 90+

### Optimizations
- Vite's fast HMR
- Lazy loading images
- Code splitting per route
- Tailwind CSS purging
- Production build minification

---

**Frontend built with React + Vite + Tailwind** ⚡️
