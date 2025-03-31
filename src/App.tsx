import { useState } from "react";
import "./App.css";
import questions from "./questions/questions.json";

interface Question {
  question: string;
  answers: string[];
  correctAnswers: number[];
}

type Mode = "standard" | "random"; // Тип для режимов

const numberOfQuestions = 50;

function App() {
  // Основные состояния для стандартного режима
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState<number[]>([]);
  const [showNextButton, setShowNextButton] = useState(false);
  const [score, setScore] = useState(0);
  const [showHint, setShowHint] = useState(false);
  const [showHintContent, setShowHintContent] = useState(false);
  const [attempts, setAttempts] = useState(0); // Добавляем счетчик попыток

  // Состояния для режима случайных 10 вопросов
  const [randomQuestions, setRandomQuestions] = useState<Question[]>([]);
  const [randomScore, setRandomScore] = useState(0);
  const [randomAnsweredCorrectly, setRandomAnsweredCorrectly] = useState(0);
  const [randomQuestionIndex, setRandomQuestionIndex] = useState(0);

  // Режим квиза
  const [mode, setMode] = useState<Mode>("standard");

  // Функция для выбора случайных вопросов
  const getRandomQuestions = () => {
    let shuffled = [...questions].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, numberOfQuestions);
  };

  // Переключение режима
  const switchMode = (newMode: Mode) => {
    if (newMode === "random") {
      // Запускаем новый случайный тест
      setRandomQuestions(getRandomQuestions());
      setRandomScore(0);
      setRandomAnsweredCorrectly(0);
      setRandomQuestionIndex(0);
      setSelectedAnswers([]);
      setShowNextButton(false);
      setShowHint(false);
      setShowHintContent(false);
      setAttempts(0);
    }
    setMode(newMode);
  };

  // Получаем текущий вопрос в зависимости от режима
  const currentQuestion =
    mode === "standard"
      ? questions[currentQuestionIndex]
      : randomQuestions[randomQuestionIndex];

  // Обработчик выбора ответа
  const handleAnswerSelect = (answerIndex: number) => {
    if (selectedAnswers.includes(answerIndex)) {
      setSelectedAnswers(selectedAnswers.filter((i) => i !== answerIndex));
    } else {
      setSelectedAnswers([...selectedAnswers, answerIndex]);
    }
  };

  // Проверка ответа
  const checkAnswer = () => {
    setAttempts(attempts + 1);
    
    const isCorrect =
      selectedAnswers.length === currentQuestion.correctAnswers.length &&
      selectedAnswers.every((answer) =>
        currentQuestion.correctAnswers.includes(answer)
      );

    if (isCorrect) {
      setShowNextButton(true);
      setShowHint(false);
      setShowHintContent(false);

      if (mode === "standard") {
        setScore(score + 1);
      } else {
        setRandomScore(randomScore + 1);
        // Увеличиваем счетчик правильных ответов только если это первая попытка
        if (attempts === 0) {
          setRandomAnsweredCorrectly(randomAnsweredCorrectly + 1);
        }
      }
    } else {
      setSelectedAnswers([]);
      setShowHint(true);
    }
  };

  // Следующий вопрос
  const nextQuestion = () => {
    if (mode === "standard") {
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(currentQuestionIndex + 1);
      }
    } else {
      // if (randomQuestionIndex < numberOfQuestions - 1) {
      //   setRandomQuestionIndex(randomQuestionIndex + 1);
      // }
      setRandomQuestionIndex(randomQuestionIndex + 1);
    }
    setSelectedAnswers([]);
    setShowNextButton(false);
    setShowHint(false);
    setShowHintContent(false);
    setAttempts(0);
  };

  // Подсчёт оценки в случайном режиме
  const getFinalScore = () => {
    return Math.round((randomAnsweredCorrectly / (numberOfQuestions)) * 100);
  };

  return (
    <div className="quiz-container">
      {/* Кнопки смены режима */}
      <div style={{ marginBottom: "1rem" }}>
        <button
          onClick={() => switchMode("standard")}
          disabled={mode === "standard"}
          style={{ 
            marginRight: "1rem",
            backgroundColor: mode === "standard" ? "#4CAF50" : "#e0e0e0",
            color: mode === "standard" ? "white" : "black",
            opacity: 1
          }}
        >
          Подряд
        </button>
        <button 
          onClick={() => switchMode("random")} 
          disabled={mode === "random"}
          style={{
            backgroundColor: mode === "random" ? "#4CAF50" : "#e0e0e0",
            color: mode === "random" ? "white" : "black",
            opacity: 1
          }}
        >
          Квиз
        </button>
      </div>

      {/* Статистика для режима случайных вопросов */}
      {mode === "random" && randomQuestionIndex < numberOfQuestions && (
        <div style={{ marginBottom: "1rem", fontSize: "1.1rem" }}>
          <p>Правильных ответов с первого раза: {randomAnsweredCorrectly} из {randomQuestionIndex + 1} ({Math.round((randomAnsweredCorrectly / (randomQuestionIndex + 1)) * 100)}%)</p>
        </div>
      )}

      {mode === "random" && randomQuestionIndex === numberOfQuestions ? (
        // Экран результата для случайного режима
        <div className="result-screen">
          <h2>Тест завершен!</h2>
          <p>Правильных ответов с первого раза: {randomAnsweredCorrectly} из {numberOfQuestions}</p>
          <p>Ваша оценка: {getFinalScore()}%</p>
          <button onClick={() => switchMode("standard")}>Вернуться в обычный режим</button>
        </div>
      ) : (
        // Экран вопросов
        <div className="question-card">
          {/* <h2>
            Вопрос{" "}
            {mode === "standard"
              ? `${currentQuestionIndex + 1} из ${questions.length}`
              : `${randomQuestionIndex + 1} из ${numberOfQuestions}`}
          </h2> */}
          <p style={{ fontSize: "1.2rem", fontWeight: 500 }}>
            ({mode === "standard"
              ? `${currentQuestionIndex + 1} из ${questions.length}`
              : `${randomQuestionIndex + 1} из ${numberOfQuestions}`}) {currentQuestion.question}
          </p>

          <div
            className="answers"
            style={{ display: "flex", flexDirection: "column", gap: "1rem" }}
          >
            {currentQuestion.answers.map((answer, index) => (
              <label
                key={index}
                className="answer-option"
                style={{
                  fontSize: "1.1rem",
                  display: "flex",
                  alignItems: "center", // Изменено с center на flex-start
                  gap: "0.5rem",
                }}
              >
                <input
                  type={"checkbox"}
                  checked={selectedAnswers.includes(index)}
                  onChange={() => handleAnswerSelect(index)}
                  style={{ 
                    // width: "20px", 
                    // height: "20px",
                    minWidth: "20px",
                    minHeight: "20px",
                  }}
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
                {mode === "standard" && currentQuestionIndex === questions.length - 1
                  ? "Завершить"
                  : mode === "random" && randomQuestionIndex === numberOfQuestions - 1
                  ? "Завершить"
                  : "Следующий вопрос"}
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
