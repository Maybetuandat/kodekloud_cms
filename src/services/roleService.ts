import { api } from "@/lib/api";
import { Role } from "@/types/role";

export const roleService = {
  getAllRoles: async (): Promise<Role[]> => {
    const response = await api.get<Role[]>("/roles");
    return response;
  },
};
