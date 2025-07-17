package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.datetime
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class AuditLog(
    val id: UUID,
    val userId: UUID?,
    val action: String,
    val entityType: String,
    val entityId: UUID?,
    val details: Map<String, Any>?,
    val ipAddress: String?,
    val userAgent: String?,
    val createdAt: LocalDateTime
)

object AuditLogs : Table("audit_logs") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val userId = uuid("user_id").references(Users.id).nullable()
    val action = varchar("action", 100)
    val entityType = varchar("entity_type", 50)
    val entityId = uuid("entity_id").nullable()
    val details = jsonb<Map<String, Any>>("details").nullable()
    val ipAddress = varchar("ip_address", 50).nullable()
    val userAgent = text("user_agent").nullable()
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    
    override val primaryKey = PrimaryKey(id)
}