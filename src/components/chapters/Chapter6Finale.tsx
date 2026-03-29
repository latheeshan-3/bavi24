"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Chapter6Finale.module.css";

interface Props { onRestart: () => void; }

const WORDS = [
  "Curious", "Luminous", "Fierce", "Tender", "Grounded", "Bold",
  "Thoughtful", "Electric", "Warm", "Patient", "Creative", "Honest",
  "Brave", "Gentle", "Sharp", "Joyful", "Steady", "Radiant",
  "Kind", "Dreamy", "Real", "Magic", "Rare", "Golden",
];

export default function Chapter6Finale({ onRestart }: Props) {
  const [hoveredWord, setHoveredWord] = useState<number | null>(null);
  const [musicOn, setMusicOn] = useState(false);
  const [rain, setRain] = useState<{ x: number; y: number; d: number; size: number; delay: number }[]>([]);
  const [badgePulse, setBadgePulse] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    setRain(
      Array.from({ length: 55 }, () => ({
        x: Math.random() * 100,
        y: Math.random() * -100,
        d: 6 + Math.random() * 12,
        size: Math.random() * 10 + 5,
        delay: Math.random() * 6,
      }))
    );
    const t = setTimeout(() => setBadgePulse(true), 1500);
    return () => clearTimeout(t);
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) {
      // Create a gentle tone using Web Audio API
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.frequency.setValueAtTime(432, ctx.currentTime);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      osc.type = "sine";
      osc.start();
      (audioRef as React.MutableRefObject<unknown>).current = { ctx, osc, gain };
      setMusicOn(true);
    } else {
      const audio = audioRef.current as unknown as { ctx: AudioContext; osc: OscillatorNode; gain: GainNode };
      if (musicOn) {
        audio.gain.gain.linearRampToValueAtTime(0, audio.ctx.currentTime + 0.5);
        setTimeout(() => {
          audio.osc.stop();
          audioRef.current = null;
        }, 600);
        setMusicOn(false);
      }
    }
  };

  return (
    <div className={styles.scene}>
      {/* Aurora background */}
      <div className={styles.aurora} />
      <div className={styles.aurora2} />
      <div className={styles.aurora3} />

      {/* Avatar Image */}
      <img src="/avatar.png" alt="Bavi" className={styles.avatar} />

      {/* Gold rain */}
      {rain.map((p, i) => (
        <div
          key={i}
          className={styles.raindrop}
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            fontSize: p.size,
            animationDuration: `${p.d}s`,
            animationDelay: `${p.delay}s`,
          }}
        >★</div>
      ))}

      <div className={styles.content}>
        {/* Main headline */}
        <div className={styles.headline}>
          <div className={styles.headlineTop}>Here&apos;s to</div>
          <div className={styles.headlineNum}>24</div>
          <div className={styles.headlineBottom}>years of you, <em>Bavi.</em></div>
        </div>

        {/* Word mosaic */}
        <div className={styles.mosaic}>
          {WORDS.map((word, i) => (
            <button
              key={i}
              className={`${styles.word} ${hoveredWord === i ? styles.wordLit : ""}`}
              onMouseEnter={() => setHoveredWord(i)}
              onMouseLeave={() => setHoveredWord(null)}
              onTouchStart={() => setHoveredWord(i)}
              onTouchEnd={() => setHoveredWord(null)}
              style={{ "--wi": i } as React.CSSProperties}
            >
              {word}
            </button>
          ))}
        </div>

        {/* Birthday badge */}
        <div className={`${styles.badge} ${badgePulse ? styles.badgeVisible : ""}`}>
          <span className={styles.badgeIcon}>🎂</span>
          <div className={styles.badgeText}>
            <span className={styles.badgeMain}>Happy Birthday</span>
            <span className={styles.badgeSub}>With all the love 💛</span>
          </div>
        </div>

        {/* Action row */}
        <div className={styles.actions}>
          <button className={styles.musicBtn} onClick={toggleMusic}>
            {musicOn ? "🔇 Mute Ambience" : "🎵 Ambient Sound"}
          </button>
          <button className={styles.restartBtn} onClick={onRestart}>
            🔁 Restart the Story
          </button>
        </div>
      </div>
    </div>
  );
}
