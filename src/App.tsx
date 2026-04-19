import { useState } from "react";
import "./App.css";
import questions from "./questions/questions.json";

interface Question {
  question: string;
  answers: string[];
  correctAnswers: number[];
}

type Mode = "standard" | "random";

const numberOfQuestions = 50;

function App() {
  const [mode, setMode] = useState<Mode>("standard");
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);

  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showHintContent, setShowHintContent] = useState(false);
  // attempts for the current question (increments on each "Ответить" click)
  const [currentAttempts, setCurrentAttempts] = useState(0);
  // attempt count recorded for each completed question
  const [questionAttemptHistory, setQuestionAttemptHistory] = useState<number[]>([]);
  const [showEndScreen, setShowEndScreen] = useState(false);

  const getRandomQuestions = (): Question[] =>
    [...(questions as Question[])].sort(() => 0.5 - Math.random()).slice(0, numberOfQuestions);

  const activeQuestions: Question[] =
    mode === "standard" ? (questions as Question[]) : randomQuestions;
  const totalQuestions = activeQuestions.length;
  const currentQuestion = activeQuestions[currentQuestionIndex];

  const correctCount = questionAttemptHistory.filter((a) => a === 1).length;
  const incorrectCount = questionAttemptHistory.filter((a) => a > 1).length;

  const resetSession = (newMode?: Mode) => {
    const targetMode = newMode ?? mode;
    if (newMode !== undefined) setMode(newMode);
    setCurrentQuestionIndex(0);
    setSelectedAnswers([]);
    setShowNextButton(false);
    setShowHint(false);
    setShowHintContent(false);
    setCurrentAttempts(0);
    setQuestionAttemptHistory([]);
    setShowEndScreen(false);
    if (targetMode === "random") {
      setRandomQuestions(getRandomQuestions());
    }
  };

  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswers.includes(answerIndex)) {
      setSelectedAnswers(selectedAnswers.filter((i) => i !== answerIndex));
    } else {
      setSelectedAnswers([...selectedAnswers, answerIndex]);
    }
  };

  const checkAnswer = () => {
    const newAttempts = currentAttempts + 1;
    setCurrentAttempts(newAttempts);

    const isCorrect =
      selectedAnswers.length === currentQuestion.correctAnswers.length &&
      selectedAnswers.every((a) => currentQuestion.correctAnswers.includes(a));

    if (isCorrect) {
      setShowNextButton(true);
      setShowHint(false);
      setShowHintContent(false);
    } else {
      setSelectedAnswers([]);
      setShowHint(true);
    }
  };

  const nextQuestion = () => {
    const newHistory = [...questionAttemptHistory, currentAttempts];
    setQuestionAttemptHistory(newHistory);

    if (currentQuestionIndex >= totalQuestions - 1) {
      setShowEndScreen(true);
    } else {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswers([]);
      setShowNextButton(false);
      setShowHint(false);
      setShowHintContent(false);
      setCurrentAttempts(0);
    }
  };

  const getEndStats = () => {
    if (questionAttemptHistory.length === 0) return [];
    const maxAttempts = Math.max(...questionAttemptHistory);
    return Array.from({ length: maxAttempts }, (_, i) => ({
      attempts: i + 1,
      count: questionAttemptHistory.filter((a) => a === i + 1).length,
    })).filter((s) => s.count > 0);
  };

  const attemptLabel = (n: number) => {
    if (n === 1) return "с первой попытки";
    if (n === 2) return "со второй попытки";
    if (n === 3) return "с третьей попытки";
    return `с ${n}-й попытки`;
  };

  return (
    <div className="quiz-container">
      {/* Mode buttons */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => resetSession("standard")}
          disabled={mode === "standard" && !showEndScreen}
          style={{
            marginRight: "1rem",
            backgroundColor: mode === "standard" ? "#4CAF50" : "#e0e0e0",
            color: mode === "standard" ? "white" : "black",
            opacity: 1,
          }}
        >
          Подряд
        </button>
        <button
          onClick={() => resetSession("random")}
          disabled={mode === "random" && !showEndScreen}
          style={{
            backgroundColor: mode === "random" ? "#4CAF50" : "#e0e0e0",
            color: mode === "random" ? "white" : "black",
            opacity: 1,
          }}
        >
          Квиз
        </button>
      </div>


      {showEndScreen ? (
        <div className="result-screen">
          <h2>Тест завершён!</h2>
          <p style={{ marginBottom: "1.5rem" }}>Всего вопросов: {totalQuestions}</p>
          {getEndStats().map((stat) => (
            <p key={stat.attempts} style={{ margin: "0.4rem 0", fontSize: "1.1rem" }}>
              <strong>{stat.count}</strong> {stat.count === 1 ? "вопрос" : stat.count < 5 ? "вопроса" : "вопросов"} — {attemptLabel(stat.attempts)} ({Math.round((stat.count / totalQuestions) * 100)}%)
            </p>
          ))}
          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.2rem", fontSize: "1rem" }}>
            <span style={{ color: "#4CAF50", fontWeight: 600 }}>✓ Правильно: {correctCount}</span>
            <span style={{ color: "#f44336", fontWeight: 600 }}>✗ Неправильно: {incorrectCount}</span>
          </div>
          <button
            onClick={() => resetSession()}
            style={{ fontSize: "1.1rem", padding: "10px 24px", marginTop: "1.5rem" }}
          >
            Начать заново
          </button>
        </div>
      ) : (
        <div className="question-card">
          <p style={{ fontSize: "1.2rem", fontWeight: 500 }}>
            ({currentQuestionIndex + 1} из {totalQuestions}) {currentQuestion.question}
          </p>

          <div
            className="answers"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {currentQuestion.answers.map((answer, index) => (
              <label
                key={index}
                className="answer-option"
                style={{ fontSize: "1.1rem", display: "flex", alignItems: "center", gap: "0.5rem" }}
              >
                <input
                  type="checkbox"
                  checked={selectedAnswers.includes(index)}
                  onChange={() => handleAnswerSelect(index)}
                  style={{ minWidth: "20px", minHeight: "20px" }}
                />
                {answer}
              </label>
            ))}
          </div>

          {showHint && (
            <div
              onClick={() => setShowHintContent(!showHintContent)}
              style={{
                marginTop: "1rem",
                padding: "1rem",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <p style={{ margin: 0 }}>Нажмите, чтобы увидеть правильные ответы</p>
              {showHintContent && (
                <div style={{ marginTop: "1rem" }}>
                  <p style={{ margin: 0, fontWeight: "bold" }}>Правильные ответы:</p>
                  {currentQuestion.correctAnswers.map((answerIndex) => (
                    <p key={answerIndex} style={{ margin: "0.5rem 0" }}>
                      {currentQuestion.answers[answerIndex]}
                    </p>
                  ))}
                </div>
              )}
            </div>
          )}

          <div style={{ marginTop: "2rem" }}>
            {!showNextButton ? (
              <button
                onClick={checkAnswer}
                disabled={selectedAnswers.length === 0}
                style={{ fontSize: "1.2rem", padding: "12px 24px" }}
              >
                Ответить
              </button>
            ) : (
              <button
                onClick={nextQuestion}
                style={{ fontSize: "1.2rem", padding: "12px 24px" }}
              >
                {currentQuestionIndex === totalQuestions - 1 ? "Завершить" : "Следующий вопрос"}
              </button>
            )}
          </div>

          <div style={{ display: "flex", justifyContent: "center", gap: "2rem", marginTop: "1.2rem", fontSize: "1rem" }}>
            <span style={{ color: "#4CAF50", fontWeight: 600 }}>✓ Правильно: {correctCount}</span>
            <span style={{ color: "#f44336", fontWeight: 600 }}>✗ Неправильно: {incorrectCount}</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
