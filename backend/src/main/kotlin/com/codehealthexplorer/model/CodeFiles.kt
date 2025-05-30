package com.codehealthexplorer.model


import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.json.jsonb
import java.time.LocalDateTime
import java.util.*
import kotlinx.serialization.Serializable


object CodeFiles : Table("code_files") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val repositoryId = uuid("repository_id").references(Repositories.id)
    val path = text("path")
    val language = varchar("language", 50)
    val size = long("size")
    val linesOfCode = integer("lines_of_code")
    val complexity = double("complexity").default(0.0)
    val lastModified = datetime("last_modified").nullable()
    override val primaryKey = PrimaryKey(id)
}