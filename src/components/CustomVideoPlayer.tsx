import { useCallback, useEffect, useRef, useState } from "react";
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  SkipForward,
  FastForward,
  Rewind,
  Monitor,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export type VideoSource = { label: string; src: string };

export type CustomVideoPlayerProps = {
  sources: VideoSource[];
  poster?: string | null;
  subtitleUrl?: string | null;
  /** Persistent key for resume + progress in localStorage */
  storageKey?: string;
  openingSkipSeconds?: number;
  endingSkipSeconds?: number;
  className?: string;
};

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

function fmt(t: number) {
  if (!Number.isFinite(t) || t < 0) t = 0;
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = Math.floor(t % 60);
  const mm = String(m).padStart(2, "0");
  const ss = String(s).padStart(2, "0");
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
}

export function CustomVideoPlayer({
  sources,
  poster,
  subtitleUrl,
  storageKey,
  openingSkipSeconds = 85,
  endingSkipSeconds = 85,
  className,
}: CustomVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const hideTimer = useRef<number | null>(null);
  const lastTapRef = useRef<{ time: number; x: number } | null>(null);
  const saveTimer = useRef<number | null>(null);

  const [qualityIdx, setQualityIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [muted, setMuted] = useState(false);
  const [volume, setVolume] = useState(1);
  const [current, setCurrent] = useState(0);
  const [duration, setDuration] = useState(0);
  const [fullscreen, setFullscreen] = useState(false);
  const [theater, setTheater] = useState(false);
  const [showControls, setShowControls] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  const [speed, setSpeed] = useState(1);
  const [resumePrompt, setResumePrompt] = useState<number | null>(null);

  const activeSrc = sources[qualityIdx]?.src ?? sources[0]?.src ?? "";

  // restore resume position
  useEffect(() => {
    if (!storageKey) return;
    try {
      const raw = localStorage.getItem(`axelsub:progress:${storageKey}`);
      if (raw) {
        const t = parseFloat(raw);
        if (Number.isFinite(t) && t > 10) setResumePrompt(t);
      }
    } catch {}
  }, [storageKey]);

  // keep currentTime when switching quality
  const switchQuality = (idx: number) => {
    const v = videoRef.current;
    const wasPlaying = v && !v.paused;
    const t = v?.currentTime ?? 0;
    setQualityIdx(idx);
    setShowSettings(false);
    requestAnimationFrame(() => {
      const nv = videoRef.current;
      if (!nv) return;
      const onLoaded = () => {
        nv.currentTime = t;
        if (wasPlaying) nv.play().catch(() => {});
        nv.removeEventListener("loadedmetadata", onLoaded);
      };
      nv.addEventListener("loadedmetadata", onLoaded);
    });
  };

  const togglePlay = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    if (v.paused) v.play().catch(() => {});
    else v.pause();
  }, []);

  const seekBy = useCallback((delta: number) => {
    const v = videoRef.current;
    if (!v) return;
    v.currentTime = Math.max(0, Math.min((v.duration || 0), v.currentTime + delta));
  }, []);

  const toggleMute = useCallback(() => {
    const v = videoRef.current;
    if (!v) return;
    v.muted = !v.muted;
    setMuted(v.muted);
  }, []);

  const toggleFullscreen = useCallback(async () => {
    const el = containerRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      await el.requestFullscreen?.().catch(() => {});
    } else {
      await document.exitFullscreen?.().catch(() => {});
    }
  }, []);

  // wire up video events
  useEffect(() => {
    const v = videoRef.current;
    if (!v) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    const onTime = () => {
      setCurrent(v.currentTime);
      if (!storageKey) return;
      if (saveTimer.current) return;
      saveTimer.current = window.setTimeout(() => {
        try {
          if (v.currentTime > 5 && v.duration && v.currentTime < v.duration - 15) {
            localStorage.setItem(`axelsub:progress:${storageKey}`, String(v.currentTime));
          } else if (v.duration && v.currentTime >= v.duration - 15) {
            localStorage.removeItem(`axelsub:progress:${storageKey}`);
          }
        } catch {}
        saveTimer.current = null;
      }, 2000);
    };
    const onLoaded = () => setDuration(v.duration || 0);
    const onVol = () => {
      setMuted(v.muted);
      setVolume(v.volume);
    };
    v.addEventListener("play", onPlay);
    v.addEventListener("pause", onPause);
    v.addEventListener("timeupdate", onTime);
    v.addEventListener("loadedmetadata", onLoaded);
    v.addEventListener("volumechange", onVol);
    return () => {
      v.removeEventListener("play", onPlay);
      v.removeEventListener("pause", onPause);
      v.removeEventListener("timeupdate", onTime);
      v.removeEventListener("loadedmetadata", onLoaded);
      v.removeEventListener("volumechange", onVol);
    };
  }, [storageKey, activeSrc]);

  // fullscreen state listener
  useEffect(() => {
    const onFs = () => setFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", onFs);
    return () => document.removeEventListener("fullscreenchange", onFs);
  }, []);

  // playback rate
  useEffect(() => {
    if (videoRef.current) videoRef.current.playbackRate = speed;
  }, [speed, activeSrc]);

  // keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;
      if (e.code === "Space") {
        e.preventDefault();
        togglePlay();
      } else if (e.code === "ArrowRight") {
        seekBy(5);
      } else if (e.code === "ArrowLeft") {
        seekBy(-5);
      } else if (e.key.toLowerCase() === "m") {
        toggleMute();
      } else if (e.key.toLowerCase() === "f") {
        toggleFullscreen();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [togglePlay, seekBy, toggleMute, toggleFullscreen]);

  // auto-hide controls
  const bumpControls = () => {
    setShowControls(true);
    if (hideTimer.current) window.clearTimeout(hideTimer.current);
    hideTimer.current = window.setTimeout(() => {
      if (videoRef.current && !videoRef.current.paused) setShowControls(false);
    }, 2600);
  };

  // double tap to seek (mobile)
  const handleTap = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === "mouse") return;
    const now = performance.now();
    const rect = (e.currentTarget as HTMLDivElement).getBoundingClientRect();
    const x = e.clientX - rect.left;
    const prev = lastTapRef.current;
    if (prev && now - prev.time < 300 && Math.abs(prev.x - x) < 60) {
      const side = x > rect.width / 2 ? 1 : -1;
      seekBy(side * 10);
      lastTapRef.current = null;
    } else {
      lastTapRef.current = { time: now, x };
    }
  };

  const onSeekBar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v || !v.duration) return;
    v.currentTime = (Number(e.target.value) / 1000) * v.duration;
  };

  const onVolume = (e: React.ChangeEvent<HTMLInputElement>) => {
    const v = videoRef.current;
    if (!v) return;
    const val = Number(e.target.value);
    v.volume = val;
    v.muted = val === 0;
  };

  const acceptResume = () => {
    const v = videoRef.current;
    if (v && resumePrompt) v.currentTime = resumePrompt;
    setResumePrompt(null);
    v?.play().catch(() => {});
  };

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden rounded-xl border border-border bg-black ${
        theater ? "max-w-none" : ""
      } ${className ?? ""}`}
      onMouseMove={bumpControls}
      onPointerDown={handleTap}
    >
      <video
        ref={videoRef}
        src={activeSrc}
        poster={poster ?? undefined}
        playsInline
        // @ts-expect-error - iOS Safari legacy attribute
        webkit-playsinline="true"
        x5-playsinline="true"
        preload="metadata"
        className="aspect-video w-full bg-black"
        onClick={togglePlay}
      >
        {subtitleUrl && (
          <track kind="subtitles" srcLang="hu" label="Magyar" src={subtitleUrl} default />
        )}
      </video>

      {/* Resume prompt */}
      {resumePrompt != null && (
        <div className="absolute left-3 top-3 z-30 flex items-center gap-2 rounded-lg bg-background/90 px-3 py-2 text-xs shadow-lg backdrop-blur">
          <span>Folytatás innen: {fmt(resumePrompt)}?</span>
          <Button size="sm" className="h-7" onClick={acceptResume}>Folytat</Button>
          <Button size="sm" variant="outline" className="h-7" onClick={() => setResumePrompt(null)}>
            Elölről
          </Button>
        </div>
      )}

      {/* Center play overlay */}
      {!playing && (
        <button
          type="button"
          onClick={togglePlay}
          className="absolute inset-0 z-10 flex items-center justify-center"
          aria-label="Lejátszás"
        >
          <span className="rounded-full bg-primary/90 p-4 text-primary-foreground shadow-2xl transition-transform hover:scale-105">
            <Play className="h-8 w-8" />
          </span>
        </button>
      )}

      {/* Controls bar */}
      <div
        className={`pointer-events-none absolute inset-x-0 bottom-0 z-20 bg-gradient-to-t from-black/90 via-black/40 to-transparent px-3 pb-2 pt-10 transition-opacity ${
          showControls || !playing ? "opacity-100" : "opacity-0"
        }`}
      >
        <div className="pointer-events-auto">
          {/* progress */}
          <input
            type="range"
            min={0}
            max={1000}
            value={duration ? Math.floor((current / duration) * 1000) : 0}
            onChange={onSeekBar}
            aria-label="Idősáv"
            className="h-1.5 w-full cursor-pointer appearance-none rounded-full bg-white/20 accent-primary [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary"
          />

          <div className="mt-1 flex flex-wrap items-center gap-2 text-white">
            <button onClick={togglePlay} className="p-1.5 hover:text-primary" aria-label="Play/Pause">
              {playing ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
            </button>
            <button onClick={() => seekBy(-10)} className="p-1.5 hover:text-primary" aria-label="-10s">
              <Rewind className="h-5 w-5" />
            </button>
            <button onClick={() => seekBy(10)} className="p-1.5 hover:text-primary" aria-label="+10s">
              <FastForward className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-1.5">
              <button onClick={toggleMute} className="p-1.5 hover:text-primary" aria-label="Némítás">
                {muted || volume === 0 ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
              </button>
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={muted ? 0 : volume}
                onChange={onVolume}
                aria-label="Hangerő"
                className="hidden h-1 w-20 cursor-pointer appearance-none rounded-full bg-white/30 accent-primary sm:block"
              />
            </div>

            <span className="ml-1 text-xs tabular-nums opacity-80">
              {fmt(current)} / {fmt(duration)}
            </span>

            <div className="ml-auto flex items-center gap-1">
              <button
                onClick={() => seekBy(openingSkipSeconds)}
                className="rounded-md border border-white/30 px-2 py-1 text-xs hover:bg-white/10"
                title={`Opening kihagyása (+${openingSkipSeconds}s)`}
              >
                <span className="inline-flex items-center gap-1">
                  <SkipForward className="h-3.5 w-3.5" /> Opening
                </span>
              </button>
              <button
                onClick={() => seekBy(endingSkipSeconds)}
                className="rounded-md border border-white/30 px-2 py-1 text-xs hover:bg-white/10"
                title={`Ending kihagyása (+${endingSkipSeconds}s)`}
              >
                <span className="inline-flex items-center gap-1">
                  <SkipForward className="h-3.5 w-3.5" /> Ending
                </span>
              </button>

              <button
                onClick={() => setTheater((t) => !t)}
                className="hidden p-1.5 hover:text-primary sm:block"
                aria-label="Mozi mód"
                title="Mozi mód"
              >
                <Monitor className="h-5 w-5" />
              </button>

              <div className="relative">
                <button
                  onClick={() => setShowSettings((s) => !s)}
                  className="p-1.5 hover:text-primary"
                  aria-label="Beállítások"
                >
                  <Settings className="h-5 w-5" />
                </button>
                {showSettings && (
                  <div className="absolute bottom-9 right-0 z-30 w-44 rounded-md border border-border bg-popover p-2 text-popover-foreground shadow-xl">
                    <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      Minőség
                    </div>
                    {sources.map((s, i) => (
                      <button
                        key={s.label + i}
                        onClick={() => switchQuality(i)}
                        className={`block w-full rounded px-2 py-1 text-left text-xs hover:bg-accent ${
                          i === qualityIdx ? "text-primary" : ""
                        }`}
                      >
                        {s.label}
                      </button>
                    ))}
                    <div className="my-1 border-t border-border" />
                    <div className="mb-1 px-1 text-[10px] font-semibold uppercase tracking-wide opacity-70">
                      Sebesség
                    </div>
                    <div className="grid grid-cols-3 gap-1">
                      {SPEEDS.map((sp) => (
                        <button
                          key={sp}
                          onClick={() => setSpeed(sp)}
                          className={`rounded px-1 py-1 text-xs hover:bg-accent ${
                            sp === speed ? "text-primary" : ""
                          }`}
                        >
                          {sp}x
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="p-1.5 hover:text-primary" aria-label="Fullscreen">
                {fullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}