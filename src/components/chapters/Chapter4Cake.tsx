"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import styles from "./Chapter4Cake.module.css";

interface Props { onNext: () => void; }

const TOTAL_CANDLES = 24;

export default function Chapter4Cake({ onNext }: Props) {
  const [lit, setLit] = useState(Array(TOTAL_CANDLES).fill(true));
  const [holding, setHolding] = useState(false);
  const [blownCount, setBlownCount] = useState(0);
  const [stars, setStars] = useState<{ x: number; y: number; size: number; delay: number }[]>([]);
  const [wished, setWished] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const blownRef = useRef(0);

  useEffect(() => {
    setStars(
      Array.from({ length: 40 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * 100,
        size: Math.random() * 12 + 6,
        delay: Math.random() * 0.8,
      }))
    );
  }, []);

  const startBlowing = useCallback(() => {
    if (blownRef.current >= TOTAL_CANDLES) return;
    setHolding(true);
    intervalRef.current = setInterval(() => {
      setLit((prev) => {
        const litIndices = prev.map((v, i) => (v ? i : -1)).filter((i) => i >= 0);
        if (litIndices.length === 0) {
          clearInterval(intervalRef.current!);
          return prev;
        }
        const toExtinguish = litIndices[Math.floor(Math.random() * litIndices.length)];
        const next = [...prev];
        next[toExtinguish] = false;
        blownRef.current += 1;
        setBlownCount(blownRef.current);
        if (next.every((v) => !v)) {
          clearInterval(intervalRef.current!);
          setTimeout(() => {
            setWished(true);
            setTimeout(() => setShowNext(true), 2200);
          }, 600);
        }
        return next;
      });
    }, 120);
  }, []);

  const stopBlowing = useCallback(() => {
    setHolding(false);
    if (intervalRef.current) { clearInterval(intervalRef.current); intervalRef.current = null; }
  }, []);

  useEffect(() => () => { if (intervalRef.current) clearInterval(intervalRef.current); }, []);

  const allOut = blownCount >= TOTAL_CANDLES;

  return (
    <div className={styles.scene}>
      <div className={styles.bg} />

      {/* Burst stars */}
      {wished && stars.map((s, i) => (
        <div
          key={i}
          className={styles.burstStar}
          style={{ left: `${s.x}%`, top: `${s.y}%`, fontSize: s.size, animationDelay: `${s.delay}s` }}
        >★</div>
      ))}

      <div className={styles.content}>
        <h2 className={styles.title}>Close your eyes.</h2>
        <p className={styles.sub}>Make a wish. 🌙</p>

        {/* Cake */}
        <div className={styles.cake}>
          {/* Candles row */}
          <div className={styles.candlesTop}>
            {Array.from({ length: TOTAL_CANDLES }).map((_, i) => (
              <div key={i} className={styles.candleWrap}>
                <div className={styles.candle}>
                  {lit[i] && (
                    <div className={styles.flame}>
                      <div className={styles.flameInner} />
                      <div className={styles.flameGlow} />
                    </div>
                  )}
                  {!lit[i] && <div className={styles.smoke} />}
                  <div className={styles.candleBody} style={{ background: i % 2 === 0 ? "#7a9c7e" : "#9b7fe8" }} />
                </div>
              </div>
            ))}
          </div>

          {/* Tiers */}
          <div className={styles.tier1}>
            <div className={styles.tierFrost} />
            <div className={styles.tierDeco}>✦ ✦ ✦ Happy Birthday ✦ ✦ ✦</div>
          </div>
          <div className={styles.tier2}>
            <div className={styles.tierFrost2} />
          </div>
          <div className={styles.tier3} />
          <div className={styles.plate} />
        </div>

        {/* Blown count */}
        {blownCount > 0 && !allOut && (
          <p className={styles.blowCount}>{TOTAL_CANDLES - blownCount} candles left ✨</p>
        )}

        {/* Wish message */}
        {wished && (
          <div className={styles.wishMsg}>
            <span className={styles.wishIcon}>✨</span>
            Wish Sent to the Universe
            <span className={styles.wishIcon}>✨</span>
          </div>
        )}

        {/* Blow button */}
        {!allOut && (
          <button
            className={`${styles.blowBtn} ${holding ? styles.blowing : ""}`}
            onMouseDown={startBlowing}
            onMouseUp={stopBlowing}
            onMouseLeave={stopBlowing}
            onTouchStart={startBlowing}
            onTouchEnd={stopBlowing}
          >
            🌬️ {holding ? "Blowing…" : "Hold to Blow"}
          </button>
        )}

        {showNext && (
          <button className={styles.nextBtn} onClick={onNext}>
            Next Chapter <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
