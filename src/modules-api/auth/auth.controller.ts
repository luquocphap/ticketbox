import { Body, Controller, Delete, Get, Post, Put, Query, Req, Res } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { User } from "src/common/decorators/user.decorator";
import { Public } from "src/common/decorators/public.decorator";
import { Permission } from "src/common/decorators/permission.decorator";
import { RegisterDto } from "./dto/register.dto";
import { LoginDto } from "./dto/login.dto";

@Controller('Auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Get('/getTypeList')
    @Public()
    getTypeList(){
        return this.authService.getTypeList();
    }

    @Post('/register')
    @Public()
    async register(@Body() body: RegisterDto){
        return await this.authService.register(body);
    }

    @Post('/login')
    @Public()
    async login(@Body() body: LoginDto, @Res({ passthrough: true }) res: Response){
        const result = await this.authService.login(body);
        res.cookie("accessToken", result.accessToken);
        res.cookie("refreshToken", result.refreshToken);
        return result;
    }

    @Post('/RefreshToken')
    @Public()
    async refreshToken(@Req() req: Request, @Res() res: Response){
        const result = await this.authService.refreshToken(req);
        res.cookie('accessToken', result.accessToken);
        res.cookie('refreshToken', result.refreshToken);
        res.json({result});
    }
}