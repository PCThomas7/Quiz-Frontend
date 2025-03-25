export interface User {
  _id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  batches: Array<{
    _id: string;
    name: string;
  }>;
  joinDate: string;
  batchSubscriptions?: Array<{
    batch: {
      _id: string;
      name: string;
    };
    expiresAt: string;
  }>;
}

export interface Batch {
  _id: string;
  name: string;
  description?: string;
  active: boolean;
}

export interface InvitationRequest {
  emails: string;
  role: string;
  batches: string[]; // Array of batch IDs
  batchSubscriptions: Array<{
    batch: string; // batch ID
    expiresOn?: string;
  }>;
}