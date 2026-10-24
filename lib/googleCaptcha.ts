/**
 * Verifies a reCAPTCHA token with Google's verification API
 * @param token The reCAPTCHA token to verify
 * @returns An object containing the verification result, including success status, score, and action
 */

import { RecaptchaVerificationResponse } from "./types";

export async function verifyRecaptcha(
  token: string,
): Promise<RecaptchaVerificationResponse> {
  // const response = await fetch(
  //   "https://www.google.com/recaptcha/api/siteverify",
  //   {
  //     method: "POST",
  //     headers: {
  //       "Content-Type": "application/x-www-form-urlencoded",
  //     },
  //     body: `secret=${process.env.GOOGLE_CAPTCHA_SECRET_KEY}&response=${token}`,
  //   }
  // );
  const API_KEY = process.env.GCLOUD_API_KEY;
  const response = await fetch(
    `https://recaptchaenterprise.googleapis.com/v1/projects/williamarice-web/assessments`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-goog-api-key": API_KEY ?? "",
      },
      body: JSON.stringify({
        event: {
          token: token,
          expectedAction: "contact_form_submit",
          siteKey: process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY,
        },
      }),
    },
  );

  if (response.status !== 200) {
    console.error(
      "reCAPTCHA verification failed with status:",
      response.status,
    );
    return {
      success: false,
      message: "reCAPTCHA verification failed - Invalid Request",
    };
  }
  const data = await response.json();
  if (data.riskAnalysis.score < 0.3) {
    return {
      success: false,
      message: "reCAPTCHA verification failed",
      score: data.riskAnalysis.score,
      action: data.tokenProperties.action,
    };
  }
  return {
    success: true,
    score: data.riskAnalysis.score,
    action: data.tokenProperties.action,
  };
}
