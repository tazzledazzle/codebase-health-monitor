package com.codehealthexplorer.service

import com.codehealthexplorer.model.*
import com.codehealthexplorer.repository.RepositoryRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import org.eclipse.jgit.api.Git
import org.eclipse.jgit.transport.UsernamePasswordCredentialsProvider
import java.io.InputStream
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDateTime
import java.util.*
import java.util.zip.ZipInputStream
import kotlin.io.path.createDirectories
import kotlin.io.path.deleteRecursively

class RepositoryIngestionService(
    private val repositoryRepository: RepositoryRepository,
    private val analysisService: AnalysisService,
    private val configService: ConfigService
) {

    suspend fun addRepositoryFromGitUrl(
        name: String,
        gitUrl: String,
        accessToken: String? = null
    ): Repository = withContext(Dispatchers.IO) {
        val repository = Repository(
            id = UUID.randomUUID(),
            name = name,
            url = gitUrl,
            localPath = generateLocalPath(name),
            createdAt = LocalDateTime.now(),
            updatedAt = null,
            lastAnalyzedAt = null,
            status = RepositoryStatus.PENDING
        )

        try {
            repositoryRepository.save(repository.copy(status = RepositoryStatus.CLONING))

            val localPath = cloneRepository(gitUrl, repository.localPath, accessToken)
            val updatedRepo = repository.copy(
                status = RepositoryStatus.READY,
                updatedAt = LocalDateTime.now()
            )

            repositoryRepository.save(updatedRepo)

            // Trigger analysis
            analysisService.startAnalysis(updatedRepo.id)

            updatedRepo
        } catch (e: Exception) {
            val errorRepo = repository.copy(status = RepositoryStatus.ERROR)
            repositoryRepository.save(errorRepo)
            throw RepositoryIngestionException("Failed to clone repository: ${e.message}", e)
        }
    }

    suspend fun addRepositoryFromZip(
        name: String,
        zipInputStream: InputStream
    ): Repository = withContext(Dispatchers.IO) {
        val repository = Repository(
            id = UUID.randomUUID(),
            name = name,
            url = null,
            localPath = generateLocalPath(name),
            createdAt = LocalDateTime.now(),
            updatedAt = null,
            lastAnalyzedAt = null,
            status = RepositoryStatus.PENDING
        )

        try {
            repositoryRepository.save(repository)

            val localPath = extractZipFile(zipInputStream, repository.localPath)
            validateRepositoryStructure(localPath)

            val updatedRepo = repository.copy(
                status = RepositoryStatus.READY,
                updatedAt = LocalDateTime.now()
            )

            repositoryRepository.save(updatedRepo)

            // Trigger analysis
            analysisService.startAnalysis(updatedRepo.id)

            updatedRepo
        } catch (e: Exception) {
            val errorRepo = repository.copy(status = RepositoryStatus.ERROR)
            repositoryRepository.save(errorRepo)
            throw RepositoryIngestionException("Failed to extract ZIP file: ${e.message}", e)
        }
    }

    private fun cloneRepository(gitUrl: String, localPath: String, accessToken: String?): Path {
        val targetPath = Path.of(configService.getRepositoryStoragePath(), localPath)
        targetPath.createDirectories()

        val gitCommand = Git.cloneRepository()
            .setURI(gitUrl)
            .setDirectory(targetPath.toFile())

        accessToken?.let { token ->
            gitCommand.setCredentialsProvider(
                UsernamePasswordCredentialsProvider(token, "")
            )
        }

        gitCommand.call().use { git ->
            validateRepositoryStructure(targetPath)
        }

        return targetPath
    }

    private fun extractZipFile(inputStream: InputStream, localPath: String): Path {
        val targetPath = Path.of(configService.getRepositoryStoragePath(), localPath)
        targetPath.createDirectories()

        ZipInputStream(inputStream.buffered()).use { zipStream ->
            var entry = zipStream.nextEntry
            while (entry != null) {
                val entryPath = targetPath.resolve(entry.name)

                // Security check: prevent directory traversal
                if (!entryPath.startsWith(targetPath)) {
                    throw SecurityException("ZIP entry outside target directory: ${entry.name}")
                }

                if (entry.isDirectory) {
                    entryPath.createDirectories()
                } else {
                    entryPath.parent?.createDirectories()
                    Files.copy(zipStream, entryPath)
                }

                zipStream.closeEntry()
                entry = zipStream.nextEntry
            }
        }

        return targetPath
    }

    private fun validateRepositoryStructure(path: Path) {
        if (!Files.exists(path) || !Files.isDirectory(path)) {
            throw RepositoryValidationException("Invalid repository structure: path does not exist or is not a directory")
        }

        // Check for common code file extensions
        val codeFiles = Files.walk(path)
            .filter { Files.isRegularFile(it) }
            .filter { file ->
                val extension = file.fileName.toString().substringAfterLast(".", "")
                extension.lowercase() in SUPPORTED_EXTENSIONS
            }
            .count()

        if (codeFiles == 0L) {
            throw RepositoryValidationException("No supported code files found in repository")
        }
    }

    private fun generateLocalPath(name: String): String {
        val sanitizedName = name.replace(Regex("[^a-zA-Z0-9_-]"), "_")
        val timestamp = System.currentTimeMillis()
        return "${sanitizedName}_${timestamp}"
    }

    suspend fun deleteRepository(repositoryId: UUID) = withContext(Dispatchers.IO) {
        val repository = repositoryRepository.findById(repositoryId)
            ?: throw RepositoryNotFoundException("Repository not found: $repositoryId")

        try {
            val repositoryPath = Path.of(configService.getRepositoryStoragePath(), repository.localPath)
            if (Files.exists(repositoryPath)) {
                repositoryPath.deleteRecursively()
            }

            repositoryRepository.delete(repositoryId)
        } catch (e: Exception) {
            throw RepositoryIngestionException("Failed to delete repository: ${e.message}", e)
        }
    }

    companion object {
        private val SUPPORTED_EXTENSIONS = setOf(
            "kt", "java", "js", "ts", "tsx", "jsx",
            "py", "go", "rs", "cpp", "c", "h", "hpp",
            "cs", "rb", "php", "swift", "scala"
        )
    }
}

class RepositoryIngestionException(message: String, cause: Throwable? = null) : Exception(message, cause)
class RepositoryValidationException(message: String) : Exception(message)
class RepositoryNotFoundException(message: String) : Exception(message)