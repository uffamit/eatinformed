// This file previously registered AI flows with Genkit.
// After migration to NVIDIA NIM, explicit flow registration is no longer needed.
// The AI flows are now standard async functions imported directly by components.
import '@/ai/flows/extract-ingredients';
import '@/ai/flows/assess-health-safety';
