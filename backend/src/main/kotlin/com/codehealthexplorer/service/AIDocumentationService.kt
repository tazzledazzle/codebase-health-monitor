package com.codehealthexplorer.service

import com.aallam.openai.api.chat.ChatCompletion
import com.aallam.openai.api.chat.ChatCompletionRequest
import com.aallam.openai.api.chat.ChatMessage
import com.aallam.openai.api.chat.ChatRole
import com.aallam.openai.api.model.ModelId
import com.aallam.openai.client.OpenAI
import com.codehealthexplorer.model.*
import com.codehealthexplorer.repository.DocumentationRepository
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.withContext
import kotlinx.serialization.Serializable
import java.time.LocalDateTime
import java.util.*

class AIDocumentationService(
    private val openAIClient: OpenAI,
    private val documentationRepository: DocumentationRepository,
    private val cacheService: CacheService,
    private val configService: ConfigService
) {

    suspend fun generateDocumentation(
        repositoryId: UUID,
        symbolId: String,
        symbolType: SymbolType,
        codeContext: CodeContext
    ): Documentation = withContext(Dispatchers.IO) {

        // Check cache first
        val cacheKey = "doc:${repositoryId}:${symbolId}"
        cacheService.get<Documentation>(cacheKey)?.let { cachedDoc ->
            if (cachedDoc.isStillValid(codeContext.lastModified)) {
                return@withContext cachedDoc
            }
        }

        try {
            val prompt = buildPrompt(symbolType, codeContext)
            val response = callOpenAI(prompt)
            val parsedDoc = parseDocumentationResponse(response)

            val documentation = Documentation(
                id = UUID.randomUUID(),
                repositoryId = repositoryId,
                symbolId = symbolId,
                symbolType = symbolType,
                summary = parsedDoc.summary,
                description = parsedDoc.description,
                usage = parsedDoc.usage,
                examples = parsedDoc.examples,
                parameters = parsedDoc.parameters,
                returnValue = parsedDoc.returnValue,
                seeAlso = parsedDoc.seeAlso,
                tags = parsedDoc.tags,
                quality = calculateQuality(parsedDoc),
                createdAt = LocalDateTime.now(),
                updatedAt = LocalDateTime.now(),
                version = 1
            )

            // Save to database and cache
            documentationRepository.save(documentation)
            cacheService.set(cacheKey, documentation, configService.getDocumentationCacheTTL())

            documentation
        } catch (e: Exception) {
            throw DocumentationGenerationException("Failed to generate documentation for symbol $symbolId", e)
        }
    }

    suspend fun generateBatchDocumentation(
        repositoryId: UUID,
        requests: List<DocumentationRequest>
    ): List<Documentation> = withContext(Dispatchers.IO) {
        val results = mutableListOf<Documentation>()

        // Process in batches to avoid API rate limits
        val batchSize = configService.getOpenAIBatchSize()
        requests.chunked(batchSize).forEach { batch ->
            val batchResults = batch.map { request ->
                try {
                    generateDocumentation(
                        repositoryId,
                        request.symbolId,
                        request.symbolType,
                        request.codeContext
                    )
                } catch (e: Exception) {
                    // Log error but continue with other items
                    println("Failed to generate documentation for ${request.symbolId}: ${e.message}")
                    null
                }
            }.filterNotNull()

            results.addAll(batchResults)

            // Rate limiting delay
            kotlinx.coroutines.delay(configService.getOpenAIRateLimitDelay())
        }

        results
    }

    suspend fun searchDocumentation(
        repositoryId: UUID,
        query: String,
        limit: Int = 20
    ): List<Documentation> = withContext(Dispatchers.IO) {
        documentationRepository.search(repositoryId, query, limit)
    }

    suspend fun updateDocumentationFeedback(
        documentationId: UUID,
        feedback: DocumentationFeedback
    ) = withContext(Dispatchers.IO) {
        val documentation = documentationRepository.findById(documentationId)
            ?: throw DocumentationNotFoundException("Documentation not found: $documentationId")

        val updatedDoc = documentation.copy(
            quality = recalculateQuality(documentation, feedback),
            updatedAt = LocalDateTime.now()
        )

        documentationRepository.save(updatedDoc)
        documentationRepository.saveFeedback(feedback)

        // Update cache
        val cacheKey = "doc:${documentation.repositoryId}:${documentation.symbolId}"
        cacheService.set(cacheKey, updatedDoc, configService.getDocumentationCacheTTL())
    }

    private suspend fun buildPrompt(symbolType: SymbolType, context: CodeContext): String {
        return when (symbolType) {
            SymbolType.CLASS -> buildClassPrompt(context)
            SymbolType.FUNCTION -> buildFunctionPrompt(context)
            SymbolType.FILE -> buildFilePrompt(context)
            SymbolType.MODULE -> buildModulePrompt(context)
        }
    }

    private fun buildClassPrompt(context: CodeContext): String {
        return """
            Analyze the following ${context.language} class and generate comprehensive documentation:
            
            Code:
            ```${context.language.lowercase()}
            ${context.sourceCode}
            ```
            
            Context:
            - File: ${context.filePath}
            - Dependencies: ${context.dependencies.joinToString(", ")}
            - Methods: ${context.methods.size} methods
            - Properties: ${context.properties.size} properties
            
            Generate documentation in JSON format with the following structure:
            {
                "summary": "Brief one-line description",
                "description": "Detailed explanation of the class purpose and functionality",
                "usage": "How to use this class, including instantiation and common patterns",
                "examples": ["example1", "example2"],
                "parameters": [{"name": "param", "type": "String", "description": "desc"}],
                "seeAlso": ["related class/function names"],
                "tags": ["tag1", "tag2"]
            }
            
            Focus on:
            1. Clear, concise explanations
            2. Practical usage examples
            3. Important implementation details
            4. Relationships with other components
        """.trimIndent()
    }

    private fun buildFunctionPrompt(context: CodeContext): String {
        return """
            Analyze the following ${context.language} function and generate comprehensive documentation:
            
            Code:
            ```${context.language.lowercase()}
            ${context.sourceCode}
            ```
            
            Context:
            - File: ${context.filePath}
            - Class: ${context.className ?: "N/A"}
            - Parameters: ${context.parameters.joinToString(", ") { "${it.name}: ${it.type}" }}
            - Return Type: ${context.returnType ?: "Unit/void"}
            
            Generate documentation in JSON format with the following structure:
            {
                "summary": "Brief one-line description of what the function does",
                "description": "Detailed explanation of functionality, algorithms, and behavior",
                "usage": "How to call this function with examples",
                "examples": ["example usage code"],
                "parameters": [{"name": "param", "type": "String", "description": "purpose and constraints"}],
                "returnValue": {"type": "ReturnType", "description": "what is returned"},
                "seeAlso": ["related functions"],
                "tags": ["complexity", "performance", "category"]
            }
            
            Focus on:
            1. Parameter validation and constraints
            2. Return value explanation
            3. Side effects and exceptions
            4. Performance considerations
            5. Usage examples
        """.trimIndent()
    }

    private fun buildFilePrompt(context: CodeContext): String {
        return """
            Analyze the following ${context.language} file and generate documentation:
            
            File: ${context.filePath}
            
            Code Structure:
            ```${context.language.lowercase()}
            ${context.sourceCode.take(2000)}${if (context.sourceCode.length > 2000) "..." else ""}
            ```
            
            Classes: ${context.classes.joinToString(", ")}
            Functions: ${context.functions.joinToString(", ")}
            Imports: ${context.imports.joinToString(", ")}
            
            Generate documentation in JSON format:
            {
                "summary": "Brief description of file purpose",
                "description": "Detailed explanation of file contents and organization",
                "usage": "How this file fits into the larger system",
                "examples": ["import examples", "usage patterns"],
                "seeAlso": ["related files"],
                "tags": ["category", "layer", "domain"]
            }
            
            Focus on:
            1. Overall file purpose and role
            2. Main exports and public interface
            3. Integration patterns
            4. Architecture considerations
        """.trimIndent()
    }

    private fun buildModulePrompt(context: CodeContext): String {
        return """
            Analyze the following module/package and generate documentation:
            
            Module: ${context.moduleName}
            Files: ${context.files.joinToString(", ")}
            
            Public API:
            ${context.publicAPI.joinToString("\n")}
            
            Dependencies:
            ${context.dependencies.joinToString(", ")}
            
            Generate documentation in JSON format:
            {
                "summary": "Brief description of module purpose",
                "description": "Detailed explanation of module functionality and architecture",
                "usage": "How to integrate and use this module",
                "examples": ["integration examples", "configuration examples"],
                "seeAlso": ["related modules"],
                "tags": ["architecture", "domain", "layer"]
            }
            
            Focus on:
            1. Module boundaries and responsibilities
            2. Public API and interfaces
            3. Integration patterns
            4. Configuration and setup
        """.trimIndent()
    }

    private suspend fun callOpenAI(prompt: String): String {
        try {
            val chatCompletionRequest = ChatCompletionRequest(
                model = ModelId(configService.getOpenAIModel()),
                messages = listOf(
                    ChatMessage(
                        role = ChatRole.System,
                        content = "You are a technical documentation expert. Generate clear, comprehensive documentation in the exact JSON format requested."
                    ),
                    ChatMessage(
                        role = ChatRole.User,
                        content = prompt
                    )
                ),
                temperature = 0.3,
                maxTokens = configService.getOpenAIMaxTokens()
            )

            val completion: ChatCompletion = openAIClient.chatCompletion(chatCompletionRequest)
            return completion.choices.firstOrNull()?.message?.content
                ?: throw DocumentationGenerationException("Empty response from OpenAI")

        } catch (e: Exception) {
            throw DocumentationGenerationException("OpenAI API call failed", e)
        }
    }

    private fun parseDocumentationResponse(response: String): ParsedDocumentation {
        return try {
            // Extract JSON from response (handle code block formatting)
            val jsonStart = response.indexOf('{')
            val jsonEnd = response.lastIndexOf('}') + 1
            val jsonContent = response.substring(jsonStart, jsonEnd)

            kotlinx.serialization.json.Json.decodeFromString<ParsedDocumentation>(jsonContent)
        } catch (e: Exception) {
            // Fallback parsing if JSON is malformed
            ParsedDocumentation(
                summary = extractSection(response, "summary") ?: "Documentation generated",
                description = extractSection(response, "description") ?: response.take(500),
                usage = extractSection(response, "usage") ?: "",
                examples = listOf(),
                parameters = listOf(),
                returnValue = null,
                seeAlso = listOf(),
                tags = listOf()
            )
        }
    }

    private fun extractSection(text: String, section: String): String? {
        val pattern = "\"$section\"\\s*:\\s*\"([^\"]+)\"".toRegex()
        return pattern.find(text)?.groupValues?.get(1)
    }

    private fun calculateQuality(doc: ParsedDocumentation): Double {
        var score = 0.0

        // Base quality score
        if (doc.summary.isNotBlank()) score += 0.2
        if (doc.description.isNotBlank()) score += 0.3
        if (doc.usage.isNotBlank()) score += 0.2
        if (doc.examples.isNotEmpty()) score += 0.2
        if (doc.parameters.isNotEmpty()) score += 0.1

        // Length and detail bonuses
        if (doc.description.length > 100) score += 0.1
        if (doc.examples.size > 1) score += 0.1

        return score.coerceIn(0.0, 1.0)
    }

    private fun recalculateQuality(doc: Documentation, feedback: DocumentationFeedback): Double {
        val baseQuality = doc.quality
        val feedbackAdjustment = when (feedback.rating) {
            5 -> 0.1
            4 -> 0.05
            3 -> 0.0
            2 -> -0.05
            1 -> -0.1
            else -> 0.0
        }

        return (baseQuality + feedbackAdjustment).coerceIn(0.0, 1.0)
    }
}

@Serializable
data class ParsedDocumentation(
    val summary: String,
    val description: String,
    val usage: String,
    val examples: List<String>,
    val parameters: List<ParameterDoc>,
    val returnValue: ReturnValueDoc?,
    val seeAlso: List<String>,
    val tags: List<String>
)

@Serializable
data class ParameterDoc(
    val name: String,
    val type: String,
    val description: String
)

@Serializable
data class ReturnValueDoc(
    val type: String,
    val description: String
)

data class DocumentationRequest(
    val symbolId: String,
    val symbolType: SymbolType,
    val codeContext: CodeContext
)

data class CodeContext(
    val language: String,
    val filePath: String,
    val sourceCode: String,
    val lastModified: LocalDateTime,
    val className: String? = null,
    val moduleName: String? = null,
    val dependencies: List<String> = emptyList(),
    val methods: List<String> = emptyList(),
    val properties: List<String> = emptyList(),
    val parameters: List<ParameterInfo> = emptyList(),
    val returnType: String? = null,
    val classes: List<String> = emptyList(),
    val functions: List<String> = emptyList(),
    val imports: List<String> = emptyList(),
    val files: List<String> = emptyList(),
    val publicAPI: List<String> = emptyList()
)

data class ParameterInfo(
    val name: String,
    val type: String
)

class DocumentationGenerationException(message: String, cause: Throwable? = null) : Exception(message, cause)
class DocumentationNotFoundException(message: String) : Exception(message)