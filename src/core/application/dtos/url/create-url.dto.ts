import { IsUrl, IsOptional, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUrlDto {
  @ApiProperty({
    description: 'URL original a ser encurtada',
  })
  @IsUrl({}, { message: 'Por favor, forneça uma URL válida' })
  originalUrl: string;

  @ApiPropertyOptional({
    description: 'ID do usuário (para usuários autenticados)',
  })
  @IsOptional()
  @IsUUID()
  userId?: string;
}