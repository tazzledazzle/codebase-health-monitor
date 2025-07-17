package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class User(
    val id: UUID,
    val email: String,
    val name: String,
    val passwordHash: String? = null,
    val avatarUrl: String? = null,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
)