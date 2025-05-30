package com.codehealthexplorer.model

import java.time.LocalDateTime
import java.util.UUID

// Data Classes
data class Repository(
    val id: UUID,
    val name: String,
    val url: String?,
    val localPath: String,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime?,
    val lastAnalyzedAt: LocalDateTime?,
    val status: RepositoryStatus
)