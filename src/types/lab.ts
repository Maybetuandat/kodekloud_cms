export interface Lab {
  id: string;
  name: string;
  description?: string;
  baseImage: string;
  estimatedTime: number;
  isActive: boolean;
  createdAt: string;
}

export interface CreateLabRequest {
  name: string;
  description?: string;
  baseImage: string;
  estimatedTime: number;
}

export interface UpdateLabRequest extends CreateLabRequest {}
