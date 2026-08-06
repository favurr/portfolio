import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export const createScrollTriggerTimeline = (
  trigger: string | HTMLElement,
  vars?: gsap.plugins.ScrollTriggerStaticVars
) => {
  return gsap.timeline({
    scrollTrigger: {
      trigger,
      start: "top bottom-=100px",
      toggleActions: "play none none reverse",
      ...vars,
    },
  });
};

export const animateStaggeredReveal = (
  elements: string | HTMLElement[],
  timeline?: gsap.core.Timeline
) => {
  const targetTimeline = timeline || gsap.timeline();
  return targetTimeline.from(elements, {
    opacity: 0,
    y: 24,
    duration: 0.6,
    stagger: 0.08,
    ease: "power2.out",
  });
};
