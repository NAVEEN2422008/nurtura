# NURTURA Responsive Design & Performance Guide

## 📱 Viewport Breakpoints

### Mobile-First Breakpoints
```
XS:   0px - 374px   (small phones)
SM:  375px - 639px   (standard phones)
MD:  640px - 767px   (larger phones)
LG:  768px - 1023px  (tablets)
XL:  1024px - 1439px (small laptops)
2XL: 1440px+         (desktops)
```

## ✅ Responsive Design Checklist

### Mobile (375px)
- [ ] Single column layout on all pages
- [ ] Touch targets minimum 44px × 44px
- [ ] Navigation at bottom or collapsible top
- [ ] No horizontal scroll
- [ ] Font sizes readable (16px+ for body)
- [ ] Padding: 16px page margins
- [ ] Buttons full-width or large enough to tap
- [ ] Cards stack vertically
- [ ] Images scale properly
- [ ] Form inputs large enough for thumb input

### Tablet (768px)
- [ ] 2-column layouts where appropriate
- [ ] Increased padding: 24px page margins
- [ ] Cards displayed in grid (2 columns)
- [ ] Navigation sidebar optional or visible
- [ ] Modal dialogs centered and sized (80-90vw)
- [ ] Tables become readable
- [ ] All features visible without scrolling essential content

### Desktop (1440px)
- [ ] 3-column layouts where beneficial
- [ ] Max-width containers (1200px recommended)
- [ ] Full navigation visible
- [ ] Hover states active (shadows, color changes)
- [ ] Smooth animations at 60fps
- [ ] Cursor changes on interactive elements
- [ ] Tooltips visible on hover

---

## 🎨 Page-Specific Responsive Behaviors

### Dashboard (dashboard.tsx)
**Mobile (375px)**
- Smart Care Card: Full-width
- Pregnancy Ring: Large circular display
- Status Summary: Stacked cards
- Quick Actions: 2 columns

**Tablet (768px)**
- Side-by-side cards (50/50 split)
- Quick Actions: 3 columns

**Desktop (1440px)**
- Greeting + Pregnancy Ring (left)
- Status Summary (right)
- Quick Actions: 4+ columns
- Charts: Large and detailed

---

### Symptom Checker (symptom-checker.tsx)
**Mobile (375px)**
- Symptoms: 2 columns × 5 rows
- Duration: Full-width buttons stacked
- Severity: 5-star scale single row
- Progress bar below sticky header

**Tablet (768px)**
- Symptoms: 3 columns
- Duration: 2 columns
- Severity: Horizontal scale

**Desktop (1440px)**
- Symptoms: 4 columns
- Duration: 4 columns
- Severity: 5 columns
- Progress bar with percentage

---

### Emergency Page (emergency.tsx)
**Mobile (375px)**
- 911 button: Full-width, 60px height
- Emergency Contacts: Stacked, full-width
- Symptoms Checklist: Single column
- Resources: Collapsed view with expandable sections

**Tablet (768px)**
- 911 button: Left half or top area
- Contacts: 2 columns
- Resources: 2-column grid

**Desktop (1440px)**
- Full layout with 1200px max-width
- Contacts: 3 columns
- Resources: 2 columns with descriptions
- Sidebar quick reference

---

### Language Selection (language.tsx)
**Mobile (375px)**
- Cards: Full-width
- Flags: Large (60px)
- Text: Centered, full-width buttons
- All clickable areas ≥ 44px

**Tablet (768px)**
- Cards: Still full-width but centered
- Better spacing between options

**Desktop (1440px)**
- Cards: Max 600px width, centered
- Horizontal layout option
- All options visible at once

---

## 🚀 Performance Benchmarks

### Target Metrics
```
FCP (First Contentful Paint):  < 1.8s (target < 3s)
LCP (Largest Contentful Paint): < 2.5s (target < 4s)
CLS (Cumulative Layout Shift):  < 0.05 (target < 0.1)
TTI (Time to Interactive):      < 3.5s
FID (First Input Delay):        < 100ms
```

### Bundle Size Targets
```
Initial JS:        < 150KB (gzipped)
CSS:              < 30KB  (gzipped)
Images:           < 50KB  (per page average)
Fonts:            < 20KB
```

### Page Load Times (Lighthouse)
```
Dashboard:        2-2.5s  (LCP)
Symptom Checker:  1.8-2.2s (LCP)
Result:          1.5-2.0s (LCP) - mostly static
Emergency:       1.6-2.1s (LCP)
Language Select: 1.2-1.8s (LCP) - minimal content
```

---

## 🧪 Testing Instructions

### 1. Chrome DevTools - Device Simulation
```
1. Open Chrome DevTools (F12)
2. Click Device Toolbar (Ctrl+Shift+M)
3. Test viewports:
   - iPhone SE (375px)
   - iPad (768px)
   - iPad Pro (1024px)
   - 1440p Desktop
4. Check Network tab (Slow 4G)
5. Check Performance tab (Lighthouse)
```

### 2. Lighthouse Audit
```
1. DevTools > Lighthouse
2. Generate report for each page:
   - Mobile report
   - Desktop report
3. Check scores: Performance, Accessibility, Best Practices, SEO
4. Investigate red/yellow items
5. Record FCP, LCP, CLS values
```

### 3. Responsive Behavior Testing
```
1. For each page at each breakpoint:
   - Check text readability
   - Check button sizes
   - Check image scaling
   - Check card layout
   - Check no horizontal scroll
   - Check navigation accessible
   - Verify touch targets ≥ 44px
   
2. Test animations:
   - Page entrance smooth?
   - Hover effects working?
   - Loading states visible?
   - No jank at 60fps?
```

### 4. Real Device Testing
```
Mobile phones to test:
- iPhone 12/13/14 (375px width)
- iPhone 15 Pro Max (430px width)
- Samsung Galaxy (360-412px)
- OnePlus (412px+)

Tablets:
- iPad 10.2" (768px)
- iPad Pro 12.9" (1024px)

Test on:
- WiFi (good connection)
- 4G LTE (slower connection)
- Airplane mode → WiFi recovery
```

---

## 📊 What to Check at Each Breakpoint

### CSS Media Query Usage
```css
/* Mobile first - no media query */
.card { width: 100%; }

/* Tablet and up */
@media (min-width: 768px) {
  .card { width: calc(50% - 12px); }
}

/* Desktop and up */
@media (min-width: 1440px) {
  .card { width: calc(33.333% - 12px); }
}
```

### Images Responsive Check
```html
<!-- Should work at all sizes -->
<img 
  src="..." 
  alt="..."
  className="w-full h-auto max-w-full"
/>

<!-- Or use next/image -->
<Image 
  src="..." 
  alt="..."
  fill
  className="object-cover"
/>
```

### Font Size Readability
```
Mobile:   16px body (minimum)
Tablet:   16-18px body
Desktop:  18px body

Headings:
Mobile:   24px
Tablet:   28px
Desktop:  32px+
```

### Touch Target Sizes
```
Minimum: 44px × 44px
Preferred: 48px × 48px
Spacing between: 8-16px minimum
```

---

## 🔍 Common Responsive Issues to Avoid

❌ **DO NOT:**
- Hard-code pixel widths (use percentages, max-width)
- Make touch targets < 44px
- Use fixed widths for images
- Create horizontal scroll
- Ignore tablet breakpoint
- Use absolute positioning for layout
- Forget `meta viewport` tag
- Set `font-size` using px only (use rem)

✅ **DO:**
- Use `max-w-` Tailwind utilities
- Use responsive grid (`grid-cols-1 md:grid-cols-2`)
- Use `w-full` on mobile content
- Test at actual breakpoints
- Use `flex` and `gap` for spacing
- Use relative units (rem, em, %)
- Update meta viewport: `<meta name="viewport" content="width=device-width, initial-scale=1">`

---

## 📋 Final Validation Checklist

### Every Page Should Have:
- [ ] Single column at 375px
- [ ] Readable text at all sizes
- [ ] No horizontal scroll
- [ ] Touch targets ≥ 44px
- [ ] Images scale properly
- [ ] Navigation accessible
- [ ] Forms usable on mobile
- [ ] Animations smooth
- [ ] Performance > 85 Lighthouse
- [ ] Accessibility > 90 Lighthouse

### Before Production:
- [ ] Test all 8 pages at 375px, 768px, 1440px
- [ ] Run Lighthouse on each (mobile + desktop)
- [ ] Test on real devices
- [ ] Check network throttling (Slow 4G)
- [ ] Verify all features work on mobile
- [ ] Check print styles (if applicable)
- [ ] Test form inputs with mobile keyboard
- [ ] Verify video/media responsiveness

---

## 🎯 Success Criteria

**RESPONSIVE DESIGN COMPLETE WHEN:**
- ✅ All pages render properly at 375px, 768px, 1440px
- ✅ No layout breaks at any breakpoint
- ✅ Touch targets all ≥ 44px on mobile
- ✅ Performance scores > 85 (Lighthouse)
- ✅ FCP < 2s, LCP < 3s, CLS < 0.05
- ✅ All forms usable on mobile keyboard
- ✅ Verified on 3+ physical devices

**PRODUCTION READY WHEN:**
- ✅ All Lighthouse scores > 90
- ✅ All pages accessible (WCAG 2.1 AA)
- ✅ All images optimized
- ✅ All animations smooth at 60fps
- ✅ Core Web Vitals all "Good" status
- ✅ Mobile and desktop identical functionality
