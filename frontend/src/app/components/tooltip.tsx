import { Tooltip } from "react-tooltip";

export default function TooltipComponent({ text, componentID, size }: { text: string; componentID: string; size: string }) {
  return (
    <div>
        <a data-tooltip-id={componentID}>
          <img src="tooltip.svg" alt="Tooltip Icon" className={`inline-block w-${size} h-${size} ml-2`} />
      </a>
      <Tooltip id={componentID}>
        <div className="text-xl flex flex-col gap-2 word-break max-w-xs">
        {text}
        </div>
      </Tooltip>

    </div>
  );
}
