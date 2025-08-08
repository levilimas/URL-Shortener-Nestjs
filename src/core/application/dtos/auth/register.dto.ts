import { IsEmail, IsString, MinLength, IsOptional, IsNotEmpty, MaxLength } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegisterDto {
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

  @ApiProperty({
    description: 'Nome completo do usuário',
  })
  @IsString()
  @IsNotEmpty({ message: 'Nome é obrigatório' })
  @MaxLength(255)
  name: string;
}