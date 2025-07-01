import React, { useEffect, useState } from "react";
import Sidebar from "../components/Sidebar";

export default function TestInterface() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    fetch("http://localhost:5000/auth/current_user", {
      credentials: "include",
    })
      .then((res) => res.json())
      .then((data) => setUser(data));
  }, []);

  return (
    <div className="flex h-screen">
      <div className="flex-1 flex flex-col bg-white overflow-hidden">
        <div className="bg-primary text-white px-4 py-2 flex justify-between items-center">
          <div className="font-semibold text-lg">Mock Test 1</div>
          <div>
            Time Left: <span className="font-mono">179:54</span>
          </div>
        </div>

        <div className="h-2"></div>

        <div className="flex gap-0 border-b text-sm">
          {["Physics", "Chemistry", "English and LR", "Mathematics"].map((tab, idx) => (
            <button
              key={tab}
              className={`${
                idx === 0 ? "bg-primary text-white" : "text-black"
              } px-4 py-2 border-r border-gray-300 font-medium flex items-center gap-1 justify-center`}
            >
              {tab}{" "}
              <span className="bg-blue-500 text-white rounded-full text-xs px-1.5">i</span>
            </button>
          ))}
        </div>

        <div className="flex items-center justify-between border-b text-sm px-4 py-1">
          <div>Question Type: MCQ</div>
          <div className="text-right text-sm">
            <span className="text-green-600">Correct: +3</span> |{" "}
            <span className="text-red-600">Incorrect: -1</span>
          </div>
        </div>

        <div className="text-sm px-4 border-b py-1">Question No. 1</div>

        <div className="flex flex-col justify-between flex-1 overflow-y-auto px-0 py-0">
          <div className="border-l border-r border-b px-6 text-xl leading-relaxed flex-grow w-full h-full overflow-y-auto">
            <p className="mb-4">
              In the figure shown, coefficient of restitution between A and B is e = ½,
              then:
            </p>
            <img
              src="https://i.imgur.com/suKh3Fz.png"
              alt="diagram"
              className="w-60 mb-4"
            />
            <ol className="space-y-4 list-decimal list-inside">
              <li>Velocity of B after collision is v⁄2</li>
              <li>Impulse between two during collision is ¾mv</li>
              <li>Loss of K.E. during collision is ⅜mv²</li>
              <li>Loss of K.E. during collision is ¼mv²</li>
            </ol>
            <div className="mt-4">
              <label className="inline-flex items-center mr-4">
                <input type="radio" name="q1" className="mr-2" /> Option A
              </label>
            </div>
          </div>
        </div>

        <div className="flex justify-between text-sm fixed bottom-0 left-0 right-80 bg-white px-6 py-3 border-t z-10">
          <div className="flex gap-4">
            <button className="border px-4 py-2 rounded">Mark for Review & Next</button>
            <button className="border px-4 py-2 rounded">Clear Response</button>
          </div>
          <div className="flex gap-4">
            <button className="border px-4 py-2 rounded">Previous</button>
            <button className="bg-primary text-white px-4 py-2 rounded">Save & Next</button>
          </div>
        </div>
      </div>

      <div className="w-80 border-l bg-gray-50 flex flex-col text-base overflow-y-auto">
        {/* 🟡 Sidebar User Section */}
        <div className="flex flex-col items-center mb-6 p-4">
          {user ? (
            <>
              <img
                src={user.picture || "https://via.placeholder.com/100"}
                alt="Profile"
                className="w-20 h-20 rounded-full mb-2"
              />
              <div className="text-center font-semibold text-xl">{user.name}</div>
            </>
          ) : (
            <>
              <div className="w-20 h-20 rounded-full bg-black mb-2"></div>
              <div className="text-center font-semibold text-xl">Loading...</div>
            </>
          )}
        </div>

        {/* 🟡 Status Grid */}
        <div className="mb-6 grid grid-cols-2 gap-4 text-base px-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-green-500 text-white flex-shrink-0 flex items-center justify-center text-sm font-bold">
              0
            </div>
            <span>Answered</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-orange-500 text-white flex-shrink-0 flex items-center justify-center text-sm font-bold">
              3
            </div>
            <span>Not Answered</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-gray-300 text-white flex-shrink-0 flex items-center justify-center text-sm font-bold">
              27
            </div>
            <span>Not Visited</span>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded bg-purple-600 text-white flex-shrink-0 flex items-center justify-center text-sm font-bold">
              0
            </div>
            <span>Marked for Review</span>
          </div>
          <div className="flex items-center gap-3 col-span-2 flex-wrap">
            <div className="w-8 h-8 rounded border-2 border-purple-600 bg-green-500 text-white flex-shrink-0 flex items-center justify-center text-sm font-bold">
              0
            </div>
            <span>Answered & Marked</span>
          </div>
        </div>

        {/* 🟡 Questions Navigator */}
        <div className="bg-primary text-white font-medium py-2 mb-3 text-lg w-full text-center px-4">
          Physics
        </div>

        <div className="grid grid-cols-5 gap-3 px-4 overflow-y-auto">
          {Array.from({ length: 30 }, (_, i) => (
            <button
              key={i}
              className={`w-10 h-10 rounded border ${
                [0, 1, 5].includes(i)
                  ? "bg-orange-500 text-white"
                  : "bg-gray-200 text-black"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>

        <button className="mt-6 mx-4 bg-primary text-white py-3 rounded text-base">
          Submit
        </button>
      </div>
    </div>
  );
}
