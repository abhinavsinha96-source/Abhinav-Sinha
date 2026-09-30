import { ModerationResult } from '../types';

// Sensitive / prohibited patterns categorized
const HARASSMENT_TERMS = [
  'kill yourself', 'kys', 'die in a fire', 'hope you die', 'stupid loser',
  'ugly trash', 'nobody likes you', 'go die', 'worthless pig', 'harass'
];

const HATE_SPEECH_TERMS = [
  'nazi', 'white supremacist', 'racial slur', 'subhuman', 'hate group',
  'terrorist scum', 'ethnic cleansing'
];

const PROFANITY_TERMS = [
  'fuck', 'shit', 'bitch', 'asshole', 'bastard', 'cunt', 'dick', 'pussy',
  'bullshit', 'motherfucker', 'fucker'
];

const SPAM_PATTERNS = [
  /\b(free money|claim your prize|click here to win|crypto bonus|send btc|guaranteed returns|earn \$[0-9]+ per day)\b/i,
  /\b(whatsapp me at \+?[0-9]{8,15}|telegram @[a-z0-9_]+ for deals)\b/i
];

const PII_PATTERNS = [
  // Phone numbers like +1-555-123-4567 or 555-123-4567
  /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/,
  // Credit card pattern (16 digits)
  /\b(?:\d{4}[-\s]?){3}\d{4}\b/,
  // Social security number (US SSN)
  /\b\d{3}-\d{2}-\d{4}\b/
];

/**
 * Evaluates text against Haven Community Safety Rules
 */
export function checkContentModeration(text: string): ModerationResult {
  if (!text || text.trim() === '') {
    return { isFlagged: false, score: 0 };
  }

  const lower = text.toLowerCase();
  const highlightedTerms: string[] = [];
  let severityScore = 0;
  let category: ModerationResult['category'];
  let reason = '';
  let suggestedAction: ModerationResult['suggestedAction'] = 'warn';

  // 1. Check Harassment
  for (const term of HARASSMENT_TERMS) {
    if (lower.includes(term)) {
      highlightedTerms.push(term);
      severityScore = Math.max(severityScore, 0.95);
      category = 'harassment';
      reason = 'Harassment or targeted hostility detected.';
      suggestedAction = 'block';
    }
  }

  // 2. Check Hate Speech
  if (severityScore < 0.9) {
    for (const term of HATE_SPEECH_TERMS) {
      if (lower.includes(term)) {
        highlightedTerms.push(term);
        severityScore = Math.max(severityScore, 0.95);
        category = 'hate_speech';
        reason = 'Hate speech or discriminatory content detected.';
        suggestedAction = 'block';
      }
    }
  }

  // 3. Check PII Leaks (Privacy Protection)
  if (severityScore < 0.8) {
    for (const pattern of PII_PATTERNS) {
      const match = text.match(pattern);
      if (match) {
        highlightedTerms.push(match[0]);
        severityScore = Math.max(severityScore, 0.75);
        category = 'pii_leak';
        reason = 'Sensitive personal data (phone/account/identity) detected.';
        suggestedAction = 'warn';
      }
    }
  }

  // 4. Check Profanity
  if (severityScore < 0.7) {
    for (const term of PROFANITY_TERMS) {
      // Word boundary check
      const regex = new RegExp(`\\b${term}\\b`, 'i');
      if (regex.test(text)) {
        highlightedTerms.push(term);
        severityScore = Math.max(severityScore, 0.6);
        if (!category) category = 'profanity';
        reason = 'Profanity or vulgar language detected.';
        suggestedAction = 'blur';
      }
    }
  }

  // 5. Check Spam
  if (severityScore < 0.5) {
    for (const pattern of SPAM_PATTERNS) {
      if (pattern.test(text)) {
        highlightedTerms.push('spam-pattern');
        severityScore = Math.max(severityScore, 0.65);
        category = 'spam';
        reason = 'Unsolicited promotional or suspicious scam content detected.';
        suggestedAction = 'warn';
      }
    }
  }

  return {
    isFlagged: severityScore >= 0.5,
    score: severityScore,
    category,
    reason,
    highlightedTerms: Array.from(new Set(highlightedTerms)),
    suggestedAction
  };
}

/**
 * Replaces flagged profane words with subtle asterisks for display
 */
export function sanitizeText(text: string): string {
  let sanitized = text;
  for (const term of PROFANITY_TERMS) {
    const regex = new RegExp(`\\b${term}\\b`, 'gi');
    sanitized = sanitized.replace(regex, (match) => {
      return match[0] + '*'.repeat(match.length - 1);
    });
  }
  return sanitized;
}
