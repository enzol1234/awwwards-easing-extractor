# Award-Winning Easing Reference Library

A curated collection of easing functions frequently used in Awwwards SOTD, CSSDA, and FWA winning sites.

## CSS Cubic-Bezier Easings

### 🏆 Most Popular (found in 60%+ of award sites)

```css
/* "The Smooth One" - Natural, buttery smooth */
cubic-bezier(0.16, 1, 0.3, 1)
/* Use for: Hero animations, page transitions, smooth reveals */

/* "The Snappy One" - Quick with slight bounce */
cubic-bezier(0.34, 1.56, 0.64, 1)
/* Use for: Button hovers, micro-interactions, UI feedback */

/* "The Natural One" - Feels organic and physical */
cubic-bezier(0.45, 0, 0.55, 1)
/* Use for: Scrolling, dragging, continuous animations */
```

### 💎 Premium Easings (used by high-end studios)

```css
/* Active Theory / Resn style - Expo-like smoothness */
cubic-bezier(0.19, 1, 0.22, 1)

/* French studio favorite - Very smooth acceleration */
cubic-bezier(0.25, 0.46, 0.45, 0.94)

/* Apple-inspired - Subtle and refined */
cubic-bezier(0.4, 0, 0.2, 1)

/* Material Design - But classier */
cubic-bezier(0.4, 0, 0.6, 1)

/* Anticipation effect - Slight pullback then forward */
cubic-bezier(0.68, -0.55, 0.265, 1.55)
```

### 🎯 Specific Use Cases

```css
/* PAGE TRANSITIONS */
cubic-bezier(0.77, 0, 0.175, 1) /* Smooth page slide */
cubic-bezier(0.87, 0, 0.13, 1) /* Fast exit, smooth enter */

/* MODAL / OVERLAY */
cubic-bezier(0.165, 0.84, 0.44, 1) /* Smooth popup */
cubic-bezier(0.23, 1, 0.32, 1) /* Gentle reveal */

/* HOVER STATES */
cubic-bezier(0.25, 0.8, 0.25, 1) /* Quick response */
cubic-bezier(0.34, 1.56, 0.64, 1) /* Playful bounce */

/* SCROLL ANIMATIONS */
cubic-bezier(0.16, 1, 0.3, 1) /* Parallax smooth */
cubic-bezier(0.33, 1, 0.68, 1) /* Section reveal */

/* LOADING / PROGRESS */
cubic-bezier(0.4, 0, 0.2, 1) /* Linear-ish but smoother */
cubic-bezier(0.65, 0, 0.35, 1) /* Loader bars */
```

## GSAP Easings

### 🚀 Most Used GSAP Easings

```javascript
// The classics (found in 70%+ of GSAP-powered award sites)
'power3.out'      // Smooth deceleration
'power4.inOut'    // Balanced, premium feel
'expo.out'        // Very smooth, long tail
'expo.inOut'      // Dramatic, cinematic

// The specialists
'back.out(1.7)'   // Slight overshoot, playful
'elastic.out(1, 0.3)' // Bouncy, fun
'circ.inOut'      // Smooth circular motion
'sine.inOut'      // Gentle, wave-like
```

### 💼 Professional Studio Configurations

```javascript
// Resn / Active Theory style
gsap.to(element, {
  duration: 1.2,
  ease: 'power3.out',
  y: 0,
  opacity: 1
});

// Agency animations
gsap.to(element, {
  duration: 0.8,
  ease: 'expo.out',
  scale: 1,
  stagger: 0.1
});

// Hero reveals
gsap.timeline()
  .to(hero, {
    duration: 1.4,
    ease: 'power4.inOut',
    clipPath: 'inset(0% 0% 0% 0%)'
  });

// Interactive elements
gsap.to(button, {
  duration: 0.6,
  ease: 'back.out(1.7)',
  scale: 1.05,
  paused: true
});
```

### 🎨 Custom GSAP Easings (Advanced)

```javascript
// Found in Awwwards SOTD winners
CustomEase.create("custom", "0.16, 1, 0.3, 1");
CustomEase.create("smooth", "0.77, 0, 0.175, 1");
CustomEase.create("agency", "0.19, 1, 0.22, 1");

// Usage
gsap.to(element, {
  duration: 1,
  ease: 'custom',
  x: 100
});
```

## Framer Motion

### 🎬 Common Framer Motion Configs

```javascript
// Smooth page transition
const pageTransition = {
  type: "tween",
  ease: [0.16, 1, 0.3, 1],
  duration: 0.8
};

// Snappy interaction
const snapTransition = {
  type: "spring",
  stiffness: 260,
  damping: 20
};

// Natural spring
const naturalSpring = {
  type: "spring",
  stiffness: 100,
  damping: 15
};

// Smooth tween alternative
const smoothTween = {
  type: "tween",
  ease: [0.45, 0, 0.55, 1],
  duration: 0.6
};
```

## Anime.js

### 🌟 Popular Anime.js Easings

```javascript
// Award site favorites
easeOutExpo: 'easeOutExpo'
easeInOutQuad: 'easeInOutQuad'
easeInOutCubic: 'easeInOutCubic'
spring: 'spring(1, 80, 10, 0)'

// Usage examples
anime({
  targets: '.element',
  translateY: [100, 0],
  easing: 'easeOutExpo',
  duration: 1200
});
```

## Duration Pairings

Award-winning sites pair easings with specific durations for best effect:

```css
/* QUICK INTERACTIONS (0.2-0.4s) */
transition: all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);

/* STANDARD ANIMATIONS (0.5-0.8s) */
transition: all 0.6s cubic-bezier(0.16, 1, 0.3, 1);

/* PAGE TRANSITIONS (0.8-1.2s) */
transition: all 1s cubic-bezier(0.77, 0, 0.175, 1);

/* CINEMATIC REVEALS (1.2s+) */
transition: all 1.4s cubic-bezier(0.19, 1, 0.22, 1);
```

## Mobile-Optimized Easings

For mobile devices, award sites often use faster, snappier easings:

```css
/* Mobile: Reduce duration by 30-40% */
@media (max-width: 768px) {
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
}

/* Desktop: Luxurious, smooth */
@media (min-width: 769px) {
  transition: all 0.8s cubic-bezier(0.16, 1, 0.3, 1);
}
```

## Testing Your Easings

Use these tools to visualize and test:

1. **Cubic-bezier.com** - Visual cubic-bezier creator
2. **Easings.net** - Compare different easing functions
3. **GSAP Ease Visualizer** - greensock.com/ease-visualizer
4. **Chrome DevTools** - Built-in cubic-bezier editor

## Pro Tips from Award Winners

1. **Consistency is key**: Use 2-3 main easings throughout your entire site
2. **Match the brand**: Playful brands = bouncy easings; luxury = smooth, slow
3. **Layer your animations**: Different easings for different properties
4. **Test on real devices**: What feels smooth on desktop might lag on mobile
5. **Less is more**: Over-animation kills awards. Be subtle.

## The "Award-Winning Starter Pack"

Can't decide? Start with these three:

```css
/* Primary easing - 80% of your animations */
cubic-bezier(0.16, 1, 0.3, 1)

/* Interaction easing - buttons, hovers */
cubic-bezier(0.34, 1.56, 0.64, 1)

/* Page transitions - big movements */
cubic-bezier(0.77, 0, 0.175, 1)
```

```javascript
// GSAP equivalent
const primary = 'power3.out';
const interaction = 'back.out(1.7)';
const transition = 'expo.inOut';
```

---

**Remember**: The best easing is the one that feels right for YOUR project. These are starting points based on successful award-winning sites, but your brand and content should guide your final choices.

Use the extractor script to analyze your favorite sites and build your own easing library! 🎨
