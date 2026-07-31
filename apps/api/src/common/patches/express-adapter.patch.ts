import { ExpressAdapter } from '@nestjs/platform-express';

/**
 * Patch for NestJS 11 ExpressAdapter bug where line 337 accesses `app.router`.
 * Express 4 defines a getter for `app.router` that throws:
 * `'app.router' is deprecated! Please see the 3.x to 4.x migration guide...`
 */
(ExpressAdapter.prototype as any).isMiddlewareApplied = function (name: string) {
  const app = this.getInstance();
  const router = app?._router;
  return (
    !!router &&
    !!router.stack &&
    Array.isArray(router.stack) &&
    router.stack.some((layer: any) => layer && layer.handle && layer.handle.name === name)
  );
};
