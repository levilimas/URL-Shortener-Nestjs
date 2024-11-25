import { Injectable, NestInterceptor, ExecutionContext, CallHandler } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';
import { InjectMetric } from '@willsoto/nestjs-prometheus';
import { Counter, Histogram } from 'prom-client';

@Injectable()
export class MetricsInterceptor implements NestInterceptor {
  constructor(
    @InjectMetric('http_request_duration_seconds')
    private readonly httpRequestDuration: Histogram<string>,
    @InjectMetric('http_requests_total')
    private readonly httpRequestsTotal: Counter<string>,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const start = Date.now();
    const req = context.switchToHttp().getRequest();
    const path = req.route?.path || 'unknown';
    const method = req.method || 'unknown';

    return next.handle().pipe(
      tap(() => {
        const duration = Date.now() - start;
        this.httpRequestDuration.observe(
          { path, method },
          duration / 1000,
        );
        this.httpRequestsTotal.inc({ path, method });
      }),
    );
  }
}