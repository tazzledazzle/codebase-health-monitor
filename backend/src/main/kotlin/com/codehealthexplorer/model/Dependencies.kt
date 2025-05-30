package com.codehealthexplorer.model

object Dependencies : Table("dependencies") {
    val id = uuid("id").autoGenerate()
    val repositoryId = ("repository_id" to Repositories.id).references(Repositories.id)
    val sourceFileId = ("source_file_id" to CodeFiles.id).references(CodeFiles.id).nullable()
    val target = text("target")
    val type = enumerationByName<DependencyType>("type", 50)

    override val primaryKey = PrimaryKey(id)
}