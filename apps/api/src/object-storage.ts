import { createMediaStorage, type ObjectStorageSettings } from "@i-remember/storage";
import { authenticate, requireRole } from "./auth.js";
import { ApiError } from "./errors.js";
import { readJson, type Router, type RequestContext } from "./http.js";
import { assertSafeWriteOrigin, assertRateLimit, requestClientAddress } from "./request-security.js";

export function registerObjectStorageRoutes(router: Router, storage = createMediaStorage()) {
  async function action(context: RequestContext, operation: "read" | "save" | "test") {
    requireRole(authenticate(context.req), ["ADMIN"]);
    context.res.setHeader("Cache-Control", "no-store");
    if (operation !== "read") {
      assertSafeWriteOrigin(context.req);
      assertRateLimit(context.res, { bucket: "object-storage", identity: requestClientAddress(context.req), limit: 12, windowMs: 60000 });
    }
    try {
      const input = operation === "read" ? null : await readJson(context.req, { maxBytes: 8192 });
      if (operation === "save") await storage.test(input as ObjectStorageSettings);
      const data = operation === "read" ? await storage.settings(context.url.searchParams.get("provider") || undefined)
        : operation === "test" ? await storage.test(input as ObjectStorageSettings) : await storage.save(input as ObjectStorageSettings);
      return { success: true, data };
    } catch (error: any) {
      if (error instanceof ApiError) throw error;
      throw new ApiError(error.statusCode || 500, error.code === "object_storage_error" ? error.message : "Storage operation failed", "object_storage_error");
    }
  }
  router.add("GET", "/api/v1/storage", context => action(context, "read"));
  router.add("PUT", "/api/v1/storage", context => action(context, "save"));
  router.add("POST", "/api/v1/storage/test", context => action(context, "test"));
}
