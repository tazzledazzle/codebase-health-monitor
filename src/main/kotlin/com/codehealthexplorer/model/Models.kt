package com.codehealthexplorer.model

import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime
import java.util.*

// Database Tables
object Repositories : Table("repositories") {
    val id = uuid("id").autoGenerate()
    val name = varchar("name", 255)
    val url = varchar("url", 512).nullable()
    val localPath = text("local_path")
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").nullable()
    val lastAnalyzedAt = datetime("last_analyzed_at").nullable()
    val status = enumerationByName<RepositoryStatus>("status", 50)
    
    override val primaryKey = PrimaryKey(id)
}

object AnalysisRuns : Table("analysis_runs") {
    val id = uuid("id").autoGenerate()
    val repositoryId = ("repository_id" to Repositories.id).references(Repositories.id)
    val startedAt = datetime("started_at").clientDefault { LocalDateTime.now() }
    val completedAt = datetime("completed_at").nullable()
    val status = enumerationByName<AnalysisStatus>("status", 50)
    val error = text("error").nullable()
    val metrics = jsonb<CodeMetrics>("metrics")
    
    override val primaryKey = PrimaryKey(id)
}

object CodeFiles : Table("code_files") {
    val id = uuid("id").autoGenerate()
    val repositoryId = ("repository_id" to Repositories.id).references(Repositories.id)
    val path = text("path")
    val language = varchar("language", 50)
    val size = long("size")
    val linesOfCode = integer("lines_of_code")
    val complexity = double("complexity").default(0.0)
    val lastModified = datetime("last_modified").nullable()
    
    override val primaryKey = PrimaryKey(id)
}

object Dependencies : Table("dependencies") {
    val id = uuid("id").autoGenerate()
    val repositoryId = ("repository_id" to Repositories.id).references(Repositories.id)
    val sourceFileId = ("source_file_id" to CodeFiles.id).references(CodeFiles.id).nullable()
    val target = text("target")
    val type = enumerationByName<DependencyType>("type", 50)
    
    override val primaryKey = PrimaryKey(id)
}

// Enums
enum class RepositoryStatus {
    PENDING,
    CLONING,
    ANALYZING,
    READY,
    ERROR
}

enum class AnalysisStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    FAILED
}

enum class DependencyType {
    INHERITANCE,
    IMPLEMENTATION,
    IMPORT,
    FUNCTION_CALL,
    VARIABLE_REFERENCE
}

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

data class AnalysisRun(
    val id: UUID,
    val repositoryId: UUID,
    val startedAt: LocalDateTime,
    val completedAt: LocalDateTime?,
    val status: AnalysisStatus,
    val error: String?,
    val metrics: CodeMetrics
)

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

data class Dependency(
    val id: UUID,
    val repositoryId: UUID,
    val sourceFileId: UUID?,
    val target: String,
    val type: DependencyType
)

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
