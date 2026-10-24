import React from "react";

const SuccessfulEmailBanner = () => {
  return (
    <>
      <div className="flex justify-center w-full mt-4 p-4 rounded-lg border border-success/40 bg-success/10">
        <div>
          <p className=" text-foreground">Contact form successfully submitted</p>
        </div>
      </div>
    </>
  );
};

export default SuccessfulEmailBanner;
