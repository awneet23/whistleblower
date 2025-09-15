export type Bounty = {
  newsOrganizationId: number;
  newsOrganizationPublicKey: string;
  bountyId: number;
  orgName: string;
  topic: string;
  description: string;
  bountyAmount: number;
  submissionCount: number;
  hasAcceptedSubmission: boolean;
  acceptedSubmissionId: number;
};
