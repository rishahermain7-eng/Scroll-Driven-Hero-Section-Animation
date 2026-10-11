

import { useEffect, useRef, useState } from "react";

import gsap from "gsap";

import { ScrollTrigger } from "gsap/ScrollTrigger";

import {

  ArrowDown,

  ArrowLeft,

  ArrowRight,

  ArrowUpRight,

  Play,

} from "lucide-react";

gsap.registerPlugin(ScrollTrigger);

const gallery = [

  { image: "/gallery-front.png", label: "FRONT", number: "01" },

  { image: "/front-detail.png", label: "FRONT DETAIL", number: "02" },

  { image: "/gallery-wheel.png", label: "WHEEL DETAIL", number: "03" },

  { image: "/rear-detail.png", label: "REAR DETAIL", number: "04" },

  { image: "/rear-view.png", label: "REAR VIEW", number: "05" },

  { image: "/gallery-rear.png", label: "REAR PROFILE", number: "06" },

];

const specs = [

  { value: "3.2s", label: "0–100 KM/H" },

  { value: "4.0L", label: "ENGINE CAPACITY" },

  { value: "520", label: "PS POWER" },

];

// Visual placeholders for the hero brief; replace with verified project metrics if available.
const heroMetrics = [
  { value: "98%", label: "DESIGN PRECISION" },
  { value: "100%", label: "PURE PERFORMANCE" },
  { value: "95%", label: "AERODYNAMIC FOCUS" },
];

export default function App() {

  const heroRef = useRef(null);

  const carRef = useRef(null);

  const galleryRef = useRef(null);
  const finalMotionRef = useRef(null);

  const [galleryIndex, setGalleryIndex] = useState(null);

  useEffect(() => {

    const ctx = gsap.context(() => {

      gsap.from(".nav-item", {

        y: -14,

        opacity: 0,

        duration: 0.8,

        stagger: 0.1,

        ease: "power3.out",

      });

      gsap.from(".hero-copy > *", {

        y: 26,

        opacity: 0,

        duration: 0.9,

        stagger: 0.13,

        delay: 0.15,

        ease: "power3.out",

      });

      gsap.from(".hero-car", {

        x: 45,

        opacity: 0,

        duration: 1.15,

        delay: 0.2,

        ease: "power3.out",

      });

      // Hero image transforms are controlled by the single scroll-driven timeline below.

      // Reveal sections while scrolling

      gsap.utils.toArray(".reveal").forEach((element) => {

        gsap.from(element, {

          y: 32,

          opacity: 0,

          duration: 0.85,

          ease: "power3.out",

          scrollTrigger: {

            trigger: element,

            start: "top 84%",

            toggleActions: "play none none reverse",

          },

        });

      });

      gsap.from("#performance .spec-item", {

        y: 22,

        opacity: 0,

        duration: 0.7,

        stagger: 0.15,

        ease: "power2.out",

        scrollTrigger: {

          trigger: "#performance",

          start: "top 70%",

          toggleActions: "play none none reverse",

        },

      });

    });

    return () => ctx.revert();

  }, []);

  // Scroll-driven cinematic hero sequence: image changes are tied to scroll progress, never autoplay.
  useEffect(() => {
    const section = heroRef.current;
    const stage = section?.querySelector(".hero-cinematic-stage");
    if (!section || !stage) return;

    const images = Array.from(stage.querySelectorAll(".cinematic-image"));
    const caption = stage.querySelector(".cinematic-caption");
    const labels = [
      "01 / THE REVEAL",
      "02 / FRONT DETAIL",
      "03 / FRONT PROFILE",
      "04 / REAR DETAIL",
      "05 / REAR VIEW",
    ];
    if (images.length !== labels.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const ctx = gsap.context(() => {
      gsap.set(images, { autoAlpha: 0, x: 0, scale: 1, force3D: true });
      gsap.set(images[0], { autoAlpha: 1, x: 0, scale: 0.96 });

      if (reducedMotion) {
        // Keep the first image static for visitors who request reduced motion.
        if (caption) caption.textContent = labels[0];
        return;
      }

      const timeline = gsap.timeline({
        defaults: { ease: "power2.inOut" },
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1,
          invalidateOnRefresh: true,
        },
        onUpdate: () => {
          if (!caption) return;
          const index = Math.min(labels.length - 1, Math.floor(timeline.progress() * labels.length));
          caption.textContent = labels[index];
        },
      });

      // Each scroll segment gently hands off to the next image. No repeat/autoplay.
      timeline.to(images[0], { x: -12, scale: 1.02, duration: 0.7 });
      for (let index = 1; index < images.length; index += 1) {
        timeline.fromTo(
          images[index],
          { autoAlpha: 0, x: index % 2 ? 24 : -24, scale: 1.055 },
          { autoAlpha: 1, x: 0, scale: 1, duration: 0.75 },
          ">-0.08"
        );
        timeline.to(
          images[index - 1],
          { autoAlpha: 0, scale: 1.025, duration: 0.62 },
          "<"
        );
        // Leave a little scroll distance to appreciate each view.
        timeline.to({}, { duration: 0.35 });
      }
    }, section);

    return () => ctx.revert();
  }, []);

  // A calm, scroll-triggered final reveal: the car enters, stops in-frame, then copy glides in.
  useEffect(() => {
    if (!finalMotionRef.current) return;

    const section = finalMotionRef.current;
    const car = section.querySelector(".final-motion-car");
    const copy = section.querySelector(".final-motion-copy");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const ctx = gsap.context(() => {
      if (reducedMotion) {
        gsap.set(car, { x: 0, autoAlpha: 1 });
        gsap.set(copy, { x: 0, autoAlpha: 1 });
        return;
      }

      gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top 82%",
          once: true,
        },
        defaults: { ease: "power3.out" },
      })
        .to(car, {
          x: () => {
            const isMobile = window.matchMedia("(max-width: 639px)").matches;
            const carWidth = car.getBoundingClientRect().width;
            return isMobile
              ? Math.max(12, section.clientWidth * 0.38)
              : Math.max(12, section.clientWidth - carWidth - section.clientWidth * 0.04);
          },
          autoAlpha: 1,
          duration: 2.15,
        })
        .to(copy, { x: 8, autoAlpha: 1, duration: 0.8 }, "-=0.95");
    }, section);

    return () => ctx.revert();
  }, []);

  // Keyboard controls for the enlarged gallery

  useEffect(() => {

    if (galleryIndex === null) return;

    const handleKeyDown = (event) => {

      if (event.key === "Escape") {

        setGalleryIndex(null);

      }

      if (event.key === "ArrowLeft") {

        setGalleryIndex(

          (current) => (current - 1 + gallery.length) % gallery.length

        );

      }

      if (event.key === "ArrowRight") {

        setGalleryIndex(

          (current) => (current + 1) % gallery.length

        );

      }

    };

    document.addEventListener("keydown", handleKeyDown);

    document.body.style.overflow = "hidden";

    return () => {

      document.removeEventListener("keydown", handleKeyDown);

      document.body.style.overflow = "";

    };

  }, [galleryIndex]);

  const scrollGallery = (direction) => {

    if (!galleryRef.current) return;

    galleryRef.current.scrollBy({

      left: direction * 230,

      behavior: "smooth",

    });

  };

  const showPreviousImage = (event) => {

    event.stopPropagation();

    setGalleryIndex(

      (current) => (current - 1 + gallery.length) % gallery.length

    );

  };

  const showNextImage = (event) => {

    event.stopPropagation();

    setGalleryIndex(

      (current) => (current + 1) % gallery.length

    );

  };

  return (

    <main className="min-h-screen overflow-x-clip bg-[#090a0b] text-white">

      {/* HERO SECTION */}

      <section

        id="top"

        ref={heroRef}

        className="relative min-h-[300svh] md:min-h-[360vh]"

      >

        <div className="sticky top-0 flex h-[100svh] min-h-[560px] flex-col overflow-hidden px-4 py-3 sm:px-7 sm:py-4 md:px-10 md:py-5 lg:px-[5.7%]">

          <div className="pointer-events-none absolute inset-0">

            <div className="absolute right-0 top-[25%] h-72 w-72 rounded-full bg-white/[0.035] blur-[110px]" />

            <div className="absolute bottom-10 left-[25%] h-52 w-52 rounded-full bg-[#dfff00]/[0.025] blur-[100px]" />

          </div>

          {/* NAVIGATION */}

          <nav className="relative z-20 flex shrink-0 items-center justify-between border-b border-white/15 pb-3 sm:pb-4">

            <a

              href="#top"

              className="nav-item text-xl font-bold tracking-[0.17em]"

            >

              FIZZ<span className="text-[#dfff00]">.</span>

            </a>

            <div className="nav-item hidden items-center gap-8 text-[11px] text-white/65 md:flex">

              <a href="#performance" className="transition hover:text-white">

                Models

              </a>

              <a href="#performance" className="transition hover:text-white">

                Performance

              </a>

              <a href="#design" className="transition hover:text-white">

                About

              </a>

            </div>

            <a

              href="#gallery"

              className="nav-item inline-flex items-center gap-2 border border-white/30 px-4 py-3 text-[9px] tracking-[0.15em] transition hover:border-[#dfff00] hover:bg-[#dfff00] hover:text-black sm:px-5"

            >

              DISCOVER <ArrowUpRight size={13} />

            </a>

          </nav>

          {/* HERO CONTENT — headline and metrics stay above the fold */}
          <div className="relative z-10 grid min-h-0 flex-1 grid-cols-1 items-center gap-0 md:grid-cols-[0.82fr_1.18fr] md:gap-4">
            <div className="hero-copy relative z-20 order-1 pt-3 md:pt-0">
              <p className="mb-2 text-[8px] tracking-[0.32em] text-[#dfff00] sm:mb-3 sm:text-[10px]">
                THE ART OF PERFORMANCE
              </p>
              <h1 className="text-[clamp(2rem,5.1vw,4.8rem)] font-semibold leading-[0.98] tracking-[0.12em] sm:tracking-[0.16em]">
                WELCOME
                <br />
                <span className="text-white/65">ITZ FIZZ</span>
              </h1>
              <p className="mt-3 max-w-sm text-[10px] leading-5 text-white/55 sm:mt-4 sm:text-sm sm:leading-6">
                Precision in every curve. Power in every detail. A bold new perspective on automotive design.
              </p>
              <a
                href="#performance"
                className="mt-4 inline-flex items-center gap-3 bg-white px-4 py-3 text-[8px] font-bold tracking-[0.2em] text-black transition hover:bg-[#dfff00] sm:mt-5 sm:px-5 sm:text-[9px]"
              >
                DISCOVER MORE <ArrowUpRight size={14} />
              </a>
              <div className="mt-5 grid max-w-md grid-cols-3 border-t border-white/15 pt-3 sm:mt-7 sm:pt-4 md:mt-8">
                {heroMetrics.map((metric) => (
                  <div key={metric.label} className="hero-metric border-r border-white/10 px-2 first:pl-0 last:border-0 sm:px-3">
                    <p className="text-xl font-semibold tracking-tight text-[#dfff00] sm:text-2xl lg:text-3xl">{metric.value}</p>
                    <p className="mt-1 text-[6px] leading-3 tracking-[0.1em] text-white/50 sm:text-[8px] sm:tracking-[0.14em]">{metric.label}</p>
                  </div>
                ))}
              </div>
              <p className="mt-2 text-[7px] text-white/30 sm:text-[8px]">
                Illustrative design metrics — replace with verified figures before publication.
              </p>
            </div>

            {/* CINEMATIC HERO CAR — the image sequence remains scroll-driven */}
            <div className="hero-car relative order-2 flex min-h-0 w-full items-center justify-center md:order-2">
              <div className="hero-cinematic-stage relative h-[clamp(190px,31svh,300px)] w-full overflow-hidden sm:h-[34svh] md:h-[54vh] md:min-h-[320px]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.07),transparent_65%)]" />
                <img ref={carRef} src="/car.png" alt="Silver sports car" className="cinematic-image absolute inset-0 h-full w-full object-contain" fetchPriority="high" decoding="async" />
                <img src="/front-detail.png" alt="Sports car front detail" className="cinematic-image absolute inset-0 h-full w-full object-contain" decoding="async" />
                <img src="/gallery-front.png" alt="Sports car front view" className="cinematic-image absolute inset-0 h-full w-full object-contain" decoding="async" />
                <img src="/rear-detail.png" alt="Sports car rear detail" className="cinematic-image absolute inset-0 h-full w-full object-contain" decoding="async" />
                <img src="/rear-view.png" alt="Sports car rear view" className="cinematic-image absolute inset-0 h-full w-full object-contain" decoding="async" />
                <div className="absolute bottom-2 left-2 z-10 sm:bottom-3 sm:left-3">
                  <p className="cinematic-caption text-[8px] tracking-[0.22em] text-[#dfff00] sm:text-[9px] sm:tracking-[0.25em]">01 / THE REVEAL</p>
                </div>
              </div>
            </div>
          </div>

            {/* HERO FOOTER */}

          <div className="relative z-20 flex shrink-0 items-center justify-between gap-3 border-t border-white/15 pt-3 text-[7px] tracking-[0.12em] text-white/40 sm:text-[8px] sm:tracking-[0.18em]">

            <span>DESIGNED FOR THE EXTRAORDINARY</span>

            <a href="#performance" className="flex items-center gap-2">

              SCROLL TO EXPLORE <ArrowDown size={11} />

            </a>

          </div>

        </div>

      </section>

      {/* PERFORMANCE SECTION */}

      <section

        id="performance"

        className="relative overflow-hidden border-y border-white/10 bg-[#0d0e0f]"

      >

        <div className="grid min-h-[390px] md:grid-cols-[1.35fr_0.85fr]">

          <div className="px-6 py-14 sm:px-10 sm:py-16 lg:px-16 lg:py-20">

            <p className="reveal mb-4 text-[9px] tracking-[0.34em] text-[#dfff00]">

              ENGINEERED TO PERFORM

            </p>

            <div className="reveal grid gap-5 sm:grid-cols-2 sm:items-start">

              <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">

                Pure

                <br />

                <span className="text-white/60">performance.</span>

              </h2>

              <p className="max-w-xs text-xs leading-6 text-white/55 sm:pt-1 sm:text-[13px]">

                Every element serves a purpose. Every detail contributes

                to a more engaging automotive experience.

              </p>

            </div>

            <div className="mt-8 grid grid-cols-3 border-t border-white/15 pt-5 sm:mt-10 sm:pt-6">

              {specs.map((spec) => (

                <div

                  key={spec.label}

                  className="spec-item border-r border-white/10 px-2 first:pl-0 last:border-0 sm:px-5"

                >

                  <p className="text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl">

                    {spec.value}

                  </p>

                  <p className="mt-2 text-[7px] leading-4 tracking-[0.12em] text-white/55 sm:text-[8px] sm:tracking-[0.17em]">

                    {spec.label}

                  </p>

                </div>

              ))}

            </div>

            <p className="mt-6 text-[8px] leading-4 text-white/30">

              Illustrative specifications — verify before publication.

            </p>

          </div>

          <div className="relative flex min-h-[230px] items-center justify-center overflow-hidden border-t border-white/10 md:border-l md:border-t-0">

            <div className="absolute inset-0 bg-gradient-to-br from-[#17191a] to-[#090a0b]" />

            <img

              src="/rear-detail.png"

              alt="Sports car rear light and spoiler detail"

              className="reveal relative h-full max-h-[330px] w-full object-contain p-3"

              loading="lazy"
              decoding="async"

            />

          </div>

        </div>

      </section>

      {/* DESIGN SECTION */}

      <section

        id="design"

        className="grid overflow-hidden border-b border-white/10 md:grid-cols-2"

      >

        <div className="relative flex min-h-[280px] items-center justify-center overflow-hidden bg-[#0c0d0e] sm:min-h-[380px]">

          <div className="absolute inset-0 bg-gradient-to-br from-[#252728]/50 to-[#090a0b]" />

          <img

            src="/front-detail.png"

            alt="Silver sports car front and headlight detail"

            className="reveal relative max-h-[430px] w-full object-contain"

            loading="lazy"

          />

        </div>

        <div className="flex flex-col justify-center px-6 py-14 sm:px-10 sm:py-16 lg:px-16">

          <p className="reveal mb-4 text-[9px] tracking-[0.34em] text-[#dfff00]">

            DESIGN

          </p>

          <h2 className="reveal text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">

            Form meets

            <br />

            <span className="text-white/60">function.</span>

          </h2>

          <p className="reveal mt-5 max-w-md text-xs leading-6 text-white/55 sm:text-[13px] sm:leading-7">

            A striking balance of aerodynamic precision and pure emotion.

            Designed to dominate every road, every moment.

          </p>

          <div className="reveal mt-8 grid grid-cols-3 gap-3 border-t border-white/15 pt-5">

            <div>

              <p className="text-[8px] tracking-[0.13em]">01 AERO</p>

              <p className="mt-2 text-[9px] text-white/45">Downforce</p>

            </div>

            <div>

              <p className="text-[8px] tracking-[0.13em]">02 LIGHT</p>

              <p className="mt-2 text-[9px] text-white/45">Structure</p>

            </div>

            <div>

              <p className="text-[8px] tracking-[0.13em]">03 TRACK</p>

              <p className="mt-2 text-[9px] text-white/45">Precision</p>

            </div>

          </div>

        </div>

      </section>

      {/* GALLERY SECTION — NO CARDS */}

      <section

        id="gallery"

        className="border-b border-white/10 px-6 py-16 sm:px-10 sm:py-20 lg:px-16"

      >

        <div className="grid gap-8 lg:grid-cols-[0.85fr_2fr] lg:items-center">

          <div className="reveal">

            <p className="mb-4 text-[9px] tracking-[0.34em] text-[#dfff00]">

              GALLERY

            </p>

            <h2 className="text-4xl font-semibold leading-[1.02] tracking-[-0.04em] sm:text-5xl">

              Every angle

              <br />

              <span className="text-white/60">speaks power.</span>

            </h2>

            <p className="mt-4 max-w-xs text-xs leading-6 text-white/45">

              Explore the details that define the experience.

            </p>

          </div>

          <div className="min-w-0">

            <div

              ref={galleryRef}

              className="gallery-track flex flex-col gap-7 pb-4 sm:flex-row sm:snap-x sm:snap-mandatory sm:gap-6 sm:overflow-x-auto"

            >

              {gallery.map((item, index) => (

                <button

                  type="button"

                  key={item.number}

                  onClick={() => setGalleryIndex(index)}

                  aria-label={`View ${item.label.toLowerCase()} image larger`}

                  className="group w-full shrink-0 text-left sm:w-[44%] sm:snap-start lg:w-[31%]"

                >

                  <div className="relative flex h-48 items-center justify-center sm:h-40 lg:h-44">

                    <img

                      src={item.image}

                      alt={`Sports car ${item.label.toLowerCase()} view`}

                      className="h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-105"

                      loading="lazy"

                    />

                    <span className="absolute right-1 top-1 text-[8px] text-white/40">

                      {item.number}

                    </span>

                    <span className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition duration-300 group-hover:bg-black/10 group-hover:opacity-100">

                      <span className="border border-white/50 bg-black/60 px-4 py-2 text-[9px] tracking-[0.2em]">

                        VIEW IMAGE ↗

                      </span>

                    </span>

                  </div>

                  <p className="mt-3 text-[8px] tracking-[0.22em] text-white/65">

                    {item.label}

                  </p>

                </button>

              ))}

            </div>

            <div className="mt-3 flex justify-end gap-2">

              <button

                type="button"

                aria-label="Scroll gallery left"

                onClick={() => scrollGallery(-1)}

                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition hover:border-[#dfff00] hover:text-[#dfff00]"

              >

                <ArrowLeft size={15} />

              </button>

              <button

                type="button"

                aria-label="Scroll gallery right"

                onClick={() => scrollGallery(1)}

                className="flex h-9 w-9 items-center justify-center rounded-full border border-white/25 transition hover:border-[#dfff00] hover:text-[#dfff00]"

              >

                <ArrowRight size={15} />

              </button>

            </div>

          </div>

        </div>

      </section>

      {/* FULL-SCREEN GALLERY VIEWER */}

      {galleryIndex !== null && (

        <div

          className="gallery-lightbox fixed inset-0 z-[100] flex items-center justify-center bg-[#050606]/95 px-2 py-16 backdrop-blur-md sm:p-10"

          onClick={() => setGalleryIndex(null)}

          role="dialog"

          aria-modal="true"

          aria-label="Expanded car gallery image"

        >

          <button

            type="button"

            onClick={() => setGalleryIndex(null)}

            aria-label="Close image viewer"

            className="absolute right-5 top-5 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/25 text-2xl text-white transition hover:border-[#dfff00] hover:text-[#dfff00] sm:right-9 sm:top-9"

          >

            ×

          </button>

          <p className="absolute left-6 top-8 text-[9px] tracking-[0.25em] text-white/50 sm:left-10">

            {String(galleryIndex + 1).padStart(2, "0")}

            {" / "}

            {String(gallery.length).padStart(2, "0")}

            {" — "}

            {gallery[galleryIndex].label}

          </p>

          <button

            type="button"

            onClick={showPreviousImage}

            aria-label="Previous image"

            className="absolute left-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xl transition hover:border-[#dfff00] hover:text-[#dfff00] sm:left-8 sm:h-12 sm:w-12"

          >

            ‹

          </button>

          <img

            key={gallery[galleryIndex].image}

            src={gallery[galleryIndex].image}

            alt={`Sports car ${gallery[galleryIndex].label.toLowerCase()} view`}

            onClick={(event) => event.stopPropagation()}

            className="gallery-lightbox-image max-h-[62vh] w-full max-w-6xl object-contain sm:max-h-[78vh]"

          />

          <button

            type="button"

            onClick={showNextImage}

            aria-label="Next image"

            className="absolute right-3 z-10 flex h-10 w-10 items-center justify-center rounded-full border border-white/25 text-xl transition hover:border-[#dfff00] hover:text-[#dfff00] sm:right-8 sm:h-12 sm:w-12"

          >

            ›

          </button>

          <p className="absolute bottom-7 text-[8px] tracking-[0.2em] text-white/40">

            CLICK OUTSIDE OR PRESS ESC TO CLOSE

          </p>

        </div>

      )}

      {/* FINAL BANNER */}

      <section className="relative flex min-h-[430px] items-center overflow-hidden border-b border-white/10 bg-[#101112] sm:min-h-[460px]">

        <div className="absolute inset-0 bg-gradient-to-r from-[#090a0b] via-[#090a0b]/85 to-transparent" />

        <div className="pointer-events-none absolute inset-y-0 right-[-18%] flex w-[100%] items-center justify-center opacity-35 sm:right-0 sm:w-[65%] sm:opacity-60">

          <img

            src="/rear-view.png"

            alt="Silver sports car"

            className="h-full w-full object-contain"

            loading="lazy"

          />

        </div>

        <div className="reveal relative z-10 max-w-3xl px-5 py-16 sm:px-10 lg:px-16">

          <p className="mb-5 text-[9px] tracking-[0.34em] text-[#dfff00]">

            BEYOND THE ORDINARY

          </p>

          <h2 className="text-[clamp(2.1rem,7vw,3.75rem)] font-semibold leading-[1.02] tracking-[-0.045em] sm:text-6xl">

            A statement

            <br />

            of design.

            <br />

            <span className="text-white/60">A feeling of motion.</span>

          </h2>

          <a

            href="#top"

            className="mt-8 inline-flex items-center gap-4 border border-[#dfff00]/70 bg-[#dfff00] px-5 py-3.5 text-[9px] font-bold tracking-[0.18em] text-[#090a0b] transition duration-300 hover:bg-transparent hover:text-[#dfff00] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#dfff00]"

          >

            EXPLORE THE EXPERIENCE <ArrowUpRight size={14} />

          </a>

        </div>

      </section>

      {/* FOOTER */}

      <footer className="flex flex-col gap-6 px-6 py-7 text-[8px] tracking-[0.14em] text-white/45 sm:px-10 lg:flex-row lg:items-center lg:justify-between lg:px-16">

        <a

          href="#top"

          className="text-sm font-bold tracking-[0.16em] text-white"

        >

          FIZZ<span className="text-[#dfff00]">.</span>

          <span className="ml-3 text-[8px] font-normal tracking-[0.13em] text-white/40">

            AUTOMOTIVE DESIGN EXPERIENCE

          </span>

        </a>

        <div className="flex flex-wrap gap-x-5 gap-y-3">

          <a href="#top" className="hover:text-white">Models</a>

          <a href="#performance" className="hover:text-white">Performance</a>

          <a href="#design" className="hover:text-white">About</a>

        </div>

        <div className="flex items-center gap-4">

          <a

            href="#gallery"

            aria-label="Gallery"

            className="text-xs font-bold hover:text-[#dfff00]"

          >

            IG

          </a>

          <a

            href="#gallery"

            aria-label="Play gallery"

            className="hover:text-[#dfff00]"

          >

            <Play size={14} />

          </a>

          <span className="ml-2 border-l border-white/20 pl-4">

            BUILT TO MOVE.

          </span>

        </div>

      </footer>

      {/* FINAL MOTION — car glides in and stops in-frame; copy follows */}
      <section
        ref={finalMotionRef}
        className="final-motion relative isolate min-h-[360px] overflow-hidden bg-[#090a0b] sm:min-h-[250px] lg:min-h-[290px]"
        aria-label="FIZZ final motion"
      >
        <div className="final-motion-copy pointer-events-none absolute left-4 right-4 top-5 z-30 w-auto max-w-none opacity-0 sm:left-10 sm:right-auto sm:top-8 sm:max-w-[45%] lg:left-[7%]">
          <p className="mb-2 text-[8px] tracking-[0.32em] text-[#dfff00] sm:text-[9px]">FIZZ / BUILT TO MOVE</p>
          <p className="text-xl font-semibold leading-tight tracking-[-0.04em] text-white sm:text-3xl lg:text-4xl">
            Motion that
            <br />
            leaves a mark.
          </p>
          <p className="mt-2 max-w-xs text-[10px] leading-5 text-white/50 sm:text-xs">Designed to be felt, not just seen.</p>
        </div>
        <img
          src="/car.png"
          alt="Silver sports car moving into position"
          className="final-motion-car absolute bottom-0 left-0 z-20 w-[min(68vw,270px)] translate-x-[-110%] object-contain sm:w-[min(55vw,500px)] lg:w-[min(46vw,560px)]"
          loading="lazy"
          decoding="async"
        />
      </section>

    </main>

  );

}
