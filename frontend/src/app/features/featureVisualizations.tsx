import { useEffect, useState } from "react";
import TooltipComponent from "@/app/components/tooltip";
import {
  type FeatureData,
  renderFeatureData,
} from "../d3_visualizations/feature_data";
import GenerateSelectionVisualization from "./selectionVisualizations";


export default function GenerateFeatureVisualization({
  featureData,
  selected_files,
}: {
  featureData: FeatureData;
  selected_files: FileList;
}) {
  const [proxyTaskName, setProxyTaskName] = useState<string>(
    featureData.proxy_tasks_names[0] || "",
  );
  const [colorByProxyTaskName, setColorByProxyTaskName] = useState<string>(
    Object.keys(featureData.classification_results)?.[0] || "",
  );
  const [selectedPointIndices, setSelectedPointIndices] = useState<number[]>(
    [],
  );
  const [shouldHaveSecondSelection, setShouldHaveSecondSelection] = useState(false);

  useEffect(() => {
    if (proxyTaskName) {
      try {
        const svgElement = renderFeatureData(
          featureData,
          proxyTaskName,
          selected_files,
          colorByProxyTaskName,
          {
            width: window.innerWidth * 0.4,
            height: window.innerHeight * 0.4,
          }
        );
        const handlePointsBrushed = (event: Event) => {
          const { detail } = event as CustomEvent<number[]>;
          if (detail.length != 0) {
          setSelectedPointIndices(detail);
          }
        };
        svgElement.addEventListener("points-brushed", handlePointsBrushed);

        const container = document.getElementById("feature-visualization");
        if (container) {
          container.innerHTML = "";
          container.appendChild(svgElement);
        }
        return () => {
          svgElement.removeEventListener("points-brushed", handlePointsBrushed);
        };
      } catch (error) {
        console.error("Error rendering feature data:", error);
      }
    }
  }, [featureData, proxyTaskName, colorByProxyTaskName, selected_files]);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="flex flex-row items-center justify-center gap-2">
      <h1 className="text-3xl font-bold text-center sm:text-left py-8">
        Feature Visualization 
      </h1>
        <TooltipComponent text="This visualization shows the features extracted from your images. It is expected that points near each other represent similar images by the model task. Each point represents an image, and the position is determined by the projection on 2d using TSNE of the the model representation of the image. You can select different proxy tasks to view the features from different perspectives, and color the points based on classification results. Use brushing to select points and generate detailed visualizations for those selections." componentID="feature-vis-tooltip" size="6" />
      </div>
    <div className="py-2 flex flex-row items-start justify-center gap-4">
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex flex-row  text-center sm:text-left items-center justify-center border-3 border-[var(--accent-1)] rounded p-2">
        <select
          id="proxyTaskSelect"
          value={proxyTaskName}
          onChange={(e) => setProxyTaskName(e.target.value)}
        >
          {featureData.proxy_tasks_names
            .filter((name) => featureData.features[name][0].length === 2)
            .map((name) => (
              <option key={name} value={name}>
                View by {name}
              </option>
            ))}
        </select>

      </div>
      <div className="flex flex-row text-center sm:text-left border-3 border-[var(--accent-2)] rounded p-2 my-2">
        <select
          id="colorByProxyTaskSelect"
          value={colorByProxyTaskName}
          onChange={(e) => setColorByProxyTaskName(e.target.value)}
        >
          <option value="">No Color Grouping</option>
          {Object.keys(featureData.classification_results).map((name) => (
            <option key={name} value={name}>
              Color by {name}
            </option>
          ))}
        </select>
      </div>

      <div id="feature-visualization" style={{ marginTop: "20px", border: "4px solid var(--accent-3)", paddingTop: "10px"}}></div>

      </div>
      {selectedPointIndices.length > 0 && (
        <GenerateSelectionVisualization
          id_number={1}
          selectedPointIndices={selectedPointIndices}
          featureData={featureData}
          shouldPlotScatter={true}
          renderOptions={{width: window.innerWidth * 0.25, height: window.innerHeight * 0.25}}
        />
      )}
      <div>
        {selectedPointIndices.length > 0 && !shouldHaveSecondSelection && (
          <button
            className="bg-[var(--accent-2)] hover:bg-[var(--accent-1)] text-white font-bold py-2 my-2 px-4 rounded"
            onClick={() => setShouldHaveSecondSelection(true)}
          >
            +
          </button>
        )}
        {selectedPointIndices.length > 0 && shouldHaveSecondSelection && (
          <GenerateSelectionVisualization
            id_number={2}
            selectedPointIndices={selectedPointIndices}
            featureData={featureData}
            shouldPlotScatter={true}
            renderOptions={{width: window.innerWidth * 0.25, height: window.innerHeight * 0.25}}
          />
        )}

      </div>
    </div>
    <div className="mb-10">
      <h2 className="text-xl font-bold mb-2">General Dataset Visualization</h2>
      <GenerateSelectionVisualization
        id_number={3}
        featureData={featureData}
        selectedPointIndices={Array.from({ length: featureData.features[Object.keys(featureData.features)[0]].length }, (_, i) => i)}
        shouldPlotScatter={false}
        renderOptions={{width: window.innerWidth * 0.4, height: window.innerHeight * 0.4}}
      />
    </div>
    </div>
  );
}
