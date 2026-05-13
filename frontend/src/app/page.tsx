"use client";
import { useState } from "react";
import AnalyzeFeatures from "./features/featuresPage";
import Train from "./train/trainPage";

export default function Home() {
  const [view, setView] = useState<"analyze" | "train">("analyze");
  const [theme, setTheme] = useState<"light" | "dark">("dark");
  return (
    <div className="flex flex-col flex-1 items-center justify-center font-sans">
      <nav className="w-full flex items-center justify-between bg-[var(--background-2)] px-8 py-4 shadow">
        <div className="flex items-center gap-4">
          <h1 className="text-2xl font-bold text-[var(--accent-1)]">
            EISP Feature Viewer
          </h1>
        </div>
        <div className="flex flex-row items-center">
          <button
            className="bg-[var(--accent-2)] hover:bg-[var(--accent-1)] text-white font-bold py-2 px-4 mx-2 rounded"
            onClick={() => {
              if (theme === "dark") {
                setTheme("light");
                document.documentElement.setAttribute("data-theme", "light");
              } else {
                setTheme("dark");
                document.documentElement.setAttribute("data-theme", "dark");
              }
            }}
          >
            <img
            src="themetoggle.svg"
            alt="Toggle Theme SVG with sun and moon"
            style={{ width: "20px", height: "20px" }}
            ></img>
          </button>

        <button
          className="bg-[var(--accent-2)] hover:bg-[var(--accent-1)] text-white font-bold py-2 px-4 mx-2 rounded"
          onClick={() => {
            setView("analyze");
          }}
        >
          Analyze Features
        </button>
        <button
          className="bg-[var(--accent-2)] hover:bg-[var(--accent-1)] text-white font-bold py-2 px-4 mx-2 rounded"
          onClick={() => {
            setView("train");
          }}
        >
          Train Model
        </button>
        </div>
      </nav>
      <main className="flex flex-1 w-full max-w-3xl flex-col items-center justify-start px-16 sm:items-start">
        {view === "analyze" && <AnalyzeFeatures />}
        {view === "train" && <Train />}
      </main>
    </div>
  );
}
