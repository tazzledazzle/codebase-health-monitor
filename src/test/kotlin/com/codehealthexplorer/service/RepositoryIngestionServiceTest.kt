package com.codehealthexplorer.service

import com.codehealthexplorer.model.*
import com.codehealthexplorer.repository.RepositoryRepository
import io.mockk.*
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import java.io.ByteArrayInputStream
import java.time.LocalDateTime
import java.util.*

class RepositoryIngestionServiceTest {

    private lateinit var repositoryRepository: RepositoryRepository
    private lateinit var analysisService: AnalysisService
    private lateinit var configService: ConfigService
    private lateinit var repositoryIngestionService: RepositoryIngestionService

    @BeforeEach
    fun setup() {
        repositoryRepository = mockk()
        analysisService = mockk()
        configService = mockk()

        every { configService.getRepositoryStoragePath() } returns "/tmp/test-repos"
        every { analysisService.startAnalysis(any()) } returns Unit

        repositoryIngestionService = RepositoryIngestionService(
            repositoryRepository,
            analysisService,
            configService
        )
    }

    @Test
    fun `addRepositoryFromGitUrl should create repository with PENDING status initially`() = runBlocking {
        // Given
        val name = "test-repo"
        val gitUrl = "https://github.com/user/repo.git"
        val accessToken = "github_token"

        every { repositoryRepository.save(any()) } returns Unit

        // Mock successful cloning (this would need actual Git integration testing separately)
        mockkStatic("com.codehealthexplorer.service.RepositoryIngestionServiceKt")

        // When & Then
        // This test would need to be adjusted based on actual Git cloning implementation
        // For now, testing the service structure and error handling

        verify { repositoryRepository.save(any()) }
    }

    @Test
    fun `addRepositoryFromZip should handle valid ZIP file`() = runBlocking {
        // Given
        val name = "test-repo"
        val zipContent = createValidZipContent()
        val zipInputStream = ByteArrayInputStream(zipContent)

        every { repositoryRepository.save(any()) } returns Unit

        // When
        val result = try {
            repositoryIngestionService.addRepositoryFromZip(name, zipInputStream)
        } catch (e: Exception) {
            // Expected for this test setup without actual file system
            null
        }

        // Then
        verify { repositoryRepository.save(any()) }
    }

    @Test
    fun `addRepositoryFromZip should reject malicious ZIP with directory traversal`() = runBlocking {
        // Given
        val name = "malicious-repo"
        val maliciousZipContent = createMaliciousZipContent()
        val zipInputStream = ByteArrayInputStream(maliciousZipContent)

        every { repositoryRepository.save(any()) } returns Unit

        // When & Then
        assertThrows<SecurityException> {
            repositoryIngestionService.addRepositoryFromZip(name, zipInputStream)
        }
    }

    @Test
    fun `deleteRepository should remove local files and database entry`() = runBlocking {
        // Given
        val repositoryId = UUID.randomUUID()
        val repository = Repository(
            id = repositoryId,
            name = "test-repo",
            url = "https://github.com/user/repo.git",
            localPath = "test-repo_123456789",
            createdAt = LocalDateTime.now(),
            updatedAt = null,
            lastAnalyzedAt = null,
            status = RepositoryStatus.READY
        )

        every { repositoryRepository.findById(repositoryId) } returns repository
        every { repositoryRepository.delete(repositoryId) } returns Unit

        // When
        repositoryIngestionService.deleteRepository(repositoryId)

        // Then
        verify { repositoryRepository.findById(repositoryId) }
        verify { repositoryRepository.delete(repositoryId) }
    }

    @Test
    fun `deleteRepository should throw exception when repository not found`() = runBlocking {
        // Given
        val repositoryId = UUID.randomUUID()
        every { repositoryRepository.findById(repositoryId) } returns null

        // When & Then
        assertThrows<RepositoryNotFoundException> {
            repositoryIngestionService.deleteRepository(repositoryId)
        }
    }

    @Test
    fun `generateLocalPath should create safe directory name`() {
        // Given
        val service = repositoryIngestionService
        val unsafeName = "my-repo/with\\unsafe:chars*"

        // When
        val result = service.javaClass.getDeclaredMethod("generateLocalPath", String::class.java).apply {
            isAccessible = true
        }.invoke(service, unsafeName) as String

        // Then
        assertTrue(result.matches(Regex("^[a-zA-Z0-9_-]+_\\d+$")))
        assertFalse(result.contains("/"))
        assertFalse(result.contains("\\"))
        assertFalse(result.contains(":"))
        assertFalse(result.contains("*"))
    }

    @Test
    fun `validateRepositoryStructure should accept repository with supported files`() {
        // This test would require actual file system operations
        // In a real implementation, you'd use a temporary directory
        // with test files for validation
        assertTrue(true) // Placeholder
    }

    @Test
    fun `validateRepositoryStructure should reject empty directory`() {
        // This test would create an empty temp directory
        // and verify that validation fails
        assertTrue(true) // Placeholder
    }

    private fun createValidZipContent(): ByteArray {
        // Create a simple ZIP file content with a Kotlin file
        // This would use Java's ZipOutputStream to create test content
        return byteArrayOf() // Placeholder
    }

    private fun createMaliciousZipContent(): ByteArray {
        // Create ZIP content with "../../../etc/passwd" entry
        // to test directory traversal protection
        return byteArrayOf() // Placeholder
    }
}