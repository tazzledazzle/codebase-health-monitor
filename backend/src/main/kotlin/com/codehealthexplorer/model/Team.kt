package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class Team(
    val id: UUID,
    val name: String,
    val ownerId: UUID,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)

@Serializable
data class TeamMember(
    val teamId: UUID,
    val userId: UUID,
    val role: TeamRole,
    val joinedAt: LocalDateTime
)

enum class TeamRole {
    ADMIN,
    MEMBER,
    VIEWER
}