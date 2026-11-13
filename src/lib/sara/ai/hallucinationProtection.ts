import { ExtractedFact } from './types';

/**
 * Strict Anti-Hallucination & Evidence-Anchoring Guardian
 * SARA rule: Never allow an AI model to invent personal or administrative details
 * that were not explicitly spoken or supplied by the applicant.
 */

export function sanitizeAndAnchorFacts(
  facts: ExtractedFact[],
  originalTranscript: string
): { verifiedFacts: ExtractedFact[]; rejectedFacts: Array<{ fact: ExtractedFact; reason: string }> } {
  const verifiedFacts: ExtractedFact[] = [];
  const rejectedFacts: Array<{ fact: ExtractedFact; reason: string }> = [];

  const lowerTranscript = originalTranscript.toLowerCase();

  facts.forEach((fact) => {
    // 1. Mandatory value and category check
    if (!fact.value || !fact.value.trim() || !fact.category) {
      rejectedFacts.push({ fact, reason: 'Empty or malformed fact value/category' });
      return;
    }

    // 2. Strict Confidence Floor
    if (typeof fact.confidence !== 'number' || fact.confidence < 0.4) {
      rejectedFacts.push({ fact, reason: `Confidence score too low (${fact.confidence})` });
      return;
    }

    // 3. In cross-lingual mode (e.g. Kannada/Hindi spoken, English target),
    // facts mapped through semantic language translation are preserved with mandatory confirmation
    if (fact.language !== 'en') {
      verifiedFacts.push({
        ...fact,
        requiresConfirmation: true,
      });
      return;
    }

    // 4. Hallucination check for mono-lingual input: ensure key tokens of value are present
    const factTokens = fact.value
      .toLowerCase()
      .split(/[\s,.'"-]+/)
      .filter((tok) => tok.length > 2);

    // If fact has multiple distinctive tokens, at least one must occur in the transcript or numbers
    const isNumericFact = fact.category === 'age' || fact.category === 'phone' || fact.category === 'pincode';

    if (isNumericFact) {
      const digitsInFact = fact.value.replace(/\D/g, '');
      const digitsInTranscript = originalTranscript.replace(/\D/g, '');
      if (digitsInFact && !digitsInTranscript.includes(digitsInFact) && !lowerTranscript.includes(fact.value.toLowerCase())) {
        rejectedFacts.push({ fact, reason: 'Numeric value not attested in source speech transcript' });
        return;
      }
    } else if (factTokens.length > 0) {
      const hasTokenMatch = factTokens.some((tok) => lowerTranscript.includes(tok));
      if (!hasTokenMatch && fact.confidence < 0.9) {
        rejectedFacts.push({
          fact,
          reason: `Extracted tokens [${factTokens.join(', ')}] not substantiated in transcript`,
        });
        return;
      }
    }

    // Verified
    verifiedFacts.push({
      ...fact,
      requiresConfirmation: fact.confidence < 0.95, // Require user confirmation unless ultra-high confidence
    });
  });

  return { verifiedFacts, rejectedFacts };
}
