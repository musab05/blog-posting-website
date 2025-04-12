import { useRef, useState } from 'react';
import { Play, Pause, Volume2, VolumeX, Expand } from 'lucide-react';

export default function VideoPlayer({ videoUrl }) {
  const videoRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [volume, setVolume] = useState(1);
  const [progress, setProgress] = useState(0);

  const togglePlay = () => {
    if (videoRef.current.paused) {
      videoRef.current.play();
      setPlaying(true);
    } else {
      videoRef.current.pause();
      setPlaying(false);
    }
  };

  const handleVolume = e => {
    let vol = e.target.value;
    videoRef.current.volume = vol;
    setVolume(vol);
  };

  const handleTimeUpdate = () => {
    const progress =
      (videoRef.current.currentTime / videoRef.current.duration) * 100;
    setProgress(progress);
  };

  const handleSeek = e => {
    const seekTime = (e.target.value / 100) * videoRef.current.duration;
    videoRef.current.currentTime = seekTime;
    setProgress(e.target.value);
  };

  return (
    <div className="relative w-full max-w-3xl mx-auto bg-black rounded-lg overflow-hidden">
      <video
        ref={videoRef}
        src={videoUrl}
        onTimeUpdate={handleTimeUpdate}
        className="w-full h-auto"
      />

      {/* Controls Overlay */}
      <div className="absolute bottom-0 left-0 w-full p-3 bg-black/50 flex items-center gap-3">
        {/* Play/Pause Button */}
        <button onClick={togglePlay} className="text-white">
          {playing ? <Pause size={24} /> : <Play size={24} />}
        </button>

        {/* Seek Bar */}
        <input
          type="range"
          value={progress}
          onChange={handleSeek}
          className="flex-grow h-1 bg-gray-300 rounded-lg cursor-pointer"
        />

        {/* Volume Control */}
        <button
          onClick={() => setVolume(volume === 0 ? 1 : 0)}
          className="text-white"
        >
          {volume === 0 ? <VolumeX size={24} /> : <Volume2 size={24} />}
        </button>
        <input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={volume}
          onChange={handleVolume}
          className="w-16 h-1 bg-gray-300 rounded-lg cursor-pointer"
        />

        {/* Fullscreen Button */}
        <button
          onClick={() => videoRef.current.requestFullscreen()}
          className="text-white"
        >
          <Expand size={24} />
        </button>
      </div>
    </div>
  );
}
