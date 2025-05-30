package com.codehealthexplorer.controller

import com.codehealthexplorer.model.*
import com.codehealthexplorer.service.AnalysisService
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import org.koin.ktor.ext.inject
import java.io.File
import java.util.*

fun Route.repositoryRoutes() {
    val analysisService: AnalysisService by inject()
    
    route("/api/repositories") {
        // Create a new repository
        post {
            try {
                val params = call.receive<CreateRepositoryRequest>()
                val repoId = UUID.randomUUID()
                
                // In a real app, you would clone the repo here
                // For now, we'll just create a local directory reference
                val localPath = "/tmp/codebase-health-explorer/${repoId}"
                File(localPath).mkdirs()
                
                // Create repository in database
                analysisService.repository.createRepository(
                    name = params.name,
                    url = params.url,
                    localPath = localPath
                )
                
                call.respond(HttpStatusCode.Created, mapOf("id" to repoId))
            } catch (e: Exception) {
                call.respond(HttpStatusCode.BadRequest, mapOf("error" to e.message))
            }
        }
        
        // Get all repositories
        get {
            val repos = analysisService.repository.getAllRepositories()
            call.respond(repos)
        }
        
        // Get repository by ID
        get("/{id}") {
            val id = call.parameters["id"]?.let { UUID.fromString(it) } 
                ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid ID"))
            
            val repo = analysisService.repository.getRepository(id)
                ?: return@get call.respond(HttpStatusCode.NotFound)
                
            call.respond(repo)
        }
        
        // Analyze repository
        post("/{id}/analyze") {
            val id = call.parameters["id"]?.let { UUID.fromString(it) } 
                ?: return@post call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid ID"))
            
            try {
                val result = analysisService.analyzeRepository(id)
                when (result) {
                    is AnalysisResult.Success -> call.respond(result.data)
                    is AnalysisResult.Error -> call.respond(HttpStatusCode.InternalServerError, 
                        mapOf("error" to result.message))
                }
            } catch (e: Exception) {
                call.respond(HttpStatusCode.InternalServerError, 
                    mapOf("error" to e.message ?: "Unknown error"))
            }
        }
        
        // Get repository metrics
        get("/{id}/metrics") {
            val id = call.parameters["id"]?.let { UUID.fromString(it) } 
                ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid ID"))
            
            val result = analysisService.getRepositoryMetrics(id)
            when (result) {
                is AnalysisResult.Success -> call.respond(result.data)
                is AnalysisResult.Error -> call.respond(HttpStatusCode.NotFound, 
                    mapOf("error" to result.message))
            }
        }
        
        // Get dependency graph
        get("/{id}/dependencies") {
            val id = call.parameters["id"]?.let { UUID.fromString(it) } 
                ?: return@get call.respond(HttpStatusCode.BadRequest, mapOf("error" to "Invalid ID"))
            
            val result = analysisService.getDependencyGraph(id)
            when (result) {
                is AnalysisResult.Success -> call.respond(result.data)
                is AnalysisResult.Error -> call.respond(HttpStatusCode.NotFound, 
                    mapOf("error" to result.message))
            }
        }
    }
}

data class CreateRepositoryRequest(
    val name: String,
    val url: String?
)

// Extension function to get all repositories
private suspend fun RepositoryRepository.getAllRepositories(): List<Repository> = 
    transaction(database) {
        Repositories.selectAll()
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
            }
    }
