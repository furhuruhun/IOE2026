import type { RequirementItem } from '@/types/requirement';
import { mockCompetitions } from '@/mocks/competitions';
// Development-only, single demo participant. Global store survives separate route bundles.
// No disk storage, real payment instructions, or production fallback.
const state = globalThis as typeof globalThis & { ioeRequirements?: Map<string, RequirementItem[]> };
const store = state.ioeRequirements ??= new Map();
export function getMockRequirements(id: string): RequirementItem[] | undefined {
  const competition = mockCompetitions.find(item => item.id === id);
  if (!competition) return undefined;
  if (!store.has(id)) {
    const names = ['Payment Proof Document', 'Identity Card', 'Passport Photo', 'Active Student Status Letter', 'Twibbon and Poster Proof'];
    store.set(id, names.map((name, index) => ({
      requirementId: `${id}-requirement-${index + 1}`, name,
      type: index === 0 ? 'group' : 'individual', status: 'pending',
      dueDate: competition.deadline,
      instructions: index === 0 ? 'Demo document only. Official payment instructions must be supplied by the organizer.' : 'Upload a clear image of the requested document.',
      rejectionReason: null, acceptedFormats: ['jpg', 'png'], file: null,
    })));
  }
  return store.get(id)!;
}
export function getMockAssignments() {
  return mockCompetitions.slice(0, 1).flatMap(competition => (getMockRequirements(competition.id) ?? [])
    .filter(item => item.status === 'pending')
    .map(item => ({ requirementId: item.requirementId, competitionSlug: competition.slug, competitionName: competition.name,
      name: item.name, type: item.type, status: item.status, dueDate: item.dueDate, acceptedFormats: item.acceptedFormats })));
}
