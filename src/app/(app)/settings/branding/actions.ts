
"use server";

import {
  generateTerms,
  type GenerateTermsInput,
  type GenerateTermsOutput,
} from "@/ai/flows/generate-terms-flow";
import {
  analyzeLogo,
  type AnalyzeLogoInput,
  type AnalyzeLogoOutput,
} from "@/ai/flows/analyze-logo-flow";

export async function generateTermsAction(
  input: GenerateTermsInput
): Promise<GenerateTermsOutput | null> {
  try {
    const result = await generateTerms(input);
    return result;
  } catch (error) {
    console.error("Error in generateTermsAction:", error);
    throw new Error("Failed to generate terms and conditions.");
  }
}

export async function analyzeLogoAction(
  input: AnalyzeLogoInput
): Promise<AnalyzeLogoOutput | null> {
  try {
    const result = await analyzeLogo(input);
    return result;
  } catch (error) {
    console.error("Error in analyzeLogoAction:", error);
    throw new Error("Failed to analyze logo.");
  }
}
