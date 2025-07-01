import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function TestInterface() {
  const { id } = useParams();
  const [user, setUser] = useState(null);
  const [test, setTest] = useState(null);
  const [answers, setAnswers] = useState({});
  const [currentSectionIdx, setCurrentSectionIdx] = useState(0);
  const [currentQIdx, setCurrentQIdx] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 1 hour in seconds

  useEffect(() => {
    fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/current_user`, {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data));

    fetch(`${import.meta.env.VITE_BACKEND_URL}/tests/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setTest(data);
      })
      .catch((err) => console.error("Failed to fetch test", err));
  }, [id]);

  // ⏲ Timer countdown
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (sec) => {
    const m = Math.floor(sec / 60)
      .toString()
      .padStart(2, "0");
    const s = (sec % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  if (!test || !user) return <div className="p-6">Loading test...</div>;

  const sections = test.sections || [];
  const currentSection = sections[currentSectionIdx];
  const questions = currentSection?.questions || [];
  const currentQuestion = questions[currentQIdx];

  const handleOptionChange = (e) => {
    const key = `${currentSectionIdx}-${currentQIdx}`;
    setAnswers({ ...answers, [key]: e.target.value });
  };

  const nextQuestion = () => {
    if (currentQIdx < questions.length - 1) {
      setCurrentQIdx(currentQIdx + 1);
    } else if (currentSectionIdx < sections.length - 1) {
      setCurrentSectionIdx(currentSectionIdx + 1);
      setCurrentQIdx(0);
    }
  };

  const prevQuestion = () => {
    if (currentQIdx > 0) {
      setCurrentQIdx(currentQIdx - 1);
    } else if (currentSectionIdx > 0) {
      const prevSec = sections[currentSectionIdx - 1];
      setCurrentSectionIdx(currentSectionIdx - 1);
      setCurrentQIdx(prevSec.questions.length - 1);
    }
  };

  const submitTest = async () => {
    const payload = {
      test_id: test.id,
      user_id: user.id,
      responses: answers,
      timestamp: new Date().toISOString(),
    };

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Test submitted successfully!");
      } else {
        alert("Submission failed");
      }
    } catch (err) {
      console.error("❌ Submission error:", err);
    }
  };

  return (
    <div className="flex h-screen">
      {/* Main */}
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        {/* Header */}
        <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
          <div className="font-semibold text-lg">{test.title}</div>
          <div>Time Left: <span className="font-mono">{formatTime(timeLeft)}</span></div>
        </div>

        {/* Section Tabs */}
        <div className="flex border-b text-sm">
          {sections.map((sec, idx) => (
            <button
              key={idx}
              className={`px-4 py-2 border-r ${
                idx === currentSectionIdx ? "bg-primary text-white" : "text-black"
              }`}
              onClick={() => {
                setCurrentSectionIdx(idx);
                setCurrentQIdx(0);
              }}
            >
              {sec.title}
            </button>
          ))}
        </div>

        {/* Question Info */}
        <div className="px-4 py-2 border-b text-sm flex justify-between">
          <div>Question Type: {currentQuestion.question_type || "MCQ"}</div>
          <div>
            +{currentQuestion.positive_marks} / -{currentQuestion.negative_marks}
          </div>
        </div>

        {/* Question Body */}
        <div className="p-6 flex-grow overflow-auto">
          <h2 className="text-lg mb-4">
            Q{currentQIdx + 1}: {currentQuestion.question_text}
          </h2>

          {currentQuestion.question_image && (
            <img
              src={`${import.meta.env.VITE_BACKEND_URL}/uploads/${currentQuestion.question_image}`}
              alt="Question"
              className="mb-4 w-60"
            />
          )}

          <div className="space-y-2">
            {currentQuestion.options.map((opt, idx) => (
              <label key={idx} className="block">
                <input
                  type="radio"
                  name={`q-${currentSectionIdx}-${currentQIdx}`}
                  value={opt}
                  checked={answers[`${currentSectionIdx}-${currentQIdx}`] === opt}
                  onChange={handleOptionChange}
                  className="mr-2"
                />
                {opt}
              </label>
            ))}
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between px-6 py-3 border-t text-sm bg-white">
          <div className="flex gap-4">
            <button onClick={prevQuestion} className="border px-4 py-2 rounded">
              Previous
            </button>
            <button onClick={nextQuestion} className="border px-4 py-2 rounded">
              Save & Next
            </button>
          </div>
          <button onClick={submitTest} className="bg-green-600 text-white px-6 py-2 rounded">
            Submit Test
          </button>
        </div>
      </div>

      {/* Sidebar */}
      <div className="w-80 bg-gray-50 border-l flex flex-col text-base overflow-y-auto">
        <div className="p-4 text-center">
          <img
            src={user.picture || "https://via.placeholder.com/100"}
            className="w-20 h-20 rounded-full mx-auto mb-2"
          />
          <div className="font-semibold text-lg">{user.name}</div>
        </div>

        <div className="bg-primary text-white py-2 text-center font-medium">Questions</div>

        <div className="p-4 grid grid-cols-5 gap-2">
          {questions.map((_, qIdx) => (
            <button
              key={qIdx}
              className={`w-10 h-10 rounded ${
                answers[`${currentSectionIdx}-${qIdx}`]
                  ? "bg-green-600 text-white"
                  : "bg-gray-300 text-black"
              }`}
              onClick={() => setCurrentQIdx(qIdx)}
            >
              {qIdx + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
