import { ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsNotEmpty, Matches, MinLength } from "class-validator";

export class LoginDto{
    @IsNotEmpty()
    @IsEmail(undefined, { message: "Invalid Email" })
    @ApiProperty({ example: "phap@gmail.com" })
    email!: string;

    @IsNotEmpty()
    @MinLength(8, { message: 'Mật khẩu phải ít nhất 8 ký tự' })
    @Matches(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&]).{8,}$/,
        {
            message:
            'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt',
        },
    )
    @ApiProperty({ example: "Password123!" })
    mat_khau!: string;
}