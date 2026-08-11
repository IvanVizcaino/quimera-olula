import React from "react";

export interface OlulaWordmarkProps {
  color?: string;
  bowlColor?: string;
  className?: string;
  style?: React.CSSProperties;
}

export interface OlulaStackedProps {
  color?: string;
  accent?: string | null;
  oFill?: string | null;
  aFill?: string | null;
  stroke?: number;
  className?: string;
  style?: React.CSSProperties;
}

export interface OlulaIntroProps {
  color?: string;
  durationSec?: number;
  className?: string;
  style?: React.CSSProperties;
}

export declare function OlulaWordmark(props: OlulaWordmarkProps): React.ReactElement;
export declare function OlulaStacked(props: OlulaStackedProps): React.ReactElement;
export declare function OlulaIntro(props: OlulaIntroProps): React.ReactElement;
