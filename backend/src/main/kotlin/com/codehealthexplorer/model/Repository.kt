package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class Repository(
    val id: UUID,
    val name: String,
    val url: String?,
    val localPath: String,
    val ownerId: UUID,
    val teamId: UUID?,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val lastAnalyzedAt: LocalDateTime?,
    val status: RepositoryStatus
)