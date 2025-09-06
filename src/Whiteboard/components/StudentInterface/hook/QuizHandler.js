import { useCallback } from "react";

const useQuizHandler = ({
  quizAnswer,
  setResultPoll,
  setPollResult,
  setIsCorrect,
}) => {
  const handleStudentAnswer = useCallback(
    (selectedAnswer) => {
      if (selectedAnswer === quizAnswer) {
        setResultPoll("Congrats You Have Answered Correctly");
      } else {
        setResultPoll("Oops wrong answer, better luck next time");
      }
      setPollResult(true);

      setTimeout(() => {
        setPollResult(false);
        setResultPoll("");
        setIsCorrect(null);
      }, 7000);
    },
    [quizAnswer, setResultPoll, setPollResult, setIsCorrect]
  );

  return handleStudentAnswer;
};

export default useQuizHandler;
