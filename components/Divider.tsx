import React from "react";

interface DividerProps {
  width?: number;
}

const Divider = ({ width = 48 }: DividerProps) => {
  return (
    <hr
      style={{ width: `${width}px` }}
      className="mx-auto my-4 h-px border-0 bg-primary"
    />
  );
};

export default Divider;
