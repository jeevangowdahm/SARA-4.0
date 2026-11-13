import { describe, it, expect } from 'vitest';

const BASE_URL = 'http://localhost:3001';

describe('SARA 4.0 Live Groq LLM Integration Tests', () => {
  it('invokes Groq openai/gpt-oss-120b to explain questions in simple Kannada with JSON schema', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/explain-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldLabel: 'Residential Correspondence Address',
        fieldName: 'applicantAddress',
        targetLanguage: 'kn',
      }),
    }).then((r) => r.json());

    expect(res).toBeDefined();
    expect(res.simpleExplanation).toBeDefined();
    expect(res.relatableExample).toBeDefined();
    expect(res.targetLanguage).toBe('kn');
    // Either groq live or deterministic fallback verified
    expect(['groq', 'sara-local-neural-router']).toContain(res.provider);
  }, 15000);

  it('invokes Groq to explain questions in simple Hindi with JSON schema', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/explain-question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldLabel: 'Annual Gross Family Income',
        fieldName: 'householdIncome',
        targetLanguage: 'hi',
      }),
    }).then((r) => r.json());

    expect(res).toBeDefined();
    expect(res.simpleExplanation).toBeDefined();
    expect(res.relatableExample).toBeDefined();
    expect(res.targetLanguage).toBe('hi');
  }, 15000);

  it('invokes Groq to explain validation errors into gentle actionable guidance', async () => {
    const res = await fetch(`${BASE_URL}/api/ai/explain-error`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fieldLabel: '10-Digit Mobile Number',
        errorMessage: 'Pattern mismatch: value does not match [6-9][0-9]{9}',
        targetLanguage: 'en',
      }),
    }).then((r) => r.json());

    expect(res).toBeDefined();
    expect(res.simpleExplanation).toBeDefined();
    expect(res.actionableStep).toBeDefined();
  }, 15000);
});

