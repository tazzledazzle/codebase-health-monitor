package com.codehealthexplorer.model

import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

// Database Tables
object Repositories : Table("repositories") {
    val id = uuid("id").autoGenerate()
    val name = varchar("name", 255)
    val url = varchar("url", 512).nullable()
    val localPath = text("local_path")
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").nullable()
    val lastAnalyzedAt = datetime("last_analyzed_at").nullable()
    val status = enumerationByName<RepositoryStatus>("status", 50)

    override val primaryKey = PrimaryKey(id)
}