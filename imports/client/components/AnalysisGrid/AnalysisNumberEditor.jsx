/* eslint-disable prettier/prettier */
import { AnalysisTextEditorBase } from './AnalysisTextEditorBase';

export class AnalysisNumberEditor extends AnalysisTextEditorBase {
    // eslint-disable-next-line class-methods-use-this
    get type() {
        return 'number';
    }
}
