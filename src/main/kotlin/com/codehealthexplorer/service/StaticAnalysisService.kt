package com.codehealthexplorer.service

import com.codehealthexplorer.analyzer.*
import com.codehealthexplorer.model.*
import com.codehealthexplorer.repository.AnalysisRunRepository
import com.codehealthexplorer.repository.CodeFileRepository
import com.codehealthexplorer.repository.DependencyRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDateTime
import java.util.*
import kotlin.io.path.extension
import kotlin.io.path.isRegularFile
import kotlin.io.path.relativeTo

class StaticAnalysisService(
    private val analysisRunRepository: AnalysisRunRepository,
    private val codeFileRepository: CodeFileRepository,
    private val dependencyRepository: DependencyRepository,
    private val configService: ConfigService,
    private val progressNotificationService: ProgressNotificationService
) {

    private val analyzers = mapOf(
        "kt" to KotlinAnalyzer(),
        "java" to JavaAnalyzer(),
        "js" to JavaScriptAnalyzer(),
        "ts" to TypeScriptAnalyzer(),
        "tsx" to TypeScriptAnalyzer(),
        "jsx" to JavaScriptAnalyzer()
    )

    suspend fun analyzeRepository(repositoryId: UUID): AnalysisRun = withContext(Dispatchers.IO) {
        val analysisRun = AnalysisRun(
            id = UUID.randomUUID(),
            repositoryId = repositoryId,
            startedAt = LocalDateTime.now(),
            completedAt = null,
            status = AnalysisStatus.IN_PROGRESS,
            error = null,
            metrics = CodeMetrics()
        )

        analysisRunRepository.save(analysisRun)
        progressNotificationService.notifyAnalysisStarted(repositoryId, analysisRun.id)

        try {
            val repository = getRepository(repositoryId)
            val repositoryPath = Path.of(configService.getRepositoryStoragePath(), repository.localPath)

            // Discover all code files
            val codeFiles = discoverCodeFiles(repositoryPath, repositoryId)
            progressNotificationService.notifyProgress(repositoryId, "Discovered ${codeFiles.size} code files", 10)

            // Analyze each file
            val analysisResults = analyzeFiles(codeFiles, repositoryPath)
            progressNotificationService.notifyProgress(repositoryId, "Analyzed ${analysisResults.size} files", 60)

            // Build dependency graph
            val dependencies = buildDependencyGraph(analysisResults, repositoryId)
            progressNotificationService.notifyProgress(repositoryId, "Built dependency graph", 80)

            // Calculate metrics
            val metrics = calculateCodeMetrics(analysisResults, dependencies)
            progressNotificationService.notifyProgress(repositoryId, "Calculated metrics", 90)

            // Save results
            saveAnalysisResults(codeFiles, dependencies)

            val completedRun = analysisRun.copy(
                status = AnalysisStatus.COMPLETED,
                completedAt = LocalDateTime.now(),
                metrics = metrics
            )

            analysisRunRepository.save(completedRun)
            progressNotificationService.notifyAnalysisCompleted(repositoryId, completedRun.id)

            completedRun
        } catch (e: Exception) {
            val failedRun = analysisRun.copy(
                status = AnalysisStatus.FAILED,
                completedAt = LocalDateTime.now(),
                error = e.message
            )

            analysisRunRepository.save(failedRun)
            progressNotificationService.notifyAnalysisError(repositoryId, e.message ?: "Unknown error")

            throw AnalysisException("Analysis failed for repository $repositoryId", e)
        }
    }

    private suspend fun discoverCodeFiles(repositoryPath: Path, repositoryId: UUID): List<CodeFile> {
        return Files.walk(repositoryPath)
            .filter { it.isRegularFile() }
            .filter { file ->
                val extension = file.extension.lowercase()
                extension in analyzers.keys
            }
            .map { file ->
                val relativePath = file.relativeTo(repositoryPath).toString()
                val size = Files.size(file)
                val lastModified = Files.getLastModifiedTime(file).toInstant()
                    .atZone(java.time.ZoneOffset.UTC).toLocalDateTime()

                CodeFile(
                    id = UUID.randomUUID(),
                    repositoryId = repositoryId,
                    path = relativePath,
                    language = detectLanguage(file.extension),
                    size = size,
                    linesOfCode = 0, // Will be calculated during analysis
                    complexity = 0.0,
                    lastModified = lastModified
                )
            }
            .toList()
    }

    private suspend fun analyzeFiles(
        codeFiles: List<CodeFile>,
        repositoryPath: Path
    ): List<FileAnalysisResult> {
        return codeFiles.mapNotNull { codeFile ->
            try {
                val filePath = repositoryPath.resolve(codeFile.path)
                val extension = Path.of(codeFile.path).extension.lowercase()
                val analyzer = analyzers[extension]

                analyzer?.analyzeFile(filePath, codeFile)
            } catch (e: Exception) {
                // Log error but continue with other files
                println("Failed to analyze file ${codeFile.path}: ${e.message}")
                null
            }
        }
    }

    private suspend fun buildDependencyGraph(
        analysisResults: List<FileAnalysisResult>,
        repositoryId: UUID
    ): List<Dependency> {
        val dependencies = mutableListOf<Dependency>()

        analysisResults.forEach { result ->
            result.dependencies.forEach { dep ->
                dependencies.add(
                    Dependency(
                        id = UUID.randomUUID(),
                        repositoryId = repositoryId,
                        sourceFileId = result.codeFile.id,
                        target = dep.target,
                        type = dep.type
                    )
                )
            }
        }

        return dependencies
    }

    private fun calculateCodeMetrics(
        analysisResults: List<FileAnalysisResult>,
        dependencies: List<Dependency>
    ): CodeMetrics {
        val totalFiles = analysisResults.size
        val totalLines = analysisResults.sumOf { it.linesOfCode }
        val totalComplexity = analysisResults.sumOf { it.complexity }
        val averageComplexity = if (totalFiles > 0) totalComplexity / totalFiles else 0.0

        val languageDistribution = analysisResults
            .groupBy { it.codeFile.language }
            .mapValues { it.value.size }

        val dependencyCount = dependencies.size
        val maxDependenciesPerFile = dependencies
            .groupBy { it.sourceFileId }
            .maxOfOrNull { it.value.size } ?: 0

        return CodeMetrics(
            totalFiles = totalFiles,
            totalLinesOfCode = totalLines,
            averageComplexity = averageComplexity,
            languageDistribution = languageDistribution,
            dependencyCount = dependencyCount,
            maxDependenciesPerFile = maxDependenciesPerFile
        )
    }

    private suspend fun saveAnalysisResults(
        codeFiles: List<CodeFile>,
        dependencies: List<Dependency>
    ) {
        codeFiles.forEach { codeFileRepository.save(it) }
        dependencies.forEach { dependencyRepository.save(it) }
    }

    private fun detectLanguage(extension: String): String {
        return when (extension.lowercase()) {
            "kt" -> "Kotlin"
            "java" -> "Java"
            "js", "jsx" -> "JavaScript"
            "ts", "tsx" -> "TypeScript"
            else -> "Unknown"
        }
    }

    private suspend fun getRepository(repositoryId: UUID): Repository {
        // This would typically come from RepositoryRepository
        // Placeholder implementation
        throw NotImplementedError("Repository lookup not implemented")
    }
}

data class FileAnalysisResult(
    val codeFile: CodeFile,
    val linesOfCode: Int,
    val complexity: Double,
    val dependencies: List<FileDependency>
)

data class FileDependency(
    val target: String,
    val type: DependencyType
)

data class CodeMetrics(
    val totalFiles: Int = 0,
    val totalLinesOfCode: Int = 0,
    val averageComplexity: Double = 0.0,
    val languageDistribution: Map<String, Int> = emptyMap(),
    val dependencyCount: Int = 0,
    val maxDependenciesPerFile: Int = 0
)

class AnalysisException(message: String, cause: Throwable? = null) : Exception(message, cause)