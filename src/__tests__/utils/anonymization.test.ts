import { anonymizePatientId, anonymizeLog } from '../../utils/anonymization';

describe('Anonymization Utils', () => {
  describe('anonymizePatientId', () => {
    it('should return empty string for empty input', () => {
      expect(anonymizePatientId('')).toBe('');
    });

    it('should return consistent hash for same input', () => {
      const patientId = 'test123';
      const hash1 = anonymizePatientId(patientId);
      const hash2 = anonymizePatientId(patientId);
      expect(hash1).toBe(hash2);
    });

    it('should return different hashes for different inputs', () => {
      const hash1 = anonymizePatientId('test123');
      const hash2 = anonymizePatientId('test456');
      expect(hash1).not.toBe(hash2);
    });

    it('should return hash with correct format', () => {
      const hash = anonymizePatientId('test123');
      expect(hash).toMatch(/^anon_[a-f0-9]{16}$/);
    });
  });

  describe('anonymizeLog', () => {
    it('should anonymize patient_id in log object', () => {
      const log = {
        timestamp: new Date(),
        source: 'test-service',
        severity: 'info',
        message: 'Test message',
        patient_id: 'test123',
      };

      const anonymized = anonymizeLog(log);
      expect(anonymized.patient_id).toMatch(/^anon_[a-f0-9]{16}$/);
      expect(anonymized.patient_id).not.toBe(log.patient_id);
    });

    it('should not modify other fields', () => {
      const log = {
        timestamp: new Date(),
        source: 'test-service',
        severity: 'info',
        message: 'Test message',
        patient_id: 'test123',
      };

      const anonymized = anonymizeLog(log);
      expect(anonymized.timestamp).toBe(log.timestamp);
      expect(anonymized.source).toBe(log.source);
      expect(anonymized.severity).toBe(log.severity);
      expect(anonymized.message).toBe(log.message);
    });

    it('should handle log without patient_id', () => {
      const log = {
        timestamp: new Date(),
        source: 'test-service',
        severity: 'info',
        message: 'Test message',
      };

      const anonymized = anonymizeLog(log);
      expect(anonymized).toEqual(log);
    });
  });
});
