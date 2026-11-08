import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

let matchMediaInstance: gsap.MatchMedia | null = null;

export function initAnimations() {
  if (typeof window === "undefined") {
    return;
  }

  // Register ScrollTrigger plugin
  gsap.registerPlugin(ScrollTrigger);

  // Clean up any existing instances from prior page loads
  if (matchMediaInstance) {
    matchMediaInstance.revert();
  }

  matchMediaInstance = gsap.matchMedia();

  matchMediaInstance.add(
    {
      isDesktop: "(min-width: 768px)",
      isMobile: "(max-width: 767px)",
      reduceMotion: "(prefers-reduced-motion: reduce)",
    },
    (context) => {
      const { reduceMotion } = context.conditions as {
        isDesktop: boolean;
        isMobile: boolean;
        reduceMotion: boolean;
      };

      if (reduceMotion) {
        // Users who prefer reduced motion: ensure all elements are immediately visible without motion
        gsap.set(
          [
            ".animate-hero-badge",
            ".animate-hero-title",
            ".animate-hero-desc",
            ".animate-hero-cta",
            ".animate-hero-snippet",
            ".reveal-on-scroll",
          ],
          { autoAlpha: 1, y: 0 }
        );
        return;
      }

      // --- 1. Hero Entrance Timeline ---
      const heroTimeline = gsap.timeline({
        defaults: {
          duration: 0.8,
          ease: "power2.out",
        },
      });

      heroTimeline
        .from(".animate-hero-badge", {
          autoAlpha: 0,
          delay: 0.1,
          duration: 0.6,
          y: -15,
        })
        .from(
          ".animate-hero-title",
          {
            autoAlpha: 0,
            duration: 0.9,
            y: 25,
          },
          "-=0.4"
        )
        .from(
          ".animate-hero-desc",
          {
            autoAlpha: 0,
            duration: 0.7,
            y: 20,
          },
          "-=0.6"
        )
        .from(
          ".animate-hero-cta",
          {
            autoAlpha: 0,
            duration: 0.6,
            stagger: 0.1,
            y: 15,
          },
          "-=0.5"
        )
        .from(
          ".animate-hero-snippet",
          {
            autoAlpha: 0,
            duration: 0.7,
            y: 20,
          },
          "-=0.4"
        );

      // --- 2. ScrollTrigger Section Entrances ---
      const scrollSections =
        document.querySelectorAll<HTMLElement>(".reveal-section");

      for (const section of scrollSections) {
        const header = section.querySelector(".reveal-header");
        const cards = section.querySelectorAll(".reveal-card");

        if (header) {
          gsap.from(header, {
            autoAlpha: 0,
            duration: 0.8,
            ease: "power2.out",
            scrollTrigger: {
              start: "top 82%",
              toggleActions: "play none none none",
              trigger: section,
            },
            y: 30,
          });
        }

        if (cards.length > 0) {
          gsap.from(cards, {
            autoAlpha: 0,
            duration: 0.75,
            ease: "power2.out",
            scrollTrigger: {
              start: "top 85%",
              toggleActions: "play none none none",
              trigger: cards[0],
            },
            stagger: 0.1,
            y: 35,
          });
        }
      }

      // --- 3. Individual Reveal-on-scroll elements ---
      const singleReveals = document.querySelectorAll<HTMLElement>(
        ".reveal-on-scroll:not(.reveal-card):not(.reveal-header)"
      );

      for (const element of singleReveals) {
        gsap.from(element, {
          autoAlpha: 0,
          duration: 0.7,
          ease: "power2.out",
          scrollTrigger: {
            start: "top 85%",
            toggleActions: "play none none none",
            trigger: element,
          },
          y: 30,
        });
      }

      // --- 4. Floating Header Auto-Hide / Dynamic Blur on Scroll ---
      const headerEl = document.querySelector<HTMLElement>("#main-header");
      if (headerEl) {
        ScrollTrigger.create({
          onUpdate: (self) => {
            if (self.direction === 1 && self.scroll() > 200) {
              // Scrolling down
              gsap.to(headerEl, {
                autoAlpha: 0,
                duration: 0.3,
                ease: "power2.out",
                y: -90,
              });
            } else {
              // Scrolling up or near top
              gsap.to(headerEl, {
                autoAlpha: 1,
                duration: 0.35,
                ease: "power2.out",
                y: 0,
              });
            }
          },
          start: "top -50",
        });
      }
    }
  );
}

export function cleanupAnimations() {
  if (matchMediaInstance) {
    matchMediaInstance.revert();
    matchMediaInstance = null;
  }
}
