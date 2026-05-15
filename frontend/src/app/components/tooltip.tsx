import { Tooltip } from "react-tooltip";

export default function TooltipComponent({ text, componentID, size }: { text: string; componentID: string; size: string }) {
  return (
    <div>
        <a data-tooltip-id={componentID}>
          <img style={{ width: `calc(${size} * 0.25rem)`, height: `calc(${size} * 0.25rem)` }} src="tooltip.svg" alt="Tooltip Icon" className="inline-block ml-2" />
      </a>
      <Tooltip id={componentID}>
        <div className="text-xl flex flex-col gap-2 word-break max-w-xs">
        {text}
        </div>
      </Tooltip>

    </div>
  );
}
