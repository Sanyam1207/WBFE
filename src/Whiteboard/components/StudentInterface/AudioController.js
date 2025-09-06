import ring from "../../../resources/audio/ring.mp3";

class AudioController {
  constructor(audioRef) {
    this.audioRef = audioRef;
  }

  play() {
    if (this.audioRef.current) {
      this.audioRef.current.play();
    }
  }

  reset() {
    if (this.audioRef.current) {
      this.audioRef.current.pause();
      this.audioRef.current.currentTime = 0;
    }
  }

  initializeRingAudio() {
    this.audioRef.current = new Audio(ring);
  }
}

export default AudioController;
