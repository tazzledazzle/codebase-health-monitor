package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import kotlinx.datetime.LocalDateTime
import kotlinx.serialization.Contextual
import java.util.UUID

@Serializable
data class CodeFile(
    @Contextual
    val id: UUID,
    @Contextual
    val repositoryId: UUID,
    val path: String,
    val language: String,
    val size: Long,
    val linesOfCode: Int,
    val complexity: Double,
    val lastModified: LocalDateTime?
)