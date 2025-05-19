import type { User } from "@/services/auth/interfaces/login-response.interface";

export interface RegisterAdminResponse {
    data: User;
}

export interface UpdateUserResponse extends RegisterAdminResponse {
}
