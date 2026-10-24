import React from "react";

interface ErrorEmailBannerProps {
  message: string;
}

const ErrorEmailBanner = (props: ErrorEmailBannerProps) => {
  return (
    <div className="border border-destructive/40 bg-destructive/10 flex w-full mt-4 p-4 rounded-lg justify-center">
      <p className="text-foreground">{props.message}</p>
    </div>
  );
};

export default ErrorEmailBanner;
