package com.codehealthexplorer.service

import com.codehealthexplorer.analyzer.StaticAnalyzer
import com.codehealthexplorer.model.*
import com.codehealthexplorer.repository.RepositoryRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.koin.core.component.KoinComponent
import java.io.File
import java.util.*

class AnalysisService(
    private val repository: RepositoryRepository,
    private val staticAnalyzer: StaticAnalyzer = StaticAnalyzer()
) : KoinComponent {

    suspend fun analyzeRepository(repositoryId: UUID) = withContext(Dispatchers.IO) {
        try {
            // Get repository info
            val repo = repository.getRepository(repositoryId) ?: 
                throw IllegalArgumentException("Repository not found")
            
            // Create analysis run
            val analysisRunId = repository.createAnalysisRun(repositoryId)
            
            try {
                // Update repository status
                repository.updateRepositoryStatus(repositoryId, RepositoryStatus.ANALYZING)
                
                // Analyze the codebase
                val analysisResult = staticAnalyzer.analyze(File(repo.localPath))
                
                // Convert and save files
                val codeFiles = analysisResult.files.map { file ->
                    CodeFile(
                        id = UUID.randomUUID(),
                        repositoryId = repositoryId,
                        path = file.path,
                        language = file.language,
                        size = file.size,
                        linesOfCode = File(file.path).readLines().size,
                        complexity = file.functions.map { it.complexity }.average().takeIf { !it.isNaN() } ?: 0.0,
                        lastModified = null // Could be set from file system
                    )
                }
                
                // Save files to database
                repository.saveCodeFiles(repositoryId, codeFiles)
                
                // Convert and save dependencies
                val fileMap = codeFiles.associateBy { it.path }
                val dependencies = analysisResult.dependencies.map { dep ->
                    Dependency(
                        id = UUID.randomUUID(),
                        repositoryId = repositoryId,
                        sourceFileId = fileMap[dep.from]?.id,
                        target = dep.to,
                        type = when (dep.type) {
                            com.codehealthexplorer.analyzer.DependencyType.INHERITANCE -> DependencyType.INHERITANCE
                            com.codehealthexplorer.analyzer.DependencyType.IMPLEMENTATION -> DependencyType.IMPLEMENTATION
                            com.codehealthexplorer.analyzer.DependencyType.IMPORT -> DependencyType.IMPORT
                            com.codehealthexplorer.analyzer.DependencyType.FUNCTION_CALL -> DependencyType.FUNCTION_CALL
                            com.codehealthexplorer.analyzer.DependencyType.VARIABLE_REFERENCE -> DependencyType.VARIABLE_REFERENCE
                        }
                    )
                }
                
                repository.saveDependencies(repositoryId, dependencies)
                
                // Calculate metrics
                val metrics = CodeMetrics(
                    linesOfCode = analysisResult.metrics.linesOfCode,
                    numberOfFiles = analysisResult.metrics.numberOfFiles,
                    numberOfClasses = analysisResult.metrics.numberOfClasses,
                    numberOfFunctions = analysisResult.metrics.numberOfFunctions,
                    averageComplexity = analysisResult.metrics.averageComplexity,
                    dependencyCount = analysisResult.metrics.dependencyCount,
                    fileTypeDistribution = analysisResult.files
                        .groupBy { it.language }
                        .mapValues { it.value.size },
                    errorCount = 0, // Would come from linters/compilers
                    testCoverage = null // Would come from test coverage tools
                )
                
                // Update analysis run with results
                repository.updateAnalysisRun(
                    id = analysisRunId,
                    status = AnalysisStatus.COMPLETED,
                    metrics = metrics
                )
                
                // Update repository status
                repository.updateRepositoryStatus(repositoryId, RepositoryStatus.READY)
                
                AnalysisResult.Success(metrics)
            } catch (e: Exception) {
                // Update analysis run with error
                repository.updateAnalysisRun(
                    id = analysisRunId,
                    status = AnalysisStatus.FAILED,
                    error = e.message ?: "Unknown error"
                )
                
                // Update repository status
                repository.updateRepositoryStatus(repositoryId, RepositoryStatus.ERROR)
                
                throw e
            }
        } catch (e: Exception) {
            AnalysisResult.Error(e.message ?: "Failed to analyze repository")
        }
    }
    
    suspend fun getRepositoryMetrics(repositoryId: UUID): AnalysisResult<CodeMetrics> = withContext(Dispatchers.IO) {
        try {
            val run = repository.getLatestAnalysisRun(repositoryId)
                ?: return@withContext AnalysisResult.Error("No analysis run found")
                
            AnalysisResult.Success(run.metrics)
        } catch (e: Exception) {
            AnalysisResult.Error(e.message ?: "Failed to get metrics")
        }
    }
    
    suspend fun getDependencyGraph(repositoryId: UUID): AnalysisResult<DependencyGraph> = withContext(Dispatchers.IO) {
        try {
            val files = repository.getRepositoryFiles(repositoryId)
            val deps = repository.getRepositoryDependencies(repositoryId)
            
            val nodes = files.map { file ->
                DependencyNode(
                    id = file.id.toString(),
                    label = file.path.split("/").last(),
                    type = "file",
                    language = file.language,
                    size = file.size,
                    metrics = mapOf(
                        "linesOfCode" to file.linesOfCode,
                        "complexity" to file.complexity
                    )
                )
            }
            
            val links = deps.map { dep ->
                DependencyLink(
                    source = dep.sourceFileId?.toString() ?: "",
                    target = dep.target,
                    type = dep.type.name.lowercase()
                )
            }.filter { it.source.isNotBlank() && it.target.isNotBlank() }
            
            AnalysisResult.Success(DependencyGraph(nodes, links))
        } catch (e: Exception) {
            AnalysisResult.Error(e.message ?: "Failed to generate dependency graph")
        }
    }
}

// Extension to get the latest analysis run
private suspend fun RepositoryRepository.getLatestAnalysisRun(repositoryId: UUID) = 
    transaction(database) {
        AnalysisRuns
            .select { AnalysisRuns.repositoryId eq repositoryId }
            .orderBy(AnalysisRuns.startedAt to SortOrder.DESC)
            .limit(1)
            .map { row ->
                AnalysisRun(
                    id = row[AnalysisRuns.id].value,
                    repositoryId = repositoryId,
                    startedAt = row[AnalysisRuns.startedAt],
                    completedAt = row[AnalysisRuns.completedAt],
                    status = row[AnalysisRuns.status],
                    error = row[AnalysisRuns.error],
                    metrics = row[AnalysisRuns.metrics]
                )
            }.firstOrNull()
    }

// Result types
sealed class AnalysisResult<out T> {
    data class Success<out T>(val data: T) : AnalysisResult<T>()
    data class Error(val message: String) : AnalysisResult<Nothing>()
}

data class DependencyGraph(
    val nodes: List<DependencyNode>,
    val links: List<DependencyLink>
)

data class DependencyNode(
    val id: String,
    val label: String,
    val type: String,
    val language: String,
    val size: Long,
    val metrics: Map<String, Any>
)

data class DependencyLink(
    val source: String,
    val target: String,
    val type: String
)
