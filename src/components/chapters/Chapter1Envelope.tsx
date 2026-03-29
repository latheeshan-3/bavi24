"use client";

import { useState, useEffect } from "react";
import styles from "./Chapter1Envelope.module.css";

interface Props { onNext: () => void; }

export default function Chapter1Envelope({ onNext }: Props) {
  const [phase, setPhase] = useState<"idle" | "opening" | "open">("idle");
  const [stars, setStars] = useState<{ x: number; y: number; s: number; a: number; d: number }[]>([]);

  useEffect(() => {
    setStars(
      Array.from({ length: 80 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        s: Math.random() * 2.5 + 0.5,
        a: Math.random() * 0.7 + 0.2,
        d: Math.random() * 4 + 1,
      }))
    );
  }, []);

  const handleSeal = () => {
    if (phase !== "idle") return;
    setPhase("opening");
    setTimeout(() => setPhase("open"), 1400);
  };

  return (
    <div className={styles.scene}>
      {/* Starfield */}
      {stars.map((s, i) => (
        <div
          key={i}
          className={styles.star}
          style={{
            left: `${s.x}%`,
            top: `${s.y}%`,
            width: s.s + "px",
            height: s.s + "px",
            opacity: s.a,
            animationDuration: `${s.d}s`,
          }}
        />
      ))}

      {/* Drifting particles */}
      {Array.from({ length: 18 }).map((_, i) => (
        <div
          key={`gp${i}`}
          className={styles.goldParticle}
          style={{
            left: `${5 + i * 5.2}%`,
            animationDelay: `${i * 0.4}s`,
            animationDuration: `${6 + (i % 4)}s`,
          }}
        />
      ))}

      {/* ── ENVELOPE ── */}
      <div className={`${styles.envelope} ${phase === "opening" || phase === "open" ? styles.envelopeOpen : ""}`}>
        {/* Back panel */}
        <div className={styles.envBack} />

        {/* Flap */}
        <div className={`${styles.flap} ${phase !== "idle" ? styles.flapUp : ""}`}>
          <div className={styles.flapInner} />
        </div>

        {/* Side folds */}
        <div className={styles.foldLeft} />
        <div className={styles.foldRight} />
        <div className={styles.foldBottom} />

        {/* Wax seal */}
        {phase === "idle" && (
          <button className={styles.seal} onClick={handleSeal} aria-label="Open envelope">
            <span className={styles.sealGlyph}>B</span>
            <span className={styles.sealRing} />
            <span className={styles.sealPulse} />
          </button>
        )}

        {/* Letter card sliding out */}
        <div className={`${styles.letter} ${phase === "open" ? styles.letterOut : ""}`}>
          <div className={styles.letterNum}>24</div>
          <h1 className={styles.letterHeading}>Happy Birthday,<br /><em>Bavi</em></h1>
          <p className={styles.letterBody}>
            Twenty-four chapters in — and every single one brighter than the last.
            This is a small world built just for you, on the day that belongs entirely to you.
          </p>
          <p className={styles.letterSub}>
            Press a chapter, feel a memory, make a wish. 🌙
          </p>
          {phase === "open" && (
            <button className={styles.beginBtn} onClick={onNext}>
              Begin the Story <span className={styles.arrow}>→</span>
            </button>
          )}
        </div>
      </div>

      {/* Hint text */}
      {phase === "idle" && (
        <p className={styles.hint}>
          <span className={styles.hintDot} />
          Tap the wax seal to open
        </p>
      )}
    </div>
  );
}
