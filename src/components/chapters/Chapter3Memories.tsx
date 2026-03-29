"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Chapter3Memories.module.css";

interface Props { onNext: () => void; }

const BASE_PHOTOS = [
  { src: "/memories/img1.jpeg", caption: "Green days & good air", rotate: -4 },
  { src: "/memories/img2.jpeg", caption: "When the light was just right", rotate: 3 },
  { src: "/memories/img3.jpeg", caption: "Every film we watched twice", rotate: -2 },
  { src: "/memories/img4.jpeg", caption: "The 2am conversations", rotate: 5 },
  { src: "/memories/img5.jpeg", caption: "Songs you showed me first", rotate: -6 },
  { src: "/memories/img6.jpeg", caption: "That one autumn afternoon", rotate: 2 },
  { src: "/memories/img7.jpeg", caption: "Childlike wonder, always", rotate: -3 },
  { src: "/memories/img8.jpeg", caption: "Watching the sky change colors", rotate: 4 },
  { src: "/memories/img9.jpeg", caption: "Deep in a good book together", rotate: -5 },
  { src: "/memories/img10.jpeg", caption: "Mornings without an agenda", rotate: 1 },
  { src: "/memories/img11.jpeg", caption: "You made everything look beautiful", rotate: -2 },
];

export default function Chapter3Memories({ onNext }: Props) {
  const [photos, setPhotos] = useState<typeof BASE_PHOTOS>([]);
  const [revealed, setRevealed] = useState<boolean[]>([]);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const photoRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const shuffled = [...BASE_PHOTOS].sort(() => Math.random() - 0.5);
    setPhotos(shuffled);
    setRevealed(new Array(shuffled.length).fill(false));

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const idx = Number((entry.target as HTMLElement).dataset.idx);
            setRevealed((r) => { const n = [...r]; n[idx] = true; return n; });
          }
        });
      },
      { threshold: 0.15 }
    );
    
    return () => observerRef.current?.disconnect();
  }, []);

  // Attach observer once photos are mapped into DOM
  useEffect(() => {
    if (photos.length > 0) {
      photoRefs.current.forEach((el) => {
        if (el && observerRef.current) observerRef.current.observe(el);
      });
    }
  }, [photos]);

  // Auto-scroll animation
  useEffect(() => {
    let animationFrameId: number;
    let lastTime: number;
    const scrollContainer = containerRef.current;
    
    if (!scrollContainer) return;

    const autoScroll = (timestamp: number) => {
      if (!lastTime) lastTime = timestamp;
      const deltaTime = timestamp - lastTime;
      lastTime = timestamp;

      if (hoveredIdx === null) {
        scrollContainer.scrollTop += deltaTime * 0.05; 
      }

      if (scrollContainer.scrollTop + scrollContainer.clientHeight < scrollContainer.scrollHeight - 5) {
        animationFrameId = requestAnimationFrame(autoScroll);
      }
    };
    
    const timeoutId = setTimeout(() => {
      animationFrameId = requestAnimationFrame(autoScroll);
    }, 1500);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [hoveredIdx]);

  return (
    <div className={styles.scene}>
      <div className={styles.bg} />

      <div className={styles.inner} ref={containerRef}>
        <div className={styles.heading}>
          <h2 className={styles.title}>Our Moments</h2>
          <p className={styles.sub}>Pinned on the corkboard of memory ✦</p>
        </div>

        {/* String lights */}
        <div className={styles.lights}>
          {Array.from({ length: 14 }).map((_, i) => (
            <div key={i} className={styles.lightBulb} style={{ animationDelay: `${i * 0.2}s` }} />
          ))}
        </div>

        <div className={styles.grid}>
          {photos.map((photo, i) => (
            <div
              key={i}
              ref={(el) => { photoRefs.current[i] = el; }}
              data-idx={i}
              className={`${styles.polaroid} ${revealed[i] ? styles.visible : ""} ${hoveredIdx === i ? styles.hovered : ""}`}
              style={{
                "--rotate": `${photo.rotate}deg`,
                "--delay": `${i * 0.07}s`,
              } as React.CSSProperties}
              onMouseEnter={() => setHoveredIdx(i)}
              onMouseLeave={() => setHoveredIdx(null)}
            >
              <div className={styles.polaroidInner}>
                <div className={styles.polaroidImg}>
                  <img src={photo.src} alt={photo.caption} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '2px' }} />
                  <div className={styles.photoGrain} />
                </div>
                <div className={styles.polaroidCaption}>{photo.caption}</div>
              </div>
              <div className={styles.pin} />
            </div>
          ))}
        </div>

        <div className={styles.bottomActions}>
          <p className={styles.bottomText}>Many more to come 🌙</p>
          <button className={styles.nextBtn} onClick={onNext}>
            Next Chapter <span>→</span>
          </button>
        </div>
      </div>
    </div>
  );
}
