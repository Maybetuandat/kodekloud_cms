export interface User {
  id: number;
  lastName: string;
  firstName: string;
  username: string;
  email: string;
  phoneNumber: string;
  isActive: boolean;
  role: string;
}

export interface CreateUserRequest {
  lastName: string;
  firstName: string;
  username: string;
  password: string;
  email: string;
  phoneNumber?: string;
  isActive?: boolean;
  role?: string;
}

export interface UpdateUserRequest {
  lastName?: string;
  firstName?: string;
  username?: string;
  password?: string;
  email?: string;
  phoneNumber?: string;
  isActive?: boolean;
  role?: string;
}

export interface UserFilters {
  keyword: string;
  isActive: boolean | undefined;
}

export interface PaginatedResponse<User> {
  data: User[];
  currentPage: number;
  totalItems: number;
  totalPages: number;
  hasNext: boolean;
  hasPrevious: boolean;
}
