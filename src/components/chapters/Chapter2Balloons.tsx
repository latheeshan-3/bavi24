"use client";

import { useState, useEffect, useRef } from "react";
import styles from "./Chapter2Balloons.module.css";

interface Props { onNext: () => void; }

const MESSAGES = [
  { text: "You turn every ordinary day into something worth remembering. 🌿", color: "#e8a030" },
  { text: "The way you laugh — it fills the whole room. ✨", color: "#9b7fe8" },
  { text: "You're the kind of person who makes other people want to be better. 🌙" , color: "#7a9c7e" },
  { text: "24 years of pure, unfiltered Bavi — the world is lucky. 🎞️", color: "#f5f0e8" },
  { text: "You notice things others walk past. That's a superpower. 🔍", color: "#e8a030" },
  { text: "Every playlist you make is a tiny masterpiece. 🎵", color: "#9b7fe8" },
  { text: "You carry calm like a second skin. 🌾", color: "#7a9c7e" },
  { text: "The adventures we haven't taken yet? They're going to be legendary. 🗺️", color: "#f5c060" },
  { text: "Your taste is unmatched — in food, music, and people. 🍂", color: "#9b7fe8" },
  { text: "You make the mundane feel cinematic. 🎠", color: "#7a9c7e" },
  { text: "Stubborn in the best way. You never give up on what matters. 🌅", color: "#e8a030" },
  { text: "The person I'd choose to sit in comfortable silence with. 🌙", color: "#9b7fe8" },
  { text: "You've grown so quietly and so beautifully this year. 🌿", color: "#7a9c7e" },
  { text: "Your heart is enormous. Don't let anyone shrink it. 💛", color: "#f5c060" },
  { text: "Here's to 24 — your most golden year yet. 🥂", color: "#e8a030" },
];

interface Balloon {
  id: number;
  x: number;
  y: number;
  size: number;
  color: string;
  speedX: number;
  speedY: number;
  swayPhase: number;
  swayAmp: number;
  swaySpeed: number;
  popped: boolean;
  msg: string;
  msgColor: string;
  confetti: { x: number; y: number; color: string; angle: number; speed: number }[];
}

interface FloatingMsg { id: number; text: string; color: string; bx: number; by: number; }

const BALLOON_COLORS = ["#e8a030", "#9b7fe8", "#7a9c7e", "#f5f0e8", "#f5c060", "#c0a8f5", "#a8c5ac"];

export default function Chapter2Balloons({ onNext }: Props) {
  const [balloons, setBalloons] = useState<Balloon[]>([]);
  const [floatingMsgs, setFloatingMsgs] = useState<FloatingMsg[]>([]);
  const [poppedCount, setPoppedCount] = useState(0);
  const [showNext, setShowNext] = useState(false);
  const frameRef = useRef<number>(0);
  const balloonsRef = useRef<Balloon[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const msgs = [...MESSAGES].sort(() => Math.random() - 0.5);
    const initial: Balloon[] = Array.from({ length: 15 }, (_, i) => ({
      id: i,
      x: 8 + (i / 14) * 84,
      y: 110 + Math.random() * 60,
      size: 70 + Math.random() * 40,
      color: BALLOON_COLORS[i % BALLOON_COLORS.length],
      speedX: (Math.random() - 0.5) * 0.08,
      speedY: -(0.12 + Math.random() * 0.12),
      swayPhase: Math.random() * Math.PI * 2,
      swayAmp: 0.3 + Math.random() * 0.5,
      swaySpeed: 0.008 + Math.random() * 0.008,
      popped: false,
      msg: msgs[i % msgs.length].text,
      msgColor: msgs[i % msgs.length].color,
      confetti: [],
    }));
    setBalloons(initial);
    balloonsRef.current = initial;

    const animate = () => {
      balloonsRef.current = balloonsRef.current.map((b) => {
        if (b.popped) return b;
        const newPhase = b.swayPhase + b.swaySpeed;
        const swayX = Math.sin(newPhase) * b.swayAmp;
        let nx = b.x + b.speedX + swayX;
        let ny = b.y + b.speedY;
        if (nx < 3) nx = 3;
        if (nx > 97) nx = 97;
        if (ny < -20) { ny = 110; nx = 5 + Math.random() * 90; }
        return { ...b, x: nx, y: ny, swayPhase: newPhase };
      });
      setTick((t) => t + 1);
      frameRef.current = requestAnimationFrame(animate);
    };
    frameRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  // sync state from ref for rendering
  useEffect(() => {
    if (tick % 2 === 0) setBalloons([...balloonsRef.current]);
  }, [tick]);

  const playPopSound = () => {
    try {
      const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
      const ctx = new AudioContext();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.type = "sine";
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      
      gain.gain.setValueAtTime(0, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.5, ctx.currentTime + 0.01);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) {
      // Ignore audio errors
    }
  };

  const popBalloon = (id: number, bx: number, by: number) => {
    const b = balloonsRef.current.find((b) => b.id === id);
    if (!b || b.popped) return;
    playPopSound();
    const confetti = Array.from({ length: 18 }, () => ({
      x: bx, y: by,
      color: BALLOON_COLORS[Math.floor(Math.random() * BALLOON_COLORS.length)],
      angle: Math.random() * 360,
      speed: 1 + Math.random() * 3,
    }));
    balloonsRef.current = balloonsRef.current.map((bl) =>
      bl.id === id ? { ...bl, popped: true, confetti } : bl
    );
    setBalloons([...balloonsRef.current]);
    setFloatingMsgs((m) => [...m, { id, text: b.msg, color: b.msgColor, bx, by }]);
    const newCount = balloonsRef.current.filter((bl) => bl.popped).length;
    setPoppedCount(newCount);
    if (newCount >= 3) setShowNext(true);
    setTimeout(() => setFloatingMsgs((m) => m.filter((fm) => fm.id !== id)), 4000);
  };

  return (
    <div className={styles.scene} ref={containerRef}>
      {/* Sky gradient layers */}
      <div className={styles.skyGlow} />

      {/* Floating message cards */}
      {floatingMsgs.map((msg) => (
        <div
          key={msg.id}
          className={styles.floatingCard}
          style={{
            left: `clamp(10px, ${msg.bx}%, calc(100% - 220px))`,
            top: `clamp(60px, ${msg.by - 30}%, calc(100% - 120px))`,
            borderColor: msg.color,
          }}
        >
          <span className={styles.floatingCardDot} style={{ background: msg.color }} />
          {msg.text}
        </div>
      ))}

      {/* Balloons */}
      {balloons.map((b) =>
        b.popped ? null : (
          <button
            key={b.id}
            className={styles.balloon}
            style={{
              left: `${b.x}%`,
              top: `${b.y}%`,
              width: b.size,
              height: b.size * 1.25,
            }}
            onClick={() => popBalloon(b.id, b.x, b.y)}
            aria-label="Pop balloon"
          >
            <div className={styles.balloonBody} style={{ background: `radial-gradient(circle at 35% 30%, ${b.color}cc, ${b.color}88)`, boxShadow: `0 0 20px ${b.color}55` }}>
              <div className={styles.balloonShine} />
            </div>
            <div className={styles.balloonKnot} style={{ background: b.color }} />
            <div className={styles.balloonString} />
          </button>
        )
      )}

      {/* Pop counter */}
      <div className={styles.counter}>
        <span className={styles.counterNum}>{Math.min(poppedCount, 7)}</span>
        <span className={styles.counterOf}>/7</span>
        <span className={styles.counterLabel}> popped</span>
      </div>

      <div className={styles.heading}>
        <h2 className={styles.title}>The Sky Full of Secrets</h2>
        <p className={styles.sub}>Tap each balloon to reveal a secret about you ✨</p>
      </div>

      {showNext && (
        <button className={styles.nextBtn} onClick={onNext}>
          Next Chapter <span>→</span>
        </button>
      )}
    </div>
  );
}
