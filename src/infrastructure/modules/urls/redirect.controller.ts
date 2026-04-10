import {
  Controller,
  Get,
  Param,
  Query,
  Req,
  Res,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { UrlsService } from './urls.service';
import {
  ApiTags,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
} from '@nestjs/swagger';

@ApiTags('redirect')
@Controller()
export class RedirectController {
  constructor(private readonly urlsService: UrlsService) {}

  @Get(':shortCode')
  @ApiOperation({ summary: 'Redirect to original URL' })
  @ApiParam({ name: 'shortCode', description: 'Short code of the URL' })
  @ApiQuery({
    name: 'password',
    required: false,
    description: 'Password for protected URLs',
  })
  @ApiResponse({ status: 302, description: 'Redirect to original URL' })
  @ApiResponse({ status: 404, description: 'URL not found' })
  @ApiResponse({
    status: 400,
    description: 'URL expired, reached max clicks, or password required',
  })
  async redirect(
    @Param('shortCode') shortCode: string,
    @Query('password') password: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    const url = await this.urlsService.findByShortCode(shortCode, password);
    await this.urlsService.incrementClicks(shortCode, req);
    return res.redirect(HttpStatus.FOUND, url.originalUrl);
  }
}
