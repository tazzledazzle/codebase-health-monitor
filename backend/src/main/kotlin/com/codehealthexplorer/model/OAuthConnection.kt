package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class OAuthConnection(
    val id: UUID,
    val userId: UUID,
    val provider: String,
    val providerUserId: String,
    val accessToken: String,
    val refreshToken: String?,
    val tokenExpiresAt: LocalDateTime?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

object OAuthConnections : org.jetbrains.exposed.v1.core.Table("oauth_connections") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val userId = uuid("user_id").references(Users.id)
    val provider = varchar("provider", 50)
    val providerUserId = varchar("provider_user_id", 255)
    val accessToken = text("access_token")
    val refreshToken = text("refresh_token").nullable()
    val tokenExpiresAt = datetime("token_expires_at").nullable()
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").clientDefault { LocalDateTime.now() }
    
    override val primaryKey = PrimaryKey(id)
    
    init {
        uniqueIndex(provider, providerUserId)
    }
}