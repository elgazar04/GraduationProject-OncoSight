const { z } = require('zod');

// Patient Registration schema
const registerPatientSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  dob: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
});

// Doctor Registration schema
const registerDoctorSchema = z.object({
  name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
  email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
  password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
  specialty: z.string({ required_error: 'Specialty is required' }).min(2, 'Specialty is required'),
  license: z.string().optional().nullable(),
});

// Scan Upload Intake Data schema (merged patient profile update fields)
const scanIntakeSchema = z.object({
  age: z.number().int().min(0).max(120).optional().nullable(),
  gender: z.enum(['male', 'female']).optional().nullable(),
  smoking_status: z.string().optional().nullable(),
  diabetes: z.boolean().optional(),
  hypertension: z.boolean().optional(),
  prior_cancer: z.boolean().optional(),
  prior_brain_surgery: z.boolean().optional(),
  immunosuppressed: z.boolean().optional(),
  seizures: z.boolean().optional(),
  headache_severity: z.number().min(0).max(10).optional().nullable(),
  symptom_duration_weeks: z.number().min(0).optional().nullable(),
  functional_status: z.enum(['Independent', 'Some help', 'Significant help', 'Bed-bound']).optional().nullable(),
  neurological_symptoms: z.number().int().min(0).max(3).optional().nullable(),
});

module.exports = {
  registerPatientSchema,
  registerDoctorSchema,
  scanIntakeSchema
};
