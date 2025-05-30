package com.codehealthexplorer.plugins

import io.ktor.server.application.*
import org.jetbrains.exposed.*
import org.jetbrains.exposed.v1.jdbc.Database
import org.jetbrains.exposed.v1.jdbc.SchemaUtils
import org.jetbrains.exposed.v1.jdbc.transactions.transaction

fun Application.configureDatabases() {
    val database = Database.connect(
        url = "jdbc:postgresql://localhost:5432/codehealthexplorer",
        driver = "org.postgresql.Driver",
        user = "postgres",
        password = "postgres"
    )
    
    transaction(database) {
        // Create tables if they don't exist
        SchemaUtils.create(
        /* Add your tables here */
        // Repositories,)
            // AnalysisRuns,
            // CodeFiles,
            // Dependencies
        )
    }
}