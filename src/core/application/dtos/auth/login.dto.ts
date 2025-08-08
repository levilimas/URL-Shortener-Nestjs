import { IsEmail, IsString, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LoginDto {
  @ApiProperty({
    description: 'Endereço de email do usuário',
  })
  @IsEmail({}, { message: 'Por favor, forneça um email válido' })
  email: string;

  @ApiProperty({
    description: 'Senha do usuário',
  })
  @IsString()
  @MinLength(6, { message: 'A senha deve ter pelo menos 6 caracteres' })
  password: string;
}