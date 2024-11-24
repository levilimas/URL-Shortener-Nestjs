// src/infrastructure/modules/urls/urls.controller.ts
import {
    Controller,
    Get,
    Post,
    Put,
    Delete,
    Body,
    Param,
    UseGuards,
    Res,
    HttpStatus,
  } from '@nestjs/common';
  import { Response } from 'express';
  import { UrlsService } from './urls.service';
  import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
  import { GetUser } from '../../../shared/decorators/get-user.decorator';
  import { CreateUrlDto } from '../../../application/dtos/url/create-url.dto';
  import { UpdateUrlDto } from '../../../application/dtos/url/update-url.dto';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBearerAuth,
    ApiParam,
    ApiBody 
  } from '@nestjs/swagger';
  import { UrlResponseDto } from '../../../application/dtos/url/url-response.dto';
  
  @ApiTags('urls')
  @Controller('urls')
  export class UrlsController {
    constructor(private readonly urlsService: UrlsService) {}
  
    @Post()
    @ApiOperation({ summary: 'Create short URL (public)' })
    @ApiBody({ type: CreateUrlDto })
    @ApiResponse({
      status: 201,
      description: 'URL successfully shortened',
      type: UrlResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid URL format' })
    async create(@Body() createUrlDto: CreateUrlDto) {
      const url = await this.urlsService.create(createUrlDto);
      return {
        originalUrl: url.originalUrl,
        shortUrl: this.urlsService.getShortUrl(url.shortCode),
      };
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('auth')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create short URL (authenticated)' })
    @ApiBody({ type: CreateUrlDto })
    @ApiResponse({
      status: 201,
      description: 'URL successfully shortened',
      type: UrlResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 400, description: 'Invalid URL format' })
    async createAuthenticated(
      @Body() createUrlDto: CreateUrlDto,
      @GetUser() user: any,
    ) {
      const url = await this.urlsService.create(createUrlDto, user.id);
      return {
        originalUrl: url.originalUrl,
        shortUrl: this.urlsService.getShortUrl(url.shortCode),
      };
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('my-urls')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all URLs created by user' })
    @ApiResponse({
      status: 200,
      description: 'List of URLs',
      type: [UrlResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@GetUser() user: any) {
      const urls = await this.urlsService.findAll(user.id);
      return urls.map(url => ({
        ...url,
        shortUrl: this.urlsService.getShortUrl(url.shortCode),
      }));
    }
  
    @Get(':shortCode')
    @ApiOperation({ summary: 'Redirect to original URL' })
    @ApiParam({ name: 'shortCode', description: 'Short code of the URL' })
    @ApiResponse({ status: 301, description: 'Redirect to original URL' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    async redirect(@Param('shortCode') shortCode: string, @Res() res: Response) {
      const url = await this.urlsService.findByShortCode(shortCode);
      await this.urlsService.incrementClicks(shortCode);
      return res.redirect(HttpStatus.MOVED_PERMANENTLY, url.originalUrl);
    }
  
    @UseGuards(JwtAuthGuard)
    @Put(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Update URL' })
    @ApiParam({ name: 'id', description: 'ID of the URL to update' })
    @ApiBody({ type: UpdateUrlDto })
    @ApiResponse({
      status: 200,
      description: 'URL successfully updated',
      type: UrlResponseDto,
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    async update(
      @Param('id') id: string,
      @Body() updateUrlDto: UpdateUrlDto,
      @GetUser() user: any,
    ) {
      const url = await this.urlsService.update(id, user.id, updateUrlDto);
      return {
        ...url,
        shortUrl: this.urlsService.getShortUrl(url.shortCode),
      };
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete(':id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete URL' })
    @ApiParam({ name: 'id', description: 'ID of the URL to delete' })
    @ApiResponse({ status: 204, description: 'URL successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    async delete(@Param('id') id: string, @GetUser() user: any) {
      await this.urlsService.delete(id, user.id);
      return { message: 'URL deleted successfully' };
    }
  }