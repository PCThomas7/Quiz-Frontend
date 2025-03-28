export interface CommunityPost {
  _id?: string;
  title: string;
  content: string;
  author: {
    _id: string;
    name: string;
  };
  tags?: string[];
  attachments?: {
    url: string;
    type: string;
    name: string;
  }[];
  likes?: number;
  comments?: {
    _id: string;
    content: string;
    author: {
      _id: string;
      name: string;
    };
    createdAt: string;
  }[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CommunityPostFormData {
  title: string;
  content: string;
  tags?: string[];
  attachments?: File[];
}