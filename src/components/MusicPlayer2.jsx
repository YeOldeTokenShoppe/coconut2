import React, { useState, useRef, useEffect } from "react";

const MusicPlayer = ({ isVisible }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrackIndex, setCurrentTrackIndex] = useState(0);
  const [currentTime, setCurrentTime] = useState("00:00");
  const [duration, setDuration] = useState("00:00");
  const [playProgress, setPlayProgress] = useState(0);
  const audioRef = useRef(null);
  const [volume, setVolume] = useState(1);

  const albums = [
    "Like A Prayer - Madonna",
    "Every 1's A Winner",
    "Take Me To Church - Hozier",
  ];
  const trackNames = [
    "Like A Prayer - Madonna",
    "Every 1's A Winner - Hot Chocolate",
    "Take Me To Church - Hozier",
  ];
  const trackUrls = ["likeAPrayer.m4a", "/every1.mp3", "/church.mp3"];

  // Monitor track progress and handle auto-play
  const updateProgress = () => {
    const audio = audioRef.current;
    if (audio) {
      const currentTimeValue = audio.currentTime;
      const durationValue = audio.duration;

      setCurrentTime(formatTime(currentTimeValue));
      setPlayProgress((currentTimeValue / durationValue) * 100);

      // Check if we're near the end of the track (within 0.5 seconds)
      if (durationValue - currentTimeValue <= 0.5 && durationValue > 0) {
        const nextIndex = (currentTrackIndex + 1) % trackUrls.length;
        setCurrentTrackIndex(nextIndex);
      }
    }
  };

  useEffect(() => {
    const audio = new Audio();
    audioRef.current = audio;

    const setupAudio = () => {
      audio.src = trackUrls[currentTrackIndex];
      audio.volume = volume;

      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) => console.error("Playback error:", error));
        }
      }
    };

    setupAudio();

    const handleTimeUpdate = () => updateProgress();
    const handleLoadedMetadata = () => setDuration(formatTime(audio.duration));

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.pause();
      audio.src = "";
    };
  }, [currentTrackIndex]);

  // Handle visibility changes
  useEffect(() => {
    if (audioRef.current) {
      if (isVisible && !isPlaying) {
        const playPromise = audioRef.current.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch((error) =>
              console.error("Visibility playback error:", error)
            );
        }
      } else if (!isVisible && isPlaying) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [isVisible]);

  // Handle play state changes
  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      if (isPlaying) {
        const playPromise = audio.play();
        if (playPromise !== undefined) {
          playPromise.catch((error) =>
            console.error("Play state error:", error)
          );
        }
      } else {
        audio.pause();
      }
    }
  }, [isPlaying]);

  const handleVolumeChange = (e) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins < 10 ? "0" : ""}${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const playPause = () => {
    setIsPlaying(!isPlaying);
  };

  const changeTrack = (direction) => {
    const newIndex =
      (currentTrackIndex + direction + trackUrls.length) % trackUrls.length;
    setCurrentTrackIndex(newIndex);
    setIsPlaying(true);
  };

  const handleSeek = (e) => {
    const audio = audioRef.current;
    if (audio) {
      const seekTime =
        (e.nativeEvent.offsetX / e.target.clientWidth) * audio.duration;
      audio.currentTime = seekTime;
      updateProgress();
    }
  };

  const playPauseIconClass = isPlaying
    ? "fa-solid fa-pause"
    : "fa-solid fa-play";

  return (
    <div className="music-player">
      <div id="app-cover">
        <div id="player">
          <div id="player-track" className={isPlaying ? "active" : ""}>
            <div id="album-name">{albums[currentTrackIndex]}</div>
            <div id="track-name">{trackNames[currentTrackIndex]}</div>
            <div id="track-time">
              <div id="current-time">{currentTime}</div>
              <div id="track-length">{duration}</div>
            </div>
            <div id="s-area" onClick={handleSeek}>
              <div id="seek-bar" style={{ width: `${playProgress}%` }}></div>
            </div>
          </div>
          <div id="player-content">
            <div id="album-art" className={`${isPlaying ? "rotate" : ""}`}>
              <img
                src="/virginRecords.jpg"
                className="active"
                alt="Album Art"
              />
            </div>
            <div id="player-controls">
              <div className="control" onClick={() => changeTrack(-1)}>
                <div className="button" id="play-previous">
                  <i className="fa-solid fa-backward"></i>
                </div>
              </div>
              <div className="control" onClick={playPause}>
                <div className="button" id="play-pause-button">
                  <i className={playPauseIconClass}></i>
                </div>
              </div>
              <div className="control" onClick={() => changeTrack(1)}>
                <div className="button" id="play-next">
                  <i className="fa-solid fa-forward"></i>
                </div>
              </div>
              <div className="control">
                <div
                  className="volume-control"
                  style={{ display: "flex", alignItems: "center" }}
                >
                  <i
                    className={`fa-solid ${
                      volume === 0 ? "fa-volume-mute" : "fa-volume-up"
                    }`}
                    style={{
                      marginRight: "8px",
                      cursor: "pointer",
                      position: "absolute",
                      bottom: "25px",
                      left: "50%",
                    }}
                    onClick={() =>
                      handleVolumeChange({
                        target: { value: volume === 0 ? 1 : 0 },
                      })
                    }
                  />
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={volume}
                    onChange={handleVolumeChange}
                    style={{
                      position: "absolute",
                      bottom: "10px",
                      left: "60%",
                      width: "60px",
                      height: "4px",
                      WebkitAppearance: "none",
                      background: `linear-gradient(to right, #fff ${
                        volume * 100
                      }%, #4a4a4a ${volume * 100}%)`,
                      borderRadius: "2px",
                      cursor: "pointer",
                    }}
                  />
                </div>
              </div>
              <div
                id="current-track-info"
                style={{ textAlign: "center", marginTop: "2.5rem" }}
              >
                {trackNames[currentTrackIndex]}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MusicPlayer;
