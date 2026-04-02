/**
 * HealthService — fetches /api/admin/health
 */
import { adminAPI } from "../api/adminApi";

class HealthServiceClass {
  async getHealth() {
    const res = await adminAPI.get("/api/admin/health");
    return res.data;
  }
}

export const HealthService = new HealthServiceClass();
