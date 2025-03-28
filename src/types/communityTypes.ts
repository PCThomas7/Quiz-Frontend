export interface Attachment {
  _id: string;
  url: string;
  type: string;
  name: string;
}

export interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPost {
  _id: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
    email: string;
  };
  tags?: string[];
  attachments: Attachment[];
  likes: number;
  likedBy: string[];
  likedByCurrentUser?: boolean;
  comments?: Comment[];
  createdAt: string;
  updatedAt: string;
}

export interface CommunityPostFormData {
  title: string;
  content: string;
  tags?: string[];
  attachments?: File[];
}