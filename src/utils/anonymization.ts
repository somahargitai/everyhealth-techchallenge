import { createHash } from 'crypto';

/**
 * Anonymizes a patient ID by creating a one-way hash
 * This ensures the same patient_id will always hash to the same value
 * while making it impossible to reverse the hash to get the original ID
 */
export function anonymizePatientId(patientId: string): string {
  if (!patientId) return '';

  // Using SHA-256 for a secure one-way hash
  const hash = createHash('sha256');
  hash.update(patientId);

  // Return first 16 characters of the hash for readability
  // while maintaining uniqueness
  return `anon_${hash.digest('hex').substring(0, 16)}`;
}

/**
 * Anonymizes sensitive fields in a log object
 */
export function anonymizeLog(log: Record<string, any>): Record<string, any> {
  const anonymizedLog = { ...log };

  if (anonymizedLog.patient_id) {
    anonymizedLog.patient_id = anonymizePatientId(anonymizedLog.patient_id);
  }

  // Add more sensitive fields here as needed

  return anonymizedLog;
}
