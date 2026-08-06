# GSAP.md

# Animation System

> The official animation guidelines for the portfolio.

Animations should enhance storytelling, reinforce hierarchy, and make interactions feel polished. They should never distract from the content or exist solely for visual flair.

---

# Philosophy

Motion is part of the user experience.

Every animation should answer at least one of these questions:

* What deserves attention?
* What changed?
* What is loading?
* What just happened?
* Where should the user look next?

If an animation doesn't improve the experience, remove it.

---

# Principles

## Purpose over spectacle

Animations should communicate.

Avoid animations that exist only because they look cool.

---

## Fast and responsive

The interface should always feel responsive.

Animations should never make the UI feel slower.

---

## Consistency

Motion should feel like one design language across the entire portfolio.

Every page should feel connected.

---

## Performance

Prefer GPU-accelerated animations.

Avoid expensive layout calculations during animations.

---

## Accessibility

Respect user preferences.

Always support:

* `prefers-reduced-motion`
* Keyboard navigation
* Screen readers

Users who disable animations should still have a complete experience.

---

# Animation Library

The project uses:

* GSAP

Do not introduce:

* Framer Motion
* Motion One
* Anime.js

All animations should be implemented using GSAP.

---

# Core Motion Language

The portfolio should feel:

* Smooth
* Confident
* Intentional
* Lightweight
* Premium

Avoid:

* Bouncy interfaces
* Cartoon-like motion
* Excessive rotation
* Constant looping animations
* Flashy transitions

---

# Animation Categories

## Page Load

Purpose:

Introduce the page naturally.

Examples:

* Hero reveal
* Navigation fade
* Heading reveal
* Content stagger

---

## Scroll Animations

Purpose:

Guide the reading experience.

Examples:

* Fade in
* Slide up
* Scale slightly
* Image reveal
* Text reveal

Scroll animations should support the content, not overwhelm it.

---

## Hover States

Purpose:

Provide interaction feedback.

Examples:

* Button elevation
* Card lift
* Image zoom
* Icon movement

Hover effects should remain subtle.

---

## Navigation

Purpose:

Provide orientation.

Examples:

* Mobile menu
* Active navigation indicator
* Navigation underline
* Theme switch transition

---

## Page Transitions

Purpose:

Connect pages naturally.

Transitions should feel smooth without delaying navigation.

---

## Content Updates

Purpose:

Show change.

Examples:

* Filtering projects
* Reordering sections
* Expanding content
* Loading new media

---

# Preferred GSAP Features

Use where appropriate:

* Timeline
* ScrollTrigger
* SplitText (licensed or alternative implementation if available)
* MatchMedia
* Context
* QuickSetter
* QuickTo

Avoid unnecessary plugins.

---

# ScrollTrigger Guidelines

Use ScrollTrigger to:

* Reveal content
* Pin sections when it improves storytelling
* Create subtle parallax
* Animate progress

Avoid creating long "scroll-jacking" experiences.

Users should always feel in control.

---

# Timelines

Prefer timelines over isolated animations.

Example flow:

```text
Hero
↓

Title

↓

Description

↓

Actions

↓

Background
```

Timelines create smoother, coordinated animations and are easier to maintain.

---

# Text Animations

Text animations should improve readability.

Good:

* Fade
* Stagger
* Word reveal
* Line reveal

Avoid:

* Constant scrambling
* Excessive character effects
* Long typing animations
* Distracting distortions

Typography should remain readable throughout the animation.

---

# Image Animations

Preferred effects:

* Reveal
* Mask
* Subtle scale
* Fade
* Parallax

Avoid:

* Spinning
* Flipping
* Excessive blur
* Random movement

---

# Cards

Cards may:

* Fade
* Lift slightly
* Scale subtly
* Reveal progressively

Cards should not bounce or wobble.

---

# Buttons

Buttons should communicate interactivity.

Preferred:

* Slight elevation
* Soft scaling
* Background transition
* Icon movement

Avoid dramatic hover effects.

---

# Easing

Prefer smooth, natural easing.

Avoid:

* Abrupt starts
* Abrupt stops
* Overly elastic motion

Motion should feel refined and intentional.

---

# Duration

General guidance:

* Micro interactions: very fast
* Hover interactions: fast
* Page transitions: moderate
* Hero animations: moderate
* Large storytelling sequences: deliberate, but never slow

Animations should never make users wait.

---

# Stagger

Use stagger to improve rhythm.

Good uses:

* Navigation links
* Cards
* Gallery items
* Feature lists
* Timeline items

Avoid excessive delays between elements.

---

# Cleanup

Every animation must clean up correctly.

Use GSAP Context within React components.

Destroy:

* ScrollTriggers
* Timelines
* Event listeners

Avoid memory leaks.

---

# Responsive Motion

Animations should adapt to different screen sizes.

Desktop and mobile should not necessarily share identical animation behavior.

Optimize for available space and input method.

---

# Performance Rules

Prefer animating:

* transform
* opacity

Avoid animating:

* width
* height
* top
* left

Minimize layout recalculations.

---

# Reduced Motion

If `prefers-reduced-motion` is enabled:

* Remove decorative animations.
* Keep essential state transitions.
* Preserve usability.

Accessibility takes priority over aesthetics.

---

# Project Pages

Animations should support storytelling.

Examples:

* Hero introduction
* Progressive section reveals
* Gallery transitions
* Metrics counters
* Next Project transition

Each animation should reinforce the narrative of the project.

---

# Studio

Studio should use restrained motion.

Animations should improve productivity rather than draw attention.

Examples:

* Modal transitions
* Drawer animations
* Toast notifications
* Drag-and-drop feedback
* Loading states

---

# Debugging

During development:

* Test on slower devices.
* Test different viewport sizes.
* Verify cleanup.
* Check animation performance.
* Ensure interactions remain responsive.

---

# Future Motion

Potential future additions:

* View Transitions API integration
* Advanced page transitions
* SVG path animations
* Interactive storytelling
* 3D transforms where appropriate

Future enhancements should extend the existing motion language rather than replacing it.

---

# Animation Checklist

Before shipping an animation:

* Has a clear purpose
* Improves usability
* Matches the portfolio's motion language
* Performs well
* Cleans up correctly
* Works across devices
* Respects reduced motion
* Feels subtle and polished

If any item fails this checklist, revise or remove the animation.
