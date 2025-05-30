package com.codehealthexplorer.model


import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.datetime
import java.util.*


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