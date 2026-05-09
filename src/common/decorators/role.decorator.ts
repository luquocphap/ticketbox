import { SetMetadata } from "@nestjs/common";

export const ROLE_KEY = "ROLE_KEY";
export const Role = (role: "KhachHang" | "QuanTri") => SetMetadata(ROLE_KEY, role);