package com.codehealthexplorer

import com.codehealthexplorer.analyzer.StaticAnalyzer
import com.codehealthexplorer.controller.repositoryRoutes
import com.codehealthexplorer.plugins.*
import com.codehealthexplorer.repository.RepositoryRepository
import com.codehealthexplorer.service.AnalysisService
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.response.respondText
import io.ktor.server.routing.get
import io.ktor.server.routing.routing
import org.jetbrains.exposed.v1.jdbc.Database
import org.koin.dsl.module
import org.koin.ktor.plugin.Koin
import org.koin.logger.slf4jLogger

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module)
        .start(wait = true)
}

fun Application.module() {
    // Configure Koin for dependency injection
    install(Koin) {
        slf4jLogger()
        modules(appModule)
    }
    
    // Configure plugins
    configureSerialization()
    configureCORS()
    configureSecurity()
    configureDatabases()
//    configureMonitoring()
//    configureOpenAPI()
//    configureSentry()
//    configureRedis()
    configureRouting()
    // Configure routing
    routing {
        // Health check endpoint
        get("/health") {
            call.respondText("OK")
        }
        
        // Repository routes
        repositoryRoutes()
    }
}

// Koin module for dependency injection
val appModule = module {
    single { Database.connect("jdbc:h2:mem:test;DB_CLOSE_DELAY=-1", driver = "org.h2.Driver") }
    single { RepositoryRepository(this.get()) }
    single { StaticAnalyzer() }
    single { AnalysisService(get(), get()) }
}