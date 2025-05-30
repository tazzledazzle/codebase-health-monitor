package com.codehealthexplorer.plugins

import io.ktor.server.application.*
import io.ktor.server.response.*
import io.ktor.server.routing.*

fun Application.configureRouting() {
    routing {
        get("/") {
            call.respondText("Codebase Health Explorer API")
        }
        
        route("/api") {
            get("/health") {
                call.respondText("OK")
            }
            
            // Repository routes
            route("/repositories") {
                get {
                    call.respondText("List repositories")
                }
                post {
                    call.respondText("Create repository")
                }
                get("/{id}") {
                    call.respondText("Get repository details")
                }
            }
            
            // Analysis routes
            route("/analysis") {
                get("/{repoId}/dependencies") {
                    call.respondText("Get dependency graph")
                }
                get("/{repoId}/hotspots") {
                    call.respondText("Get error hotspots")
                }
                get("/{repoId}/documentation") {
                    call.respondText("Get AI documentation")
                }
            }
        }
    }
}