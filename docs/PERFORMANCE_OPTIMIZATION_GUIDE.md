# NURTURA Performance Optimization & Validation Guide

## 📊 Current Performance Targets

### Core Web Vitals (CWV)
```
FCP  (First Contentful Paint):     < 1.8s  ✅ Target
LCP  (Largest Contentful Paint):   < 2.5s  ✅ Target
CLS  (Cumulative Layout Shift):    < 0.05  ✅ Target
INP  (Interaction to Next Paint):  < 200ms ✅ Target
TTFB (Time to First Byte):         < 0.6s  ✅ Target
```

### Lighthouse Score Targets (v11)
```
Performance:         > 90  (Target: 95+)
Accessibility:       > 95  (Target: 98+)
Best Practices:      > 90  (Target: 95+)
SEO:                 > 90  (Target: 95+)
PWA (optional):      > 90
```

### Bundle Size Limits
```
JavaScript (gzipped):
  Initial chunk:     < 100KB
  All chunks:        < 200KB

CSS (gzipped):
  Global:            < 25KB
  Per-page:          < 10KB

Images (per page):
  Average:           < 100KB
  Max single:        < 200KB
```

---

## 🚀 Performance Optimization Strategy

### 1. Code Splitting (Next.js)
```javascript
// Automatic:
// - Each page is its own bundle
// - Components lazy-loaded by default

// Manual optimization:
import dynamic from 'next/dynamic'

const HeavyChart = dynamic(() => import('@/components/Chart'), {
  loading: () => <Skeleton height="300px" />,
  ssr: false // Don't render on server
})
```

### 2. Image Optimization
```javascript
import Image from 'next/image'

<Image
  src="/symptoms-icon.png"
  alt="Symptoms"
  width={64}
  height={64}
  priority={false}  // Lazy load by default
  placeholder="blur"  // Show placeholder while loading
/>
```

### 3. Font Optimization
```css
/* Use system fonts for better performance */
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;

/* Use font-display: swap for custom fonts */
@font-face {
  font-display: swap;  /* Don't block render */
}
```

### 4. CSS Optimization
```
- Tailwind CSS: Only ~30KB gzipped ✅
- Purging unused: Automatic in Next.js
- Critical CSS: Inlined by Next.js
- CSS-in-JS: Framer Motion CSS optimized
```

### 5. JavaScript Optimization
```
- Tree shaking: Enabled by default
- Module concatenation: Next.js optimized
- Dead code elimination: Automatic
- Minification: Enabled in production
```

### 6. Caching Strategy
```javascript
// Static assets (images, fonts):
// Cache-Control: public, max-age=31536000, immutable

// HTML pages:
// Cache-Control: public, max-age=0, must-revalidate

// API responses:
const { data } = useSWR('/api/data', {
  revalidateOnFocus: false,
  dedupingInterval: 60000
})
```

---

## 🔍 Performance Measurement

### Using Lighthouse
```bash
# Local testing
npm run build
npm start
# Then open Chrome DevTools > Lighthouse

# Or use CLI:
npm install -g @lhci/cli@0.11.0
lhci autorun
```

### Key Metrics to Track
```
FCP: First Contentful Paint
  - When first content appears
  - Target: < 1.8s
  - Measure: DevTools Performance tab

LCP: Largest Contentful Paint
  - When largest content appears
  - Target: < 2.5s
  - Measure: Web Vitals extension

CLS: Cumulative Layout Shift
  - Layout stability
  - Target: < 0.05
  - Measure: Web Vitals extension

INP: Interaction to Next Paint
  - Responsiveness to clicks
  - Target: < 200ms
  - Measure: Web Vitals extension
```

---

## 📱 Page Performance Breakdown

### Expected Load Times

#### Dashboard
```
Initial Load:       1.8-2.2s (LCP with image)
Interaction Ready:  2.5-3.0s (TTI)
Full Render:        3.0-3.5s
Lighthouse Score:   90+ (Performance)

Heavy Elements:
- Pregnancy ring visualization
- Status cards with animations
- Chart components
- Multiple images
```

#### Symptom Checker
```
Initial Load:       1.5-2.0s (LCP)
Interaction Ready:  2.0-2.5s (TTI)
Full Render:        2.5-3.0s
Lighthouse Score:   92+ (Performance)

Optimizations:
- Minimal images
- CSS-only icons
- No heavy libraries
- Lightweight animations
```

#### Result Page
```
Initial Load:       1.3-1.8s (LCP - mostly static)
Interaction Ready:  1.8-2.2s (TTI)
Full Render:        2.0-2.5s
Lighthouse Score:   94+ (Performance)

Reason: Mostly text content, no heavy images
```

#### Emergency Page
```
Initial Load:       1.6-2.1s (LCP with images)
Interaction Ready:  2.2-2.7s (TTI)
Full Render:        2.7-3.2s
Lighthouse Score:   91+ (Performance)

Important: 911 button must appear ASAP (< 1.5s)
```

#### Language Selection
```
Initial Load:       1.2-1.6s (LCP - minimal)
Interaction Ready:  1.6-2.0s (TTI)
Full Render:        1.8-2.2s
Lighthouse Score:   95+ (Performance)

Reason: Very minimal content, no images initially
```

---

## 🛠️ Optimization Techniques by Page

### Dashboard
```typescript
// Lazy load charts
const Dashboard = dynamic(() => import('@/pages/dashboard'), {
  loading: () => <Skeleton count={5} />,
  ssr: true  // SSR for first paint
})

// Pregnancy ring SVG optimized
<svg width="200" height="200" viewBox="0 0 200 200">
  {/* Use SVG instead of image for better perf */}
</svg>

// Pagination for many cards
const [page, setPage] = useState(0)
const cards = allCards.slice(page * 6, (page + 1) * 6)
```

### Symptom Checker
```typescript
// Pre-load animation components
import { SYMPTOM_OPTIONS } from '@/constants'

// Use CSS for animations (faster than JS)
.symptom-button:hover {
  transform: scale(1.05);  // GPU accelerated
  box-shadow: 0 10px 20px rgba(0,0,0,0.1);
}

// Virtual scrolling for long lists (if needed)
import { FixedSizeList } from 'react-window'
```

### Result Page
```typescript
// Pre-render static content
export const getStaticProps = async () => {
  return {
    props: { /* ... */ },
    revalidate: 86400  // Revalidate daily
  }
}

// Client-side transitions only
const result = JSON.parse(localStorage.getItem('result'))
```

### Emergency Page
```typescript
// 911 button appears immediately (critical)
<Button priority variant="danger" onClick={call911}>
  Call 911 / Emergency
</Button>

// Lazy load detailed resources
const [resourcesLoaded, setResourcesLoaded] = useState(false)
useEffect(() => {
  setTimeout(() => setResourcesLoaded(true), 2000)
}, [])
```

---

## 🎯 Performance Budget

### JavaScript Budget: 170KB gzipped total
```
React + React DOM + Next.js runtime:  ~60KB
Design System Components:             ~40KB
Pages (lazy loaded):                  ~30KB each
Framer Motion:                        ~20KB
Other libraries:                      ~20KB
App code:                             ~20KB
─────────────────────────────────────────
Total (reasonable):                   ~170KB
```

### CSS Budget: 50KB gzipped total
```
Tailwind CSS (purged):               ~25KB
Custom animations (globals.css):     ~10KB
Per-page styles (lazy):              ~5KB each
─────────────────────────────────────────
Total (initial):                     ~35KB

Added per page (lazy):               ~5-10KB
```

### Image Budget: 50KB per page average
```
Dashboard:    ~80KB (pregnancy ring, status icons)
Symptom:      ~20KB (emoji icons)
Result:       ~30KB (result visualizations)
Emergency:    ~100KB (emergency contacts, resources)
Language:     ~60KB (language flags/backgrounds)
```

---

## ✅ Optimization Checklist

### Code Quality
- [ ] ESLint passes (no warnings)
- [ ] TypeScript no errors
- [ ] No console warnings in production
- [ ] No memory leaks (Chrome DevTools)
- [ ] Proper error boundaries

### Bundle Analysis
- [ ] Check bundle size: `npm run analyze`
- [ ] No duplicate dependencies
- [ ] All unused code removed
- [ ] Tree shaking enabled
- [ ] Minification working

### Runtime Performance
- [ ] Lighthouse score > 90
- [ ] FCP < 2s at 4G
- [ ] LCP < 3s at 4G
- [ ] CLS < 0.05
- [ ] No jank in animations (60fps)

### Images
- [ ] All images compressed
- [ ] Using next/image component
- [ ] Responsive srcset
- [ ] Proper alt text
- [ ] WebP format where applicable

### Fonts
- [ ] System fonts or optimized custom fonts
- [ ] font-display: swap
- [ ] WOFF2 format
- [ ] Preload critical fonts
- [ ] Async loading for secondary fonts

### CSS
- [ ] Tailwind purging enabled
- [ ] No unused CSS
- [ ] Critical CSS inlined
- [ ] Media queries optimized
- [ ] Animations use GPU (transform/opacity)

### JavaScript
- [ ] Dynamic imports working
- [ ] Code splitting optimal
- [ ] No render-blocking scripts
- [ ] Event listeners cleaned up
- [ ] Debouncing for expensive operations

### Network
- [ ] Gzip compression enabled
- [ ] Browser caching configured
- [ ] HTTP/2 or HTTP/3
- [ ] CDN for static assets
- [ ] API endpoints optimized (< 500ms)

### Testing
- [ ] Lighthouse audit passing
- [ ] Web Vitals all green
- [ ] Performance on 4G throttling
- [ ] Performance on low-end device
- [ ] Accessibility audit passing

---

## 📈 Monitoring & Reporting

### Metrics to Track in Production
```typescript
// Use web-vitals library
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals'

getCLS(console.log)    // Layout shift
getFID(console.log)    // Interaction delay
getFCP(console.log)    // First paint
getLCP(console.log)    // Largest content
getTTFB(console.log)   // Server response time
```

### Analytics Integration
```typescript
// Send to analytics service
function sendMetric(name, value) {
  fetch('/api/metrics', {
    method: 'POST',
    body: JSON.stringify({ name, value })
  })
}

getLCP(metric => sendMetric('LCP', metric.value))
```

---

## 🎓 Performance Best Practices

### DO ✅
- Use Next.js image optimization
- Implement code splitting
- Use system fonts or optimized custom fonts
- Defer non-critical JavaScript
- Implement lazy loading
- Use CSS for animations
- Compress all assets
- Monitor Core Web Vitals
- Test on real 4G networks
- Profile with Chrome DevTools

### DON'T ❌
- Don't load large images directly
- Don't block rendering with render-blocking JS
- Don't use unoptimized external libraries
- Don't forget about mobile performance
- Don't ignore layout shifts
- Don't use HTML animations
- Don't load fonts synchronously
- Don't fetch all data at once
- Don't ignore Web Vitals
- Don't skip performance testing

---

## 🚀 Performance Victory Checklist

**ULTIMATE SUCCESS = All Green:**
```
✅ Lighthouse Performance: 95+/100
✅ Lighthouse Accessibility: 98+/100
✅ Core Web Vitals: All "Good"
✅ First Contentful Paint: < 1.8s
✅ Largest Contentful Paint: < 2.5s
✅ Cumulative Layout Shift: < 0.05
✅ Bundle Size: < 170KB JS, < 50KB CSS
✅ Mobile Performance: same as desktop
✅ Network 4G Throttling: Still acceptable
✅ Real Device Testing: Smooth 60fps
```

**PRODUCTION READY WHEN:**
- All Lighthouse scores > 92
- All Core Web Vitals < green threshold
- Real device testing on at least 3 phones
- Performance benchmarked on 4G
- No regressions in performance
- Monitoring and alerting configured
