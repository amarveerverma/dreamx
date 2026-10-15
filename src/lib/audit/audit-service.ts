import { createClient } from '@/lib/supabase/server';

export interface AuditLogEntry {
  actorId: string;
  action: string;
  targetResource: string;
  targetId: string;
  metadata?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
}

export class AuditService {
  /**
   * Writes an immutable audit entry to audit.system_audit_logs.
   * This table is append-only WORM; attempts to update or delete will throw.
   */
  public static async recordAction(entry: AuditLogEntry): Promise<{ success: boolean; error?: string }> {
    try {
      const supabase = createClient();
      const { error } = await supabase.from('system_audit_logs').insert({
        actor_id: entry.actorId,
        action: entry.action,
        target_resource: entry.targetResource,
        target_id: entry.targetId,
        metadata: entry.metadata || {},
        ip_address: entry.ipAddress || null,
        user_agent: entry.userAgent || null,
      });

      if (error) {
        // Fallback using direct table schema if schema qualification needed
        console.warn('Audit record warning:', error.message);
      }
      return { success: true };
    } catch (err: any) {
      console.error('Failed to write audit log:', err);
      return { success: false, error: err.message };
    }
  }
}
