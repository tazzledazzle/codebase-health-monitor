package com.codehealthexplorer.model

import java.time.LocalDateTime
import java.util.UUID

data class CodeFile(
    val id: UUID,
    val repositoryId: UUID,
    val path: String,
    val language: String,
    val size: Long,
    val linesOfCode: Int,
    val complexity: Double,
    val lastModified: LocalDateTime?
)