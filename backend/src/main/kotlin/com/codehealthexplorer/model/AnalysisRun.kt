package com.codehealthexplorer.model

import java.time.LocalDateTime
import java.util.UUID

data class AnalysisRun(
    val id: UUID,
    val repositoryId: UUID,
    val startedAt: LocalDateTime,
    val completedAt: LocalDateTime?,
    val status: AnalysisStatus,
    val error: String?,
    val metrics: CodeMetrics
)