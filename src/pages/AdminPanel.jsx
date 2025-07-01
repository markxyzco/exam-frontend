import React, { useEffect, useState, useRef } from "react";
import { DndProvider, useDrag, useDrop } from "react-dnd";
import { HTML5Backend } from "react-dnd-html5-backend";

const sectionTypes = ["Physics", "Chemistry", "Mathematics"];

export default function TestInterface() {
  const [user, setUser] = useState(null);
  const [testName, setTestName] = useState("Mock Test 1");

  const [sections, setSections] = useState(
    sectionTypes.map((title, index) => ({
      id: index,
      title,
      questions: Array(30)
        .fill(0)
        .map(() => ({
          image: null,
          imageURL: "",
          fileName: "",
          questionType: "MCQ",
          positiveMarks: 4,
          negativeMarks: -1,
          correctOption: "",
          options: ["Option A", "Option B", "Option C", "Option D"],
        })),
    }))
  );

  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);

  const [questionCountInput, setQuestionCountInput] = useState(
    sections[0].questions.length.toString()
  );

  useEffect(() => {
    setQuestionCountInput(
      sections[currentSectionIndex].questions.length.toString()
    );
  }, [currentSectionIndex]);

  const fileInputRef = useRef(null);

  useEffect(() => {
    fetch("http://localhost:5000/auth/current_user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  const currentQuestion =
    sections[currentSectionIndex].questions[currentQuestionIndex];

  const updateQuestion = (newData) => {
    setSections((prev) => {
      const updated = [...prev];
      const updatedQuestions = [...updated[currentSectionIndex].questions];
      updatedQuestions[currentQuestionIndex] = {
        ...updatedQuestions[currentQuestionIndex],
        ...newData,
      };
      updated[currentSectionIndex].questions = updatedQuestions;
      return updated;
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("image", file);

    try {
      const res = await fetch("http://localhost:5000/admin/upload", {
        method: "POST",
        credentials: "include",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Upload failed");

      // ✅ Update question with uploaded file
      updateQuestion({
        image: file,
        imageURL: URL.createObjectURL(file), // for preview
        fileName: data.fileName,             // actual saved name for server fetch
      });

      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("❌ Upload failed:", err);
      alert("❌ Failed to upload image");
    }
  };


  const handleRemoveImage = () => {
    updateQuestion({ image: null, imageURL: "", fileName: "" });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleOptionChange = (value, index) => {
    const newOptions = [...currentQuestion.options];
    newOptions[index] = value;
    updateQuestion({ options: newOptions });
  };

  const handleClearResponse = () => {
    updateQuestion({
      correctOption: "",
      image: null,
      imageURL: "",
      fileName: "",
      options: ["Option A", "Option B", "Option C", "Option D"],
    });
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmitTest = async () => {
    const isComplete = (q) => q.imageURL && q.correctOption;

    for (const section of sections) {
      for (const question of section.questions) {
        if (!isComplete(question)) {
          alert("❌ All questions must have an image and a correct option selected.");
          return;
        }
      }
    }

    const payload = {
      title: testName,
      created_by: user.email,
      sections: sections.map((sec) => ({
        title: sec.title,
        questions: sec.questions.map((q) => ({
          file_name: q.fileName,
          question_type: q.questionType,
          positive_marks: q.positiveMarks,
          negative_marks: q.negativeMarks,
          correct_option: q.correctOption,
          options: Array.isArray(q.options) ? q.options : [], // 🛡️ Failsafe
        })),
      })),
    };

    try {
      const res = await fetch("http://localhost:5000/save_test", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      let data;
      try {
        data = await res.json(); // ⬅️ This line could fail if response is empty or invalid
      } catch (err) {
        throw new Error("❌ Server returned invalid or empty JSON");
      }

      if (!res.ok) {
        throw new Error(`Server Error ${res.status}: ${data?.message || "Unknown error"}`);
      }

      console.log("✅ Saved test:", data);
      alert("✅ Test saved successfully!");
    } catch (err) {
      console.error("❌ Error saving test:", err);
      alert(err.message || "❌ Unexpected error occurred");
    }
  };



  const moveSection = (from, to) => {
    const updated = [...sections];
    const [moved] = updated.splice(from, 1);
    updated.splice(to, 0, moved);
    setSections(updated);
  };

  const removeSection = (index) => {
    const updated = [...sections];
    updated.splice(index, 1);
    setSections(updated);
    if (currentSectionIndex >= updated.length) {
      setCurrentSectionIndex(Math.max(0, updated.length - 1));
      setCurrentQuestionIndex(0);
    }
  };

  return (
    <DndProvider backend={HTML5Backend}>
      <div className="flex h-screen">
        {/* Main Panel */}
        <div className="flex-1 flex flex-col bg-white overflow-hidden">
          <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
            <input
              value={testName}
              onChange={(e) => setTestName(e.target.value)}
              className="bg-transparent font-semibold text-lg border-b border-white outline-none"
            />
          </div>

          <div className="h-2 bg-gray-100" />

          {/* Section Tabs */}
          <div className="flex gap-0 border-b text-sm">
            {sections.map((section, idx) => (
              <DraggableTab
                key={section.id}
                index={idx}
                moveTab={moveSection}
                isActive={idx === currentSectionIndex}
                onClick={() => {
                  setCurrentSectionIndex(idx);
                  setCurrentQuestionIndex(0);
                }}
              >
                {section.title}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      window.confirm(
                        `Are you sure you want to delete section "${section.title}"?`
                      )
                    ) {
                      removeSection(idx);
                    }
                  }}
                  className="ml-2 text-red-600 text-xs"
                >
                  ✕
                </button>
              </DraggableTab>
            ))}
            <button
              onClick={() =>
                setSections((prev) => [
                  ...prev,
                  {
                    id: prev.length,
                    title: `Section ${prev.length + 1}`,
                    questions: Array(30)
                      .fill(0)
                      .map(() => ({
                        image: null,
                        imageURL: "",
                        fileName: "",
                        questionType: "MCQ",
                        positiveMarks: 4,
                        negativeMarks: -1,
                        correctOption: "",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                      })),
                  },
                ])
              }
              className="px-4 py-2 border-l border-gray-300 bg-green-100 text-sm font-medium"
            >
              + Add Section
            </button>
          </div>

          {/* Question Type & Marks */}
          <div className="flex items-center justify-between border-b text-sm px-4 py-1">
            <select
              value={currentQuestion.questionType}
              onChange={(e) => updateQuestion({ questionType: e.target.value })}
              className="border px-2 py-1 text-sm"
            >
              <option>MCQ</option>
              <option>Numeric</option>
              <option>Assertion/Reason</option>
            </select>
            <div>
              <span className="text-green-600">
                Correct: +{currentQuestion.positiveMarks}
              </span>{" "}
              |{" "}
              <span className="text-red-600">
                Incorrect: {currentQuestion.negativeMarks}
              </span>
            </div>
          </div>

          <div className="text-sm px-4 border-b py-1">
            Question No. {currentQuestionIndex + 1}
          </div>

          {/* Question Content */}
          <div className="flex flex-col flex-1 border-l border-r px-6 py-4 overflow-y-auto">
            <div className="flex items-center mb-2 gap-3">
              <label className="bg-gray-200 px-3 py-1 rounded cursor-pointer">
                Upload Image
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  accept="image/*"
                  style={{ display: "none" }}
                />
              </label>
              {currentQuestion.fileName && (
                <span className="text-sm text-gray-600">
                  {currentQuestion.fileName}
                </span>
              )}
              {currentQuestion.imageURL && (
                <>
                  <img
                    src={currentQuestion.imageURL}
                    alt="Preview"
                    className="w-20 h-20 object-contain border rounded"
                  />
                  <button
                    onClick={() =>
                      window.open(currentQuestion.imageURL, "_blank")
                    }
                    className="bg-blue-500 text-white px-3 py-1 rounded"
                  >
                    VIEW
                  </button>
                  <button
                    onClick={handleRemoveImage}
                    className="text-red-600"
                  >
                    Remove
                  </button>
                </>
              )}
            </div>

            <div className="text-lg font-semibold mb-2">Options</div>
            {currentQuestion.options.map((opt, i) => (
              <label key={i} className="block mb-2">
                <input
                  type="radio"
                  name={`q${currentQuestionIndex}`}
                  checked={
                    currentQuestion.correctOption === String.fromCharCode(65 + i)
                  }
                  onChange={() =>
                    updateQuestion({
                      correctOption: String.fromCharCode(65 + i),
                    })
                  }
                  className="mr-2"
                />
                <input
                  type="text"
                  value={opt}
                  onChange={(e) => handleOptionChange(e.target.value, i)}
                  className="border p-1 w-1/2"
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                />
              </label>
            ))}

            <div className="flex gap-4 mt-4">
              <label>
                + Marks:{" "}
                <input
                  type="number"
                  value={currentQuestion.positiveMarks}
                  onChange={(e) =>
                    updateQuestion({ positiveMarks: Number(e.target.value) })
                  }
                  className="border px-2 py-1 w-16"
                />
              </label>
              <label>
                - Marks:{" "}
                <input
                  type="number"
                  value={currentQuestion.negativeMarks}
                  onChange={(e) =>
                    updateQuestion({ negativeMarks: Number(e.target.value) })
                  }
                  className="border px-2 py-1 w-16"
                />
              </label>
            </div>
          </div>

          <div className="flex justify-between text-sm px-6 py-3 border-t z-10">
            <button
              className="border px-4 py-2 rounded"
              onClick={handleClearResponse}
            >
              Clear Response
            </button>
            <div className="flex gap-4">
              <button
                className="border px-4 py-2 rounded"
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    prev === 0
                      ? sections[currentSectionIndex].questions.length - 1
                      : prev - 1
                  )
                }
              >
                Previous
              </button>
              <button
                className="bg-primary text-white px-4 py-2 rounded"
                onClick={() =>
                  setCurrentQuestionIndex((prev) =>
                    prev === sections[currentSectionIndex].questions.length - 1
                      ? 0
                      : prev + 1
                  )
                }
              >
                Save & Next
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-80 border-l bg-gray-50 flex flex-col text-base overflow-y-auto">
          <div className="flex flex-col items-center mb-4 p-4">
            <img
              src={user?.picture || "https://via.placeholder.com/100"}
              alt="Profile"
              className="w-20 h-20 rounded-full mb-2"
            />
            <div className="text-center font-semibold text-xl">{user?.name}</div>
          </div>

          <div className="px-4 mb-2">
            <div className="font-semibold text-sm mb-1">Section Name</div>
            <input
              className="border p-2 w-full"
              value={sections[currentSectionIndex].title}
              onChange={(e) => {
                const updated = [...sections];
                updated[currentSectionIndex].title = e.target.value;
                setSections(updated);
              }}
            />
          </div>

          <div className="px-4 mb-2">
            <div className="font-semibold text-sm mb-1">Number of Questions</div>
            <input
                type="number"
                min={1} // ⬅️ Don't allow typing less than 1
                value={questionCountInput}
                onChange={(e) => {
                const raw = e.target.value;
                // Prevent typing 0 or negative or non-digit
                if (/^0|-/.test(raw)) return;
                setQuestionCountInput(raw);
                }}
                onBlur={(e) => {
                const value = e.target.value.trim();
                const count = parseInt(value);
                if (isNaN(count) || count <= 0) {
                    setQuestionCountInput(
                    sections[currentSectionIndex].questions.length.toString()
                    );
                    return;
                }

                const updated = [...sections];
                const currentQuestions = updated[currentSectionIndex].questions;

                const isFilled = (q) => {
                    const hasCustomOptions = q.options.some(
                    (opt, idx) => opt !== `Option ${String.fromCharCode(65 + idx)}`
                    );
                    return q.correctOption || q.imageURL || hasCustomOptions;
                };

                const highestFilledIndex = currentQuestions.reduce(
                    (max, q, i) => (isFilled(q) ? i : max),
                    -1
                );
                const minRequired = highestFilledIndex + 1;

                if (count < minRequired) {
                    alert(
                    `You have already filled up to question ${minRequired}. You cannot reduce below that.`
                    );
                    setQuestionCountInput(currentQuestions.length.toString());
                    return;
                }

                if (count > currentQuestions.length) {
                    const additional = Array(count - currentQuestions.length)
                    .fill(0)
                    .map(() => ({
                        image: null,
                        imageURL: "",
                        fileName: "",
                        questionType: "MCQ",
                        positiveMarks: 4,
                        negativeMarks: -1,
                        correctOption: "",
                        options: ["Option A", "Option B", "Option C", "Option D"],
                    }));
                    updated[currentSectionIndex].questions = [
                    ...currentQuestions,
                    ...additional,
                    ];
                } else {
                    updated[currentSectionIndex].questions = currentQuestions.slice(
                    0,
                    count
                    );
                }

                setSections(updated);
                setCurrentQuestionIndex(0);
                setQuestionCountInput(count.toString());
                }}
                className="border p-2 w-full"
            />
            </div>


          <div className="bg-primary text-white font-medium py-2 mb-3 text-lg w-full text-center px-4">
            {sections[currentSectionIndex].title}
          </div>

          <div className="grid grid-cols-5 gap-3 px-4 overflow-y-auto">
            {sections[currentSectionIndex].questions.map((q, i) => {
              const hasImage = !!q.imageURL;
              const hasAnswer = !!q.correctOption;
              let bg = "bg-gray-200 text-black";
              if (hasImage && hasAnswer) bg = "bg-green-500 text-white";
              else if (hasImage || hasAnswer) bg = "bg-red-500 text-white";
              if (currentQuestionIndex === i) bg = "bg-blue-500 text-white";

              return (
                <button
                  key={i}
                  onClick={() => setCurrentQuestionIndex(i)}
                  className={`w-10 h-10 rounded border ${bg}`}
                >
                  {i + 1}
                </button>
              );
            })}
          </div>

          <button onClick={handleSubmitTest} className="mt-6 mx-4 bg-primary text-white py-3 rounded text-base">
            Submit
          </button>

        </div>
      </div>
    </DndProvider>
  );
}

function DraggableTab({ children, index, moveTab, isActive, onClick }) {
  const ref = useRef(null);
  const [, drop] = useDrop({
    accept: "TAB",
    hover(item) {
      if (item.index !== index) {
        moveTab(item.index, index);
        item.index = index;
      }
    },
  });
  const [, drag] = useDrag({
    type: "TAB",
    item: { index },
  });

  drag(drop(ref));

  return (
    <div
      ref={ref}
      className={`px-4 py-2 border-r border-gray-300 font-medium flex items-center gap-1 justify-center cursor-pointer ${
        isActive ? "bg-primary text-white" : "text-black"
      }`}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
