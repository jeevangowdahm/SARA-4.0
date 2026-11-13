import { FieldId, ExtractedField, SaraSensePipelineResult, CompletedRegistration } from './types';
import { COMMUNITY_SERVICE_FORM_SCHEMA } from './formSchema';
import { extractFieldsFromTranscript } from './fieldExtractor';
import { validateField } from './validators';

export class SaraConversationEngine {
  private currentStepIndex: number = 0;
  private fieldValues: Partial<Record<FieldId, ExtractedField>> = {};
  private transcriptHistory: Array<{ role: 'assistant' | 'user'; text: string; timestamp: number }> = [];

  constructor(initialValues?: Partial<Record<FieldId, ExtractedField>>) {
    if (initialValues) {
      this.fieldValues = { ...initialValues };
    }
  }

  public getCurrentStepIndex(): number {
    return this.currentStepIndex;
  }

  public getCurrentFieldDefinition() {
    return COMMUNITY_SERVICE_FORM_SCHEMA[this.currentStepIndex] || null;
  }

  public getTotalSteps(): number {
    return COMMUNITY_SERVICE_FORM_SCHEMA.length;
  }

  public getFieldValues(): Partial<Record<FieldId, ExtractedField>> {
    return { ...this.fieldValues };
  }

  public getFieldValue(fieldId: FieldId): ExtractedField | undefined {
    return this.fieldValues[fieldId];
  }

  public setFieldValue(
    fieldId: FieldId,
    value: string,
    rawTranscript: string = '',
    method: ExtractedField['extractionMethod'] = 'manual_input'
  ): ExtractedField {
    const validation = validateField(fieldId, value);
    const fieldData: ExtractedField = {
      fieldId,
      value: validation.normalizedValue,
      rawTranscript: rawTranscript || value,
      extractionMethod: method,
      confidence: validation.isValid ? 'high' : 'medium',
      isValid: validation.isValid,
      validationError: validation.error,
      clarificationNeeded: validation.clarificationNeeded,
      clarificationReason: validation.clarificationReason,
      verifiedByUser: true,
      timestamp: Date.now(),
    };
    this.fieldValues[fieldId] = fieldData;
    return fieldData;
  }

  public processInput(transcript: string): SaraSensePipelineResult {
    const currentField = this.getCurrentFieldDefinition();
    const result = extractFieldsFromTranscript(transcript, currentField?.id);

    // Record user transcript in history
    this.transcriptHistory.push({
      role: 'user',
      text: transcript,
      timestamp: Date.now(),
    });

    // Auto-populate extracted fields if valid
    for (const [fId, item] of Object.entries(result.extractedFields) as [FieldId, ExtractedField][]) {
      this.fieldValues[fId] = item;
    }

    return result;
  }

  public nextStep(): boolean {
    if (this.currentStepIndex < COMMUNITY_SERVICE_FORM_SCHEMA.length - 1) {
      this.currentStepIndex++;
      return true;
    }
    return false; // Reached end of form steps
  }

  public previousStep(): boolean {
    if (this.currentStepIndex > 0) {
      this.currentStepIndex--;
      return true;
    }
    return false;
  }

  public jumpToStep(index: number) {
    if (index >= 0 && index < COMMUNITY_SERVICE_FORM_SCHEMA.length) {
      this.currentStepIndex = index;
    }
  }

  public getProgressPercentage(): number {
    const completed = COMMUNITY_SERVICE_FORM_SCHEMA.filter((f) => {
      const field = this.fieldValues[f.id];
      return field && field.isValid && Boolean(field.value);
    }).length;
    return Math.round((completed / COMMUNITY_SERVICE_FORM_SCHEMA.length) * 100);
  }

  public getCompletionSummary(): {
    isComplete: boolean;
    missingFields: string[];
    invalidFields: string[];
  } {
    const missing: string[] = [];
    const invalid: string[] = [];

    for (const schema of COMMUNITY_SERVICE_FORM_SCHEMA) {
      const field = this.fieldValues[schema.id];
      if (!field || !field.value.trim()) {
        if (schema.required) missing.push(schema.label);
      } else if (!field.isValid) {
        invalid.push(schema.label);
      }
    }

    return {
      isComplete: missing.length === 0 && invalid.length === 0,
      missingFields: missing,
      invalidFields: invalid,
    };
  }

  public finalizeRegistration(): CompletedRegistration {
    const now = new Date();
    const randomHex = Math.floor(1000 + Math.random() * 9000).toString();
    const referenceId = `SARA-${now.getFullYear()}-KA-${randomHex}`;

    const data: Record<FieldId, string> = {
      fullName: this.fieldValues.fullName?.value || '',
      age: this.fieldValues.age?.value || '',
      mobileNumber: this.fieldValues.mobileNumber?.value || '',
      location: this.fieldValues.location?.value || '',
      volunteerReason: this.fieldValues.volunteerReason?.value || '',
    };

    const provenance: Record<FieldId, any> = {} as any;
    for (const f of COMMUNITY_SERVICE_FORM_SCHEMA) {
      const fData = this.fieldValues[f.id];
      provenance[f.id] = {
        method: fData?.extractionMethod || 'manual_input',
        confidence: fData?.confidence || 'high',
        rawTranscript: fData?.rawTranscript || fData?.value || '',
      };
    }

    return {
      referenceId,
      completedAt: now.toISOString(),
      data,
      isDemoLocalOnly: true,
      provenance,
    };
  }
}

