import { useEffect } from "react";

const useSpacebarHandler = (showPopup, onSpacePress) => {
  useEffect(() => {
    const handleSpacebar = (e) => {
      if (e.code === "Space" || e.keyCode === 32) {
        onSpacePress();
      }
    };

    if (showPopup) {
      window.addEventListener("keydown", handleSpacebar);
    }

    return () => {
      window.removeEventListener("keydown", handleSpacebar);
    };
  }, [showPopup, onSpacePress]);
};

export default useSpacebarHandler;
