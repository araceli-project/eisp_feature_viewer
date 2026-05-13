"use client";

import { type InputHTMLAttributes, useEffect, useState } from "react";
import type { FeatureData } from "../d3_visualizations/feature_data";
import {
  type FeaturesResponse,
  getClassificationData,
  getMultipleResultsData,
  postFeatures,
} from "../services/featuresService";

import GenerateFeatureVisualization from "./featureVisualizations";
import { time } from "console";

const directoryInputAttrs: InputHTMLAttributes<HTMLInputElement> & {
  webkitdirectory?: string;
  directory?: string;
} = {
  webkitdirectory: "true",
  directory: "",
};

export default function AnalyzeFeatures() {
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [featureData, setFeatureData] = useState<FeatureData | null>(null);
  const [loading, setLoading] = useState(false);
  const [csaiSelectedModel, setCsaiSelectedModel] = useState<string | null>(null);
  const [shouldRequestFeatures, setShouldRequestFeatures] = useState(true);
  const [csaiModelNames, setCsaiModelNames] = useState<string[]>([]);
  const [pastFeatures, setPastFeatures] = useState<FeatureData[] | null>(null);

  useEffect(() => {
    setCsaiModelNames(localStorage.getItem("CSAI Model Names")
      ? JSON.parse(localStorage.getItem("CSAI Model Names") as string)
      : []);
    setPastFeatures(localStorage.getItem("Past Features Data")
      ? JSON.parse(localStorage.getItem("Past Features Data") as string)
      : []);
    if (csaiModelNames.length > 0) {
      setCsaiSelectedModel(csaiModelNames[0]);
    }

    if (selectedFiles && shouldRequestFeatures) {
      setLoading(true);
      const model_name =
        csaiSelectedModel || "";
      postFeatures(selectedFiles, model_name)
        .then((response: FeaturesResponse) => {
          const proxy_tasks_names = Object.keys(response.features);
          const classification_results: Record<string, string[]> =
            getClassificationData(response);
          const multiple_results: Record<string, string[][]> =
            getMultipleResultsData(response);
          const now = new Date();
          setFeatureData({
            timestamp: now.toISOString(),
            features: response.features,
            proxy_tasks_names,
            classification_results,
            multiple_results,
            shap_results: response.shap_results,
          });
          var existingFeatures = localStorage.getItem("Past Features Data")
            ? JSON.parse(localStorage.getItem("Past Features Data") as string)
            : [];
          existingFeatures.push({
            timestamp: now.toISOString(),
            features: response.features,
            proxy_tasks_names,
            classification_results,
            multiple_results,
            shap_results: response.shap_results,
          });
          setPastFeatures(existingFeatures);
          localStorage.setItem("Past Features Data", JSON.stringify(existingFeatures));
        })
        .catch((error) => {
          console.error("Error fetching features:", error);
        })
        .finally(() => {
          setLoading(false);
        });
    }
  }, [selectedFiles, shouldRequestFeatures, csaiSelectedModel]);

  return (
    <div className="w-full flex flex-col items-center">
      <h1 className="text-5xl font-bold text-center sm:text-left py-8">
        Analyze Features
      </h1>
      <h2 className="text-xl font-bold mb-2 text-center sm:text-center">
        Please select a directory containing the images to be analyzed.
      </h2>
      <div className="flex flex-col items-center justify-center gap-4">
      {!loading && (
        <input
          className="border border-gray-300 rounded p-2 mb-4 py-4"
          type="file"
          id="dirInput"
          {...directoryInputAttrs}
          multiple
          onChange={(e) => {
            setShouldRequestFeatures(false);
            setSelectedFiles(e.target.files);
          }}
        />
      )}

      {!loading && selectedFiles && (
        selectedFiles.length > 0 && csaiModelNames && csaiModelNames.length > 0 && (
          <div className="flex flex-col items-start justify-center gap-2 border border-gray-300 rounded p-4 mb-4">
            <label className="text-[var(--accent-1)]">Select CSAI Model:</label>
          <select
            value={csaiSelectedModel || ""}
            onChange={(e) => {
              setShouldRequestFeatures(false);
              setCsaiSelectedModel(e.target.value);
            }}
          >
            {csaiModelNames.map((name) => (
              <option key={name} value={name}>
                {name}
              </option>
            ))}
          </select>
          </div>
        )
      )}

      </div>

      <div className="flex flex-col items-center justify-center gap-4">
      {!loading && selectedFiles && (
        <button
          className="bg-[var(--accent-2)] hover:bg-[var(--accent-1)] text-white font-bold py-2 my-2 px-4 rounded"
          type="button"
          onClick={() => {
            setShouldRequestFeatures(true);
          }}
        >
          Analyze Features
        </button>
      )}

      {!loading && selectedFiles && pastFeatures && pastFeatures.length > 0 && (
        <div className="flex flex-col items-start justify-center gap-2 border border-gray-300 rounded p-4 mb-4">
          <label className="text-[var(--accent-1)]">Restore Past Features Data:</label>
          {pastFeatures
          .filter(feature => Object.values(feature.features)[0].length === selectedFiles.length)
          .map(feature => 
            <div key={feature.timestamp}>
              <label>
                {new Date(feature.timestamp).toLocaleString()} - N° of images: {Object.values(feature.features)[0].length}
              </label>
              <button 
                onClick={() => setFeatureData(feature)}
              >
              <span className="ml-2 text-sm text-[var(--accent-2)] hover:text-[var(--accent-1)] rounded border border-[var(--accent-2)] hover:border-[var(--accent-1)] px-2 py-1">
                Visualize
              </span>
            </button></div>)}
        </div>
      )}

      </div>



      {loading && <p>Loading...</p>}

      {!loading && featureData && selectedFiles && (
        <GenerateFeatureVisualization
          featureData={featureData}
          selected_files={selectedFiles}
        />
      )}
    </div>
  );
}
