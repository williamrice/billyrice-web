import React from "react";
import { PulseLoader } from "react-spinners";

interface SubmitButtonProps {
  loading: boolean;
}

const SubmitButton = ({ loading }: SubmitButtonProps) => {
  return (
    <button className="button-primary min-w-28">
      {loading ? <PulseLoader color="currentColor" size={8} /> : "Create secure link"}
    </button>
  );
};

export default SubmitButton;
