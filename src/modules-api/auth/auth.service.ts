import { BadRequestException, Injectable } from "@nestjs/common";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";
import * as bcrypt from "bcrypt";
import { TokenService } from "src/modules-system/token/token.service";
import { PrismaService } from "src/modules-system/prisma/prisma.service";
import { Request } from "express";

@Injectable()
export class AuthService {
    constructor(private tokenService: TokenService, private prisma: PrismaService) {}

    async getTypeList(){
        const userTypes = await this.prisma.roles.findMany({
            select: {
                loai_nguoi_dung: true,
                ten_loai: true,
            }
        });
        return userTypes;
    }

    async register(body: RegisterDto) {
        const { email, full_name, password } = body;

        console.log({ email, password, full_name });

        const userExist = await this.prisma.users.findUnique({
            where: {
                email: email
            }
        });

        if (userExist) {
            throw new BadRequestException("User existed");
        }

        const hashPassword = bcrypt.hashSync(password, 10);

        await this.prisma.users.create({
            data: {
                email: email,
                password_hash: hashPassword,
                full_name: full_name,
                role: "KhachHang"
            }
        })

        return true;
    }

    async login(body: LoginDto){
        const { email, mat_khau } = body;

        const userExist = await this.prisma.users.findUnique({
            where: {
                email: email,
            },
            omit: {
                password_hash: false
            }
        })

        if (!userExist) {
            throw new BadRequestException("Users have not registered");
        }

        const isPassword = bcrypt.compare(mat_khau, userExist.password_hash);

        if (!isPassword){
            throw new BadRequestException("invalid password")
        }

        const accessToken = this.tokenService.createAccessToken(userExist.id);
        const refreshToken = this.tokenService.createRefreshToken(userExist.id);

        return {
            accessToken: accessToken,
            refreshToken: refreshToken
        }
    }

    async refreshToken(req: Request){
        const { accessToken, refreshToken } = req.cookies;

        if (!accessToken) throw new BadRequestException("accessToken does not exist");

        if (!refreshToken) throw new BadRequestException("refreshToken does not exist");

        const decodeAccessToken: any = this.tokenService.verifyAccessToken(accessToken, { ignoreExpiration: true });
        const decodeRefreshToken: any = this.tokenService.verifyRefreshToken(refreshToken);

        if (decodeAccessToken.userId !== decodeRefreshToken.userId) throw new BadRequestException("cannot refresh token");

        const user = await this.prisma.users.findUnique({
            where: {
                id: decodeAccessToken.userId
            }
        })

        if (!user) throw new BadRequestException("user does not exist");

        const newAccesstToken = this.tokenService.createAccessToken(user.id);
        const newRefreshToken = this.tokenService.createRefreshToken(user.id);

        return {
            accessToken: newAccesstToken,
            refreshToken: newRefreshToken
        }
    }
}