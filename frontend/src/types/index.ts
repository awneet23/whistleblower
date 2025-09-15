// Central type definitions for the Whistleblower Privacy Platform
// This file serves as the single source of truth for all shared interfaces

export interface Bounty {
  id: number;
  title: string;
  organization: string;
  rewardTokenContract: string;
  rewardAmount: string;
  isOpen: boolean;
  createdAt: number;
}

export interface Claim {
  id: number;
  bountyId: number;
  whistleblower: string;
  teaser: string;
  encryptedDataCid: string;
  status: number; // 0: Pending, 1: Approved, 2: Rejected
  submittedAt: number;
}

// Additional shared types for the application
export interface Organization {
  id: string;
  name: string;
  address: string;
  publicKey: string;
  createdAt: number;
}

export interface Token {
  address: string;
  symbol: string;
  name: string;
  decimals: number;
}
