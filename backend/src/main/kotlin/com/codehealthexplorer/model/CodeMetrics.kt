package com.codehealthexplorer.model

import kotlinx.serialization.Serializable

@Serializable
data class CodeMetrics(
    val linesOfCode: Int,
    val numberOfFiles: Int,
    val numberOfClasses: Int,
    val numberOfFunctions: Int,
    val averageComplexity: Double,
    val dependencyCount: Int,
    val fileTypeDistribution: Map<String, Int> = emptyMap(),
    val errorCount: Int = 0,
    val testCoverage: Double? = null
)