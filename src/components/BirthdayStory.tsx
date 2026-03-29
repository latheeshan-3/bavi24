"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import Chapter1Envelope from "./chapters/Chapter1Envelope";
import Chapter2Balloons from "./chapters/Chapter2Balloons";
import Chapter3Memories from "./chapters/Chapter3Memories";
import Chapter4Cake from "./chapters/Chapter4Cake";
import Chapter5Wheel from "./chapters/Chapter5Wheel";
import Chapter6Finale from "./chapters/Chapter6Finale";
import AmbientParticles from "./ui/AmbientParticles";
import styles from "./BirthdayStory.module.css";

const TOTAL_CHAPTERS = 6;

export default function BirthdayStory() {
  const [chapter, setChapter] = useState(1);
  const [transitioning, setTransitioning] = useState(false);
  const [transitionDir, setTransitionDir] = useState<"in" | "out">("in");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize background audio
  useEffect(() => {
    if (typeof Audio !== "undefined" && !audioRef.current) {
      const audio = new Audio("/audio.mp3");
      audio.loop = true;
      audio.volume = 0.5; // base volume
      audioRef.current = audio;
    }
  }, []);

  // Unlock audio organically on first interaction
  useEffect(() => {
    const unlockAudio = () => {
      if (audioRef.current && audioRef.current.paused && chapter < 6) {
        audioRef.current.play().catch(() => {});
      }
    };
    window.addEventListener("click", unlockAudio);
    window.addEventListener("keydown", unlockAudio);
    return () => {
      window.removeEventListener("click", unlockAudio);
      window.removeEventListener("keydown", unlockAudio);
    };
  }, [chapter]);

  // Handle Chapter 6 fade out logic
  useEffect(() => {
    if (chapter === 6) {
      const fadeTimer = setTimeout(() => {
        if (!audioRef.current) return;
        let vol = audioRef.current.volume;
        const fadeInterval = setInterval(() => {
          if (vol > 0.05) {
            vol -= 0.05;
            if (audioRef.current) audioRef.current.volume = vol;
          } else {
            clearInterval(fadeInterval);
            if (audioRef.current) {
              audioRef.current.volume = 0;
              audioRef.current.pause();
            }
          }
        }, 150); // fades out over roughly 1.5 seconds
      }, 5000); // starts fade 5 seconds into chapter 6
      return () => clearTimeout(fadeTimer);
    } else if (chapter === 1 && audioRef.current) {
      // Restore volume if the story is restarted
      audioRef.current.volume = 0.5;
      audioRef.current.play().catch(() => {});
    }
  }, [chapter]);

  const goTo = useCallback(
    (target: number) => {
      if (transitioning) return;
      setTransitionDir("out");
      setTransitioning(true);
      setTimeout(() => {
        setChapter(target);
        setTransitionDir("in");
        setTimeout(() => setTransitioning(false), 700);
      }, 700);
    },
    [transitioning]
  );

  const next = useCallback(() => {
    if (chapter < TOTAL_CHAPTERS) goTo(chapter + 1);
  }, [chapter, goTo]);

  const restart = useCallback(() => goTo(1), [goTo]);

  // keyboard arrow support
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [next]);

  const chapterTitles = [
    "The Envelope",
    "The Sky Full of Secrets",
    "Our Moments",
    "Make a Wish",
    "The Mystery Gift",
    "Here's to You, Bavi",
  ];

  return (
    <div className={styles.root}>
      {/* ── Ambient background particles ── */}
      <AmbientParticles />

      {/* ── Chapter indicator ── */}
      <div className={styles.chapterBadge}>
        <button
          className={styles.restartBtn}
          onClick={restart}
          title="Back to Chapter 1"
          aria-label="Restart story"
        >
          ↺
        </button>
        <span className={styles.chapterLabel}>
          Chapter {chapter} of {TOTAL_CHAPTERS}
        </span>
        <span className={styles.chapterName}>{chapterTitles[chapter - 1]}</span>
      </div>

      {/* ── Progress dots ── */}
      <div className={styles.progressDots}>
        {Array.from({ length: TOTAL_CHAPTERS }).map((_, i) => (
          <div
            key={i}
            className={`${styles.dot} ${i + 1 === chapter ? styles.dotActive : ""} ${
              i + 1 < chapter ? styles.dotDone : ""
            }`}
          />
        ))}
      </div>

      {/* ── Chapter stage ── */}
      <div
        className={`${styles.stage} ${
          transitioning
            ? transitionDir === "out"
              ? styles.fadeOut
              : styles.fadeIn
            : styles.visible
        }`}
      >
        {chapter === 1 && <Chapter1Envelope onNext={next} />}
        {chapter === 2 && <Chapter2Balloons onNext={next} />}
        {chapter === 3 && <Chapter3Memories onNext={next} />}
        {chapter === 4 && <Chapter4Cake onNext={next} />}
        {chapter === 5 && <Chapter5Wheel onNext={next} />}
        {chapter === 6 && <Chapter6Finale onRestart={restart} />}
      </div>
    </div>
  );
}
