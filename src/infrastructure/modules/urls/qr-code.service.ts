import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class QrCodeService {
  constructor(private configService: ConfigService) {}

  /**
   * Generate QR code URL using QR Server API
   * This is a free service that generates QR codes
   */
  generateQrCodeUrl(url: string): string {
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      size: '200x200',
      data: url,
      format: 'png',
      margin: '10',
      color: '000000',
      bgcolor: 'ffffff',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate QR code URL with custom styling
   */
  generateStyledQrCodeUrl(
    shortUrl: string,
    options: {
      size?: number;
      color?: string;
      bgcolor?: string;
      margin?: number;
      format?: 'png' | 'gif' | 'jpeg' | 'jpg' | 'svg';
    } = {},
  ): string {
    const {
      size = 200,
      color = '000000',
      bgcolor = 'ffffff',
      margin = 10,
      format = 'png',
    } = options;

    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      data: shortUrl,
      size: `${size}x${size}`,
      format,
      margin: margin.toString(),
      color: color.replace('#', ''),
      bgcolor: bgcolor.replace('#', ''),
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Generate QR code with logo (premium feature simulation)
   */
  async generateQrCodeWithLogo(url: string, logoUrl?: string): Promise<string> {
    const baseUrl = 'https://api.qrserver.com/v1/create-qr-code/';
    const params = new URLSearchParams({
      size: '300x300',
      data: url,
      format: 'png',
      margin: '10',
      color: '000000',
      bgcolor: 'ffffff',
    });

    return `${baseUrl}?${params.toString()}`;
  }

  /**
   * Validate QR code parameters
   */
  validateQrCodeOptions(options: any): boolean {
    const { size, color, bgcolor } = options;

    if (size && (size < 50 || size > 1000)) {
      return false;
    }

    if (color && !/^[0-9A-Fa-f]{6}$/.test(color.replace('#', ''))) {
      return false;
    }

    if (bgcolor && !/^[0-9A-Fa-f]{6}$/.test(bgcolor.replace('#', ''))) {
      return false;
    }

    return true;
  }
}