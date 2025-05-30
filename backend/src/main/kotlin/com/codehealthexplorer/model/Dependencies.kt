package com.codehealthexplorer.model


import org.jetbrains.exposed.sql.Table
import org.jetbrains.exposed.sql.javatime.datetime
import org.jetbrains.exposed.sql.json.jsonb
import java.time.LocalDateTime
import java.util.*
import kotlinx.serialization.Serializable

object Dependencies : Table("dependencies") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val repositoryId = uuid("repository_id").references(Repositories.id)
    val sourceFileId = uuid("source_file_id").references(CodeFiles.id).nullable()
    val target = text("target")
    val type = enumerationByName<DependencyType>("type", 50)
    override val primaryKey = PrimaryKey(id)
}