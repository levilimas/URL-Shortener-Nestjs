import { ApiProperty } from '@nestjs/swagger';

export class AuthResponseDto {
  @ApiProperty({
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
    description: 'JWT Access Token',
  })
  token: string;

  @ApiProperty({
    description: 'User information',
  })
  user: {
    id: string;
    email: string;
    name?: string;
  };
}