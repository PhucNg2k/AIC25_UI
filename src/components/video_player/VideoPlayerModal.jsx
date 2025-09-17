import { useEffect, useRef, useState, useMemo } from "react";
import {
  getMetadataKey,
  getFrameIdx,
  getVideoFPS,
  getPTStime,
} from "../../utils/metadata";
import "../../styles/VideoPlayerModal.css";
import VideoNavigationButton from "./VideoNavigationButton";
import { getWatchUrl } from "../../utils/videoIndex";

// const BASE_DATA_PATH = "/REAL_DATA/Data";
// helper: normalize to an embeddable URL
function extractYouTubeId(input) {
  if (!input) return null;
  try {
    const u = new URL(input);
    let id = null;

    if (u.hostname.includes("youtu.be")) {
      id = u.pathname.slice(1);
    } else if (u.searchParams.get("v")) {
      id = u.searchParams.get("v");
    }
    if (!id) return null;

    // strip any extras that can confuse the embed
    return id.split("?")[0].split("&")[0];
  } catch {
    return null;
  }
}

function toYouTubeEmbedUrl(input) {
  const id = extractYouTubeId(input);
  if (!id) return null;

  return `https://www.youtube.com/embed/${id}`;
}

let ytApiPromise = null;

function loadYouTubeIframeAPI() {
  if (typeof window === "undefined") {
    return Promise.reject(new Error("YouTube API unavailable during SSR"));
  }

  if (window.YT && typeof window.YT.Player === "function") {
    return Promise.resolve(window.YT);
  }

  if (ytApiPromise) {
    return ytApiPromise;
  }

  ytApiPromise = new Promise((resolve, reject) => {
    const previousCallback = window.onYouTubeIframeAPIReady;

    window.onYouTubeIframeAPIReady = () => {
      if (typeof previousCallback === "function") {
        previousCallback();
      }
      if (window.YT && typeof window.YT.Player === "function") {
        resolve(window.YT);
      } else {
        reject(new Error("YouTube API failed to initialize"));
      }
    };

    const script = document.createElement("script");
    script.src = "https://www.youtube.com/iframe_api";
    script.async = true;
    script.onerror = () => {
      ytApiPromise = null;
      reject(new Error("Failed to load YouTube API script"));
    };

    document.head.appendChild(script);
  });

  return ytApiPromise;
}

function VideoPlayerModal({
  frameData,
  currentIndex,
  currentFramesList,
  onClose,
  onNavigate,
  onSubmitFrame,
}) {
  // const videoRef = useRef(null);
  const { video_name, frame_idx, score } = frameData;

  const playerRef = useRef(null);
  const playerContainerRef = useRef(null);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playerReady, setPlayerReady] = useState(false);

  // const watchUrl = useMemo(() => getWatchUrl(video_name), [video_name]);

  const [watchUrl, setWatchUrl] = useState(null);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const u = await getWatchUrl(video_name); // returns string
      if (!cancelled) setWatchUrl(u || null);
    })();
    return () => {
      cancelled = true;
    };
  }, [video_name]);

  // Metadata key
  const metaKey = getMetadataKey(video_name, frame_idx);
  const vidFps = getVideoFPS(metaKey);
  const targetTime = getPTStime(metaKey);
  const currentFrameIdx = getFrameIdx(metaKey);

  const [embedFailed, setEmbedFailed] = useState(false);

  const embedUrl = useMemo(() => toYouTubeEmbedUrl(watchUrl), [watchUrl]);
  const videoId = useMemo(() => extractYouTubeId(watchUrl), [watchUrl]);

  // track current frame number by polling current time from the YouTube iframe player
  useEffect(() => {
    const id = setInterval(() => {
      const t = playerRef.current?.getCurrentTime?.();
      if (typeof t === "number" && !Number.isNaN(t)) {
        setCurrentFrame(Math.floor(t * vidFps));
      }
    }, 200);
    return () => clearInterval(id);
  }, [vidFps]);

  useEffect(() => {
    setCurrentFrame(Math.floor(currentFrameIdx));
  }, [currentFrameIdx]);

  useEffect(() => {
    const containerEl = playerContainerRef.current;

    if (!videoId || !containerEl) {
      return undefined;
    }

    let cancelled = false;
    setEmbedFailed(false);
    setPlayerReady(false);
    setIsPlaying(false);

    loadYouTubeIframeAPI()
      .then((YT) => {
        if (cancelled || !containerEl) return;

        playerRef.current?.destroy?.();

        const player = new YT.Player(containerEl, {
          videoId,
          width: "100%",
          height: "100%",
          playerVars: {
            start: Math.max(0, Math.floor(targetTime)),
            rel: 0,
            modestbranding: 1,
            playsinline: 1,
            origin: window.location.origin,
          },
          events: {
            onReady: (event) => {
              if (cancelled) return;
              setPlayerReady(true);
              playerRef.current = event.target;
              event.target.seekTo(targetTime, true);
              setCurrentFrame(Math.floor(targetTime * vidFps));
            },
            onStateChange: (event) => {
              if (cancelled) return;
              const state = event.data;
              const { PlayerState } = window.YT || {};
              if (state === PlayerState?.PLAYING) {
                setIsPlaying(true);
              } else if (
                state === PlayerState?.PAUSED ||
                state === PlayerState?.ENDED ||
                state === PlayerState?.CUED
              ) {
                setIsPlaying(false);
              }
            },
            onError: () => {
              if (cancelled) return;
              setEmbedFailed(true);
            },
          },
        });

        playerRef.current = player;
      })
      .catch(() => {
        if (!cancelled) {
          setEmbedFailed(true);
        }
      });

    return () => {
      cancelled = true;
      playerRef.current?.destroy?.();
      playerRef.current = null;
      if (containerEl) {
        containerEl.innerHTML = "";
      }
    };
  }, [videoId, targetTime, vidFps]);

  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [onClose]);

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  const handlePlayPause = () => {
    const player = playerRef.current;
    if (!player) return;

    const state = player.getPlayerState?.();
    const { PlayerState } = window.YT || {};

    if (state === PlayerState?.PLAYING) {
      player.pauseVideo?.();
    } else {
      player.playVideo?.();
    }
  };

  const handleSeekToFrame = () => {
    const player = playerRef.current;
    if (!player) return;

    player.seekTo?.(targetTime, true);
    player.pauseVideo?.();
    setIsPlaying(false);
  };
  const handlePrevFrame = () => {
    onNavigate(-1);
    // Don't call onClose() - let VideoPlayerPanel handle the transition
  };

  const handleNextFrame = () => {
    onNavigate(1);
    // Don't call onClose() - let VideoPlayerPanel handle the transition
  };

  const canNavigatePrev = currentIndex > 0;
  const canNavigateNext = currentIndex < currentFramesList.length - 1;

  const handleSubmitFrame = () => {
    const t = playerRef.current?.getCurrentTime?.();
    if (typeof t === "number" && !Number.isNaN(t)) {
      const currentFrameNumber = Math.floor(t * vidFps);
      onSubmitFrame({ video_name, frame_idx: currentFrameNumber });
    }
  };

  return (
    <div className="video-player-modal" onClick={handleBackdropClick}>
      <div
        className="video-player-content"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="video-player-header">
          <h3 className="video-player-title">
            {video_name} - #{currentFrameIdx} ({currentIndex + 1}/
            {currentFramesList.length})
          </h3>
          <button className="close-player-btn" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="video-player-container">
          <div className="video-player-panel">
            <VideoNavigationButton
              direction="prev"
              onClick={handlePrevFrame}
              disabled={!canNavigatePrev}
            />

            {/* Player wrapper with guaranteed height */}
            <div className="player-wrapper">
              {embedUrl && !embedFailed ? (
                <>
                  <div className="player-frame" ref={playerContainerRef} />
                  {!playerReady && (
                    <div className="player-loading-overlay">
                      <span className="player-loading-spinner" />
                      <span>Loading video…</span>
                    </div>
                  )}
                </>
              ) : embedFailed ? (
                <div className="player-fallback">
                  <p>Video unavailable in the embedded player.</p>
                  {watchUrl && (
                    <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                      Open in YouTube
                    </a>
                  )}
                </div>
              ) : (
                <div className="player-loading-overlay">
                  <span className="player-loading-spinner" />
                  <span>Loading video…</span>
                </div>
              )}
            </div>

            <VideoNavigationButton
              direction="next"
              onClick={handleNextFrame}
              disabled={!canNavigateNext}
            />
          </div>

          <div className="video-player-info">
            <div className="frame-info-display">
              <span className="current-frame">
                Current Frame: <strong>{currentFrame}</strong>
              </span>
              <span className="target-frame">
                Search Result Frame: <strong>{currentFrameIdx}</strong>
              </span>
              <span className="similarity-display">
                Search Score:{" "}
                <strong>
                  {(typeof score === "number" ? score : 0).toFixed(2)}%
                </strong>
              </span>
            </div>

            <div className="video-controls-custom">
              <div className="controls-left">
                <button
                  className="seek-to-frame-btn"
                  onClick={handleSeekToFrame}
                >
                  🎯 Jump to Frame
                </button>
                <button className="play-pause-btn" onClick={handlePlayPause}>
                  ⏯️ {isPlaying ? "Pause" : "Play"}
                </button>
              </div>

              <div className="controls-right">
                <button
                  className="submit-frame-btn"
                  onClick={handleSubmitFrame}
                >
                  📌 Submit Current Frame
                </button>
              </div>
            </div>
            {watchUrl && !embedFailed && (
              <div className="player-external-link">
                <a href={watchUrl} target="_blank" rel="noopener noreferrer">
                  Open video in new tab
                </a>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default VideoPlayerModal;
