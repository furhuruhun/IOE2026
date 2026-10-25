// API_CONTRACT §RequirementItem. Individual items belong to the authenticated user;
// group items belong to their team. Ownership is resolved by Workers, never by the client.
export interface RequirementItem {
  requirementId: string;
  name: string;
  type: 'group' | 'individual';
  status: 'pending' | 'accepted' | 'rejected';
  dueDate: string;
  instructions: string;
  rejectionReason: string | null;
  acceptedFormats: string[];
  file: { url: string; fileName: string } | null;
}
