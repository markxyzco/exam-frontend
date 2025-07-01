import React from "react";

export default function Sidebar() {
  return (
    <div className="w-64 bg-white border-l p-4 flex flex-col justify-between text-sm">
      <div>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
          <div>User Name</div>
        </div>
        <div className="text-purple-700 font-semibold mb-2">Physics</div>
        <div className="grid grid-cols-5 gap-2">
          {Array.from({ length: 30 }, (_, i) => (
            <button key={i} className="w-10 h-10 bg-orange-500 text-white rounded">{i + 1}</button>
          ))}
        </div>
      </div>
      <button className="mt-4 bg-primary text-white py-2 rounded">Submit</button>
    </div>
  );
}
