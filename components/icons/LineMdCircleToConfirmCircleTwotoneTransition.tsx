import React, { SVGProps } from "react";

export function LineMdCircleToConfirmCircleTwotoneTransition(
  props: SVGProps<SVGSVGElement>
) {
  return (
    <svg width="1em" height="1em" viewBox="0 0 24 24" {...props}>
      <g
        stroke="currentColor"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="2"
      >
        <circle cx="12" cy="12" r="9" fill="currentColor" fillOpacity="0">
          <animate
            fill="freeze"
            attributeName="fill-opacity"
            begin="0.5s"
            dur="0.45s"
            values="0;0.3"
          ></animate>
        </circle>
        <path
          fill="none"
          strokeDasharray="14"
          strokeDashoffset="14"
          d="M8 12L11 15L16 10"
        >
          <animate
            fill="freeze"
            attributeName="stroke-dashoffset"
            dur="0.5s"
            values="14;0"
          ></animate>
        </path>
      </g>
    </svg>
  );
}
export default LineMdCircleToConfirmCircleTwotoneTransition;
