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
    Query,
    Req,
  } from '@nestjs/common';
  import { Request, Response } from 'express';
  import { UrlsService } from './urls.service';
  import { JwtAuthGuard } from '../../../shared/guards/jwt-auth.guard';
  import { GetUser } from '../../../shared/decorators/get-user.decorator';
  import { CreateUrlDto } from '../../../application/dtos/url/create-url.dto';
  import { UpdateUrlDto } from '../../../application/dtos/url/update-url.dto';
  import { BulkCreateUrlDto } from '../../../application/dtos/url/bulk-create-url.dto';
  import { 
    ApiTags, 
    ApiOperation, 
    ApiResponse, 
    ApiBearerAuth,
    ApiParam,
    ApiBody,
    ApiQuery 
  } from '@nestjs/swagger';
  import { UrlResponseDto } from '../../../application/dtos/url/url-response.dto';
  import { UrlAnalyticsDto } from '../../../application/dtos/url/analytics.dto';
  
  @ApiTags('urls')
  @Controller()
  export class UrlsController {
    constructor(private readonly urlsService: UrlsService) {}
  
    @Post('shorten')
    @ApiOperation({ summary: 'Create short URL (public)' })
    @ApiBody({ type: CreateUrlDto })
    @ApiResponse({
      status: 201,
      description: 'URL successfully shortened',
      type: UrlResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Invalid URL format' })
    async createPublic(@Body() createUrlDto: CreateUrlDto): Promise<UrlResponseDto> {
      const url = await this.urlsService.create(createUrlDto);
      return this.mapToResponseDto(url);
    }
  
    @UseGuards(JwtAuthGuard)
    @Post('urls')
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
    async create(
      @Body() createUrlDto: CreateUrlDto,
      @GetUser('id') userId: string,
    ): Promise<UrlResponseDto> {
      const url = await this.urlsService.create(createUrlDto, userId);
      return this.mapToResponseDto(url);
    }

    @Post('urls/bulk')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Create multiple short URLs (authenticated)' })
    @ApiResponse({
      status: 201,
      description: 'URLs created successfully',
    })
    async createBulk(
      @Body() bulkCreateUrlDto: BulkCreateUrlDto,
      @GetUser('id') userId: string,
    ) {
      const result = await this.urlsService.createBulk(bulkCreateUrlDto, userId);
      return {
        ...result,
        successfulUrls: result.successfulUrls.map(url => this.mapToResponseDto(url)),
      };
    }
  
    @UseGuards(JwtAuthGuard)
    @Get('urls')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get all URLs created by user' })
    @ApiResponse({
      status: 200,
      description: 'List of URLs',
      type: [UrlResponseDto],
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async findAll(@GetUser('id') userId: string): Promise<UrlResponseDto[]> {
      const urls = await this.urlsService.findAll(userId);
      return urls.map(url => this.mapToResponseDto(url));
    }

    @Get('urls/:id/analytics')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get URL analytics' })
    @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
    @ApiResponse({
      status: 200,
      description: 'Analytics retrieved successfully',
      type: UrlAnalyticsDto,
    })
    async getUrlAnalytics(
      @Param('id') id: string,
      @GetUser('id') userId: string,
      @Query('days') days: number = 30,
    ): Promise<UrlAnalyticsDto> {
      return this.urlsService.getAnalytics(id, userId, days);
    }

    @Get('analytics')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Get user analytics' })
    @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze (default: 30)' })
    @ApiResponse({
      status: 200,
      description: 'User analytics retrieved successfully',
    })
    async getUserAnalytics(
      @GetUser('id') userId: string,
      @Query('days') days: number = 30,
    ) {
      return this.urlsService.getUserAnalytics(userId, days);
    }

    @Post('urls/:id/qr')
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Generate QR code for URL' })
    @ApiResponse({
      status: 200,
      description: 'QR code generated successfully',
    })
    async generateQrCode(
      @Param('id') id: string,
      @GetUser('id') userId: string,
      @Body() options: any = {},
    ) {
      const qrCodeUrl = await this.urlsService.generateQrCode(id, userId, options);
      return { qrCodeUrl };
    }
  
    @Get(':shortCode')
    @ApiOperation({ summary: 'Redirect to original URL' })
    @ApiParam({ name: 'shortCode', description: 'Short code of the URL' })
    @ApiQuery({ name: 'password', required: false, description: 'Password for protected URLs' })
    @ApiResponse({ status: 302, description: 'Redirect to original URL' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    @ApiResponse({ status: 400, description: 'URL expired, reached max clicks, or password required' })
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
  
    @UseGuards(JwtAuthGuard)
    @Put('urls/:id')
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
      @GetUser('id') userId: string,
    ): Promise<UrlResponseDto> {
      const url = await this.urlsService.update(id, userId, updateUrlDto);
      return this.mapToResponseDto(url);
    }
  
    @UseGuards(JwtAuthGuard)
    @Delete('urls/:id')
    @ApiBearerAuth()
    @ApiOperation({ summary: 'Delete URL' })
    @ApiParam({ name: 'id', description: 'ID of the URL to delete' })
    @ApiResponse({ status: 200, description: 'URL successfully deleted' })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    @ApiResponse({ status: 404, description: 'URL not found' })
    async delete(@Param('id') id: string, @GetUser('id') userId: string) {
      await this.urlsService.delete(id, userId);
      return { message: 'URL deleted successfully' };
    }

    private mapToResponseDto(url: any): UrlResponseDto {
      return {
        id: url.id,
        originalUrl: url.originalUrl,
        shortCode: url.shortCode,
        shortUrl: this.urlsService.getShortUrl(url.shortCode),
        clicks: url.clicks,
        description: url.description,
        expiresAt: url.expiresAt,
        isActive: url.isActive,
        isCustomCode: url.isCustomCode,
        qrCodeUrl: url.qrCodeUrl,
        maxClicks: url.maxClicks,
        isExpired: url.isExpired(),
        hasReachedMaxClicks: url.hasReachedMaxClicks(),
        isAccessible: url.isAccessible(),
        createdAt: url.createdAt,
        updatedAt: url.updatedAt,
      };
    }
  }