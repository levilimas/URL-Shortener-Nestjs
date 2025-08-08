import { IsArray, ValidateNested, ArrayMaxSize, ArrayMinSize } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';
import { CreateUrlDto } from './create-url.dto';

export class BulkCreateUrlDto {
  @ApiProperty({
    type: [CreateUrlDto],
    description: 'Array of URLs to be shortened',
    example: [
      {
        originalUrl: 'https://www.example1.com/long-url',
        description: 'First URL',
      },
      {
        originalUrl: 'https://www.example2.com/another-long-url',
        description: 'Second URL',
        customCode: 'custom123',
      },
    ],
  })
  @IsArray()
  @ArrayMinSize(1, { message: 'At least one URL is required' })
  @ArrayMaxSize(100, { message: 'Maximum 100 URLs allowed per batch' })
  @ValidateNested({ each: true })
  @Type(() => CreateUrlDto)
  urls: CreateUrlDto[];
}