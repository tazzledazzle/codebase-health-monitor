package com.codehealthexplorer.model


import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.json.jsonb
import java.time.LocalDateTime
import java.util.*
import kotlinx.serialization.Serializable

// Database Tables
object Repositories : Table("repositories") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val name = varchar("name", 255)
    val url = varchar("url", 512).nullable()
    val localPath = text("local_path")
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").nullable()
    val lastAnalyzedAt = datetime("last_analyzed_at").nullable()
    val status = enumerationByName<RepositoryStatus>("status", 50)
    override val primaryKey = PrimaryKey(id)
}