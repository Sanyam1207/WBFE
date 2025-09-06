import { useEffect } from "react";
import AudioController from "../AudioController";

const useStudentSleepDetection = ({
  roomID,
  userID,
  audioRef,
  setShowPopup,
  setWakeupIndex,
  emitStudentSleeping,
}) => {
  useEffect(() => {
    const audioController = new AudioController(audioRef);

    const popupInterval = setInterval(() => {
      setShowPopup(true);
      setWakeupIndex((prev) => {
        const newCount = prev + 1;
        if (newCount === 3) {
          audioController.initializeRingAudio();
          audioController.play();
          emitStudentSleeping(userID, roomID);
        }
        return newCount;
      });
    }, 1000 * 60 * 1);

    return () => clearInterval(popupInterval);
  }, [
    roomID,
    userID,
    audioRef,
    setShowPopup,
    setWakeupIndex,
    emitStudentSleeping,
  ]);
};

export default useStudentSleepDetection;
