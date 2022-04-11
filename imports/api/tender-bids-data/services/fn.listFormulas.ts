export type FormulaColumn = {
  colKey: string;
  cType: string;
};

export function listFormulas(
  existingFormulas: FormulaColumn[],
  formulaKey: string,
  cType: string,
  formula?: string
): FormulaColumn[] {
  let updatedFormulaColumns: FormulaColumn[] = existingFormulas;
  const idx = existingFormulas.findIndex(c => c.colKey === formulaKey);
  if (formula) {
    if (idx === -1) {
      updatedFormulaColumns.push({ colKey: formulaKey, cType });
    }
  } else {
    updatedFormulaColumns = updatedFormulaColumns.filter((col, i) => i !== idx);
  }
  return updatedFormulaColumns;
}
