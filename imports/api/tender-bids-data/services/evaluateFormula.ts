import _eval from "eval";

export interface EvaluationResult {
  result?: number;
  error?: string;
}

export const evaluateFormula = (
  formula: string,
  refValues: { [k: string]: number }
): EvaluationResult => {
  const formulaClean = formula
    .replace(/\[/g, "(")
    .replace(/\]/g, ")")
    .replace(/^=/, "");
  let result;
  let error;
  try {
    // should be a safe way to execute the eval function:
    result = _eval(
      `module.exports = ${formulaClean} `,
      "formulaEvaluate",
      refValues
    );
    result = Number(result);
  } catch (e) {
    error = String(e);
  }
  return { result, error };
};
