import * as d3 from "d3";

export enum ColorSchemeType {
  Categorical = "categorical",
  Sequential = "sequential",
}
export const colorSchemes: Record<ColorSchemeType, any> = {
  [ColorSchemeType.Categorical]: ["#ffb549", "#702aee", ...d3.schemeTableau10],
  [ColorSchemeType.Sequential]: d3.interpolateRgb("#99a4b0", "#702aee")
};

export const ColorTypeForProxyTask: Record<string, ColorSchemeType> = {
  Nudity: ColorSchemeType.Categorical,
  Scenes_Places: ColorSchemeType.Categorical,
  csai: ColorSchemeType.Categorical,
  Objects: ColorSchemeType.Categorical,
  age: ColorSchemeType.Sequential,
  gender: ColorSchemeType.Categorical,
  child: ColorSchemeType.Categorical,
  ITA_Skin_Tone: ColorSchemeType.Sequential,
};

export const SequentialOrderForProxyTask: Record<string, string[]> = {
  age: ["(0-2)", "(4-6)", "(8-13)", "(15-20)", "(25-30)", "(38-43)", "(48-53)", "(60+)"],
  ITA_Skin_Tone: [
    "very light",
    "light 2",
    "light",
    "intermediate 2",
    "intermediate",
    "dark",
  ],
};

export function getLabelOrderForProxyTask(
  proxyTaskName: string,
  labels: string[],
): string[] {
  const uniqueLabels = Array.from(new Set(labels));
  const colorType = ColorTypeForProxyTask[proxyTaskName];

  if (colorType === ColorSchemeType.Sequential) {
    const configuredOrder = SequentialOrderForProxyTask[proxyTaskName] ?? [];
    const configuredLabelSet = new Set(configuredOrder);
    const orderedConfiguredLabels = configuredOrder.filter((label) =>
      uniqueLabels.includes(label),
    );
    const remainingLabels = uniqueLabels
      .filter((label) => !configuredLabelSet.has(label))
      .sort((a, b) => a.localeCompare(b));

    return [...orderedConfiguredLabels, ...remainingLabels];
  }

  return uniqueLabels.sort((a, b) => a.localeCompare(b));
}

export function getColorForValue(
  value: string,
  value_order: string[],
  schemeType: ColorSchemeType = ColorSchemeType.Categorical,
): string {
  const scheme = schemeType === ColorSchemeType.Sequential ? d3.quantize(colorSchemes[schemeType], value_order.length) : colorSchemes[schemeType];
  const index = value_order.indexOf(value);
  const safeIndex = index >= 0 ? index : 0;
  return scheme[safeIndex % scheme.length];
}

export function getReadableTextColor(backgroundColor: string): string {
  const rgb = d3.color(backgroundColor)?.rgb();
  if (!rgb) {
    return "#ffffff";
  }

  const brightness = (rgb.r * 299 + rgb.g * 587 + rgb.b * 114) / 1000;
  return brightness >= 160 ? "#000000" : "#ffffff";
}
