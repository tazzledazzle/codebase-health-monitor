package com.codehealthexplorer.repository

import com.codehealthexplorer.model.*
import org.jetbrains.exposed.sql.*
import org.jetbrains.exposed.sql.SqlExpressionBuilder.eq
import org.jetbrains.exposed.sql.transactions.transaction
import java.util.*

class RepositoryRepository(private val database: Database) {
    init {
        transaction(database) {
            SchemaUtils.create(Repositories, AnalysisRuns, CodeFiles, Dependencies)
        }
    }

    // Repository operations
    fun createRepository(name: String, url: String? = null, localPath: String): UUID = transaction(database) {
        Repositories.insert {
            it[this.name] = name
            it[this.url] = url
            it[this.localPath] = localPath
            it[status] = RepositoryStatus.PENDING
        } get Repositories.id
    }.value

    fun getRepository(id: UUID): Repository? = transaction(database) {
        Repositories.select { Repositories.id eq id }
            .map { row ->
                Repository(
                    id = row[Repositories.id].value,
                    name = row[Repositories.name],
                    url = row[Repositories.url],
                    localPath = row[Repositories.localPath],
                    createdAt = row[Repositories.createdAt],
                    updatedAt = row[Repositories.updatedAt],
                    lastAnalyzedAt = row[Repositories.lastAnalyzedAt],
                    status = row[Repositories.status]
                )
            }.singleOrNull()
    }

    fun updateRepositoryStatus(id: UUID, status: RepositoryStatus) = transaction(database) {
        Repositories.update({ Repositories.id eq id }) {
            it[Repositories.status] = status
            it[updatedAt] = LocalDateTime.now()
            if (status == RepositoryStatus.READY) {
                it[lastAnalyzedAt] = LocalDateTime.now()
            }
        }
    }

    // Analysis Run operations
    fun createAnalysisRun(repositoryId: UUID): UUID = transaction(database) {
        AnalysisRuns.insert {
            it[AnalysisRuns.repositoryId] = repositoryId
            it[status] = AnalysisStatus.PENDING
        } get AnalysisRuns.id
    }.value

    fun updateAnalysisRun(
        id: UUID,
        status: AnalysisStatus,
        error: String? = null,
        metrics: CodeMetrics? = null
    ) = transaction(database) {
        AnalysisRuns.update({ AnalysisRuns.id eq id }) {
            it[AnalysisRuns.status] = status
            it[completedAt] = if (status == AnalysisStatus.COMPLETED || status == AnalysisStatus.FAILED) {
                LocalDateTime.now()
            } else {
                null
            }
            it[AnalysisRuns.error] = error
            if (metrics != null) {
                it[AnalysisRuns.metrics] = metrics
            }
        }
    }

    // File operations
    fun saveCodeFiles(repositoryId: UUID, files: List<CodeFile>) = transaction(database) {
        // First, delete existing files to handle updates
        CodeFiles.deleteWhere { CodeFiles.repositoryId eq repositoryId }
        
        // Insert new files
        files.forEach { file ->
            CodeFiles.insert {
                it[id] = file.id
                it[code][CodeFiles.repositoryId] = repositoryId
                it[path] = file.path
                it[language] = file.language
                it[size] = file.size
                it[linesOfCode] = file.linesOfCode
                it[complexity] = file.complexity
                it[lastModified] = file.lastModified
            }
        }
    }

    // Dependency operations
    fun saveDependencies(repositoryId: UUID, dependencies: List<Dependency>) = transaction(database) {
        // First, delete existing dependencies
        Dependencies.deleteWhere { Dependencies.repositoryId eq repositoryId }
        
        // Insert new dependencies
        dependencies.forEach { dep ->
            Dependencies.insert {
                it[id] = dep.id
                it[code][Dependencies.repositoryId] = repositoryId
                it[sourceFileId] = dep.sourceFileId
                it[target] = dep.target
                it[type] = dep.type
            }
        }
    }

    // Query methods
    fun getRepositoryFiles(repositoryId: UUID): List<CodeFile> = transaction(database) {
        CodeFiles.select { CodeFiles.repositoryId eq repositoryId }
            .map { row ->
                CodeFile(
                    id = row[CodeFiles.id].value,
                    repositoryId = repositoryId,
                    path = row[CodeFiles.path],
                    language = row[CodeFiles.language],
                    size = row[CodeFiles.size],
                    linesOfCode = row[CodeFiles.linesOfCode],
                    complexity = row[CodeFiles.complexity],
                    lastModified = row[CodeFiles.lastModified]
                )
            }
    }

    fun getFileDependencies(fileId: UUID): List<Dependency> = transaction(database) {
        Dependencies.select { Dependencies.sourceFileId eq fileId }
            .map { row ->
                Dependency(
                    id = row[Dependencies.id].value,
                    repositoryId = row[Dependencies.repositoryId].value,
                    sourceFileId = row[Dependencies.sourceFileId]?.value,
                    target = row[Dependencies.target],
                    type = row[Dependencies.type]
                )
            }
    }

    fun getRepositoryDependencies(repositoryId: UUID): List<Dependency> = transaction(database) {
        Dependencies.select { Dependencies.repositoryId eq repositoryId }
            .map { row ->
                Dependency(
                    id = row[Dependencies.id].value,
                    repositoryId = repositoryId,
                    sourceFileId = row[Dependencies.sourceFileId]?.value,
                    target = row[Dependencies.target],
                    type = row[Dependencies.type]
                )
            }
    }
}
