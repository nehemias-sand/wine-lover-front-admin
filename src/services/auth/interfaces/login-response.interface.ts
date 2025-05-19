import type { Profile } from "@/services/catalogs/interfaces/catalogs-response.interface";

export interface LoginResponse {
    data: User;
}

export interface User {
    id: number,
    username: string;
    email: string;
    email_verified_at: string;
    profile: Profile;
    profile_id?: number;
    state: boolean;
    permissions?: string[]
    token?: string;
}
