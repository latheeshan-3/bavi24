"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import styles from "./Chapter5Wheel.module.css";

interface Props { onNext: () => void; }

const SEGMENTS = [
  { label: "KFC Feast", emoji: "🍗", color: "#e8a030", desc: "A bucket of joy." },
  { label: "Earbuds", emoji: "🎧", color: "#9b7fe8", desc: "For your playlists." },
  { label: "Watch", emoji: "⌚", color: "#7a9c7e", desc: "Time is on your side." },
  { label: "Shoes", emoji: "👟", color: "#f5c060", desc: "Step into 24 with style." },
];

const SEG_COUNT = SEGMENTS.length;
const SEG_ANGLE = 360 / SEG_COUNT;

export default function Chapter5Wheel({ onNext }: Props) {
  const [showVideo, setShowVideo] = useState(true);
  const [rain, setRain] = useState<{id: number, left: number, animDuration: number, delay: number, color: string}[]>([]);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [result, setResult] = useState<{label: string; emoji: string; color: string; desc: string} | null>(null);
  const [hasSpun, setHasSpun] = useState(false);
  const [revealedCards, setRevealedCards] = useState<number[]>([]);
  const totalRotRef = useRef(0);

  const handleRevealCard = (idx: number) => {
    if (idx !== 3 && !revealedCards.includes(idx)) {
      setRevealedCards(prev => [...prev, idx]);
    }
  };

  useEffect(() => {
    if (showVideo) {
      const particles = Array.from({length: 80}).map((_, i) => ({
        id: i,
        left: Math.random() * 100,
        animDuration: 1.5 + Math.random() * 3,
        delay: Math.random() * 4,
        color: ['#e8a030', '#9b7fe8', '#7a9c7e', '#f5c060'][Math.floor(Math.random()*4)]
      }));
      setRain(particles);
      
      // Auto fallback just in case video fails to play or stalls
      const fallbackTimer = setTimeout(() => setShowVideo(false), 8000); 
      return () => clearTimeout(fallbackTimer);
    }
  }, [showVideo]);

  const spin = useCallback(() => {
    if (spinning || hasSpun) return; // Only one spin allowed
    setSpinning(true);
    setResult(null);

    const extraSpins = 6 + Math.floor(Math.random() * 3);
    
    // We force it to land on index 3 (Shoes)
    const targetIdx = 3;
    const targetMidAngle = targetIdx * SEG_ANGLE + (SEG_ANGLE / 2);
    const requiredRotation = 270 - targetMidAngle;
    const extraAngle = (requiredRotation % 360 + 360) % 360;
    
    // Give it a realistic random resting position within the segment
    const randomness = (Math.random() - 0.5) * (SEG_ANGLE - 20); 
    const totalDeg = extraSpins * 360 + extraAngle + randomness;
    const newTotal = totalRotRef.current + totalDeg;
    
    totalRotRef.current = newTotal;
    setRotation(newTotal);

    setTimeout(() => {
      setSpinning(false);
      setHasSpun(true);
      setResult({
        label: "Mystery Gift!",
        emoji: "🎁",
        color: "#f5c060",
        desc: "A special gift has been locked in for you! It's going to stay a secret until you unbox it... 👀"
      });
    }, 4500);
  }, [spinning, hasSpun]);

  if (showVideo) {
    return (
      <div className={styles.scene}>
         <div className={styles.videoWrap}>
           {rain.map(p => (
             <div 
               key={p.id} 
               className={styles.rainParticle} 
               style={{
                 left: `${p.left}%`, 
                 animationDuration: `${p.animDuration}s`, 
                 animationDelay: `${p.delay}s`,
                 color: p.color,
                 backgroundColor: p.color
               }}
             />
           ))}
           <video 
             src="/candle%20blowing.mp4" 
             autoPlay 
             muted
             playsInline
             onEnded={() => setShowVideo(false)}
             onError={() => setShowVideo(false)}
             className={styles.videoPlayer}
           />
         </div>
      </div>
    );
  }

  return (
    <div className={styles.scene}>
      <div className={styles.bg} />

      <div className={styles.content}>
        <h2 className={styles.title}>The Mystery Gift</h2>
        <p className={styles.sub}>Spin to reveal what's waiting for you 🎁</p>

        {!result ? (
          <>
            <div className={styles.wheelWrap}>
              {/* Pointer */}
              <div className={styles.pointer}>▼</div>

              {/* SVG Wheel */}
              <svg
                className={styles.wheel}
                viewBox="0 0 300 300"
                style={{ transform: `rotate(${rotation}deg)`, transition: spinning ? "transform 4.5s cubic-bezier(0.17, 0.67, 0.12, 1)" : "none" }}
              >
                {SEGMENTS.map((seg, i) => {
                  const startAngle = (i * SEG_ANGLE - 90) * (Math.PI / 180);
                  const endAngle = ((i + 1) * SEG_ANGLE - 90) * (Math.PI / 180);
                  const x1 = 150 + 140 * Math.cos(startAngle);
                  const y1 = 150 + 140 * Math.sin(startAngle);
                  const x2 = 150 + 140 * Math.cos(endAngle);
                  const y2 = 150 + 140 * Math.sin(endAngle);
                  const midAngle = ((i + 0.5) * SEG_ANGLE - 90) * (Math.PI / 180);
                  const tx = 150 + 92 * Math.cos(midAngle);
                  const ty = 150 + 92 * Math.sin(midAngle);
                  const textAngle = (i + 0.5) * SEG_ANGLE;
                  
                  const isRevealed = hasSpun && i !== 3; // Everything but Shoes is revealed after spin
                  const displayEmoji = isRevealed ? seg.emoji : "❓";
                  const displayLabel = isRevealed ? seg.label.toUpperCase() : "MYSTERY";

                  return (
                    <g key={i}>
                      <path
                        d={`M 150 150 L ${x1} ${y1} A 140 140 0 0 1 ${x2} ${y2} Z`}
                        fill={isRevealed ? seg.color : "#0c1445"}
                        stroke={isRevealed ? "rgba(12,20,69,0.4)" : seg.color}
                        strokeWidth="2"
                      />
                      <text
                        x={tx}
                        y={ty}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle}, ${tx}, ${ty})`}
                        fontSize="18"
                        fontFamily="Inter, sans-serif"
                        fontWeight="600"
                        fill={isRevealed ? "#fff" : seg.color}
                        style={{ textShadow: isRevealed ? "0 1px 4px rgba(0,0,0,0.5)" : "none" }}
                      >
                        {displayEmoji}
                      </text>
                      <text
                        x={tx}
                        y={ty + 20}
                        textAnchor="middle"
                        dominantBaseline="middle"
                        transform={`rotate(${textAngle}, ${tx}, ${ty + 20})`}
                        fontSize="10"
                        fontFamily="Inter, sans-serif"
                        fontWeight="700"
                        fill={isRevealed ? "rgba(255,255,255,0.9)" : seg.color}
                        letterSpacing="0.5"
                      >
                        {displayLabel}
                      </text>
                    </g>
                  );
                })}
                {/* Center hub */}
                <circle cx="150" cy="150" r="22" fill="#0c1445" stroke="rgba(232,160,48,0.6)" strokeWidth="2" />
                <circle cx="150" cy="150" r="8" fill="#e8a030" />
              </svg>
            </div>

            {/* Spin button */}
            <button
              className={`${styles.spinBtn} ${spinning ? styles.spinning : ""}`}
              onClick={spin}
              disabled={spinning || hasSpun}
            >
              {spinning ? "Spinning…" : hasSpun ? "Gift Locked 🔒" : "SPIN 🌀"}
            </button>
          </>
        ) : (
          <div className={styles.cardsGrid}>
            {SEGMENTS.map((seg, i) => {
              const isLocked = i === 3; // Mystery Item is Shoes (index 3)
              
              if (isLocked) {
                return (
                  <div key={i} className={`${styles.giftCard} ${styles.locked}`}>
                    <div className={styles.cardEmoji}>🎁</div>
                    <div className={styles.cardHeader} style={{ color: "#f5c060" }}>
                      MYSTERY GIFT
                    </div>
                    <p className={styles.cardDescText}>
                      You won this gift! You can't reveal it now.
                    </p>
                  </div>
                );
              }

              const isRevealed = revealedCards.includes(i);
              return (
                <button 
                  key={i} 
                  className={styles.giftCard}
                  style={{ borderColor: isRevealed ? seg.color : undefined }}
                  onClick={() => handleRevealCard(i)}
                  disabled={isRevealed}
                >
                  <div className={styles.cardEmoji}>{isRevealed ? seg.emoji : "❓"}</div>
                  <div className={styles.cardHeader} style={{ color: isRevealed ? seg.color : "#9b7fe8" }}>
                    {isRevealed ? seg.label.toUpperCase() : "MYSTERY GIFT"}
                  </div>
                  <p className={styles.cardDescText}>
                    {isRevealed ? seg.desc : "Tap to view"}
                  </p>
                </button>
              );
            })}
          </div>
        )}

        {hasSpun && !spinning && (
          <button className={styles.nextBtn} onClick={onNext}>
            Next Chapter <span>→</span>
          </button>
        )}
      </div>
    </div>
  );
}
