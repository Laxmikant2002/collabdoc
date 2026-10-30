export type PermissionRole = 'owner' | 'editor' | 'viewer';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatarColor: string;
  avatarText: string;
}

export interface Collaborator {
  userId: string;
  role: 'editor' | 'viewer';
  addedAt: string;
}

export interface DocumentComment {
  id: string;
  documentId: string;
  userId: string;
  userName: string;
  userAvatarColor: string;
  content: string;
  createdAt: string;
  resolved: boolean;
  resolvedBy?: string;
  replies?: {
    id: string;
    userId: string;
    userName: string;
    userAvatarColor: string;
    content: string;
    createdAt: string;
  }[];
}

export interface DocumentVersion {
  id: string;
  timestamp: string;
  title: string;
  contentHtml: string;
  savedByUserId: string;
  savedByUserName: string;
  note?: string;
}

export interface DocumentItem {
  id: string;
  title: string;
  contentHtml: string;
  icon?: string;
  ownerId: string;
  collaborators: Collaborator[];
  isPublicLinkEnabled: boolean;
  publicLinkRole: 'viewer' | 'editor';
  createdAt: string;
  updatedAt: string;
  lastModifiedByUserId: string;
  starred: boolean;
  trashed: boolean;
  category?: string;
}

export type ViewFilter = 'all' | 'my-docs' | 'shared-with-me' | 'starred' | 'trash';
