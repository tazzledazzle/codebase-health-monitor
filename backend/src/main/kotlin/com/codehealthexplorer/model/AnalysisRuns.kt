package com.codehealthexplorer.model


//import kotlinx.datetime.LocalDateTime
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.datetime
import java.time.LocalDateTime
import java.util.*


object AnalysisRuns : Table("analysis_runs") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val repositoryId = uuid("repository_id").references(Repositories.id)
    val startedAt = datetime("started_at").clientDefault { LocalDateTime.now() }
    val completedAt = datetime("completed_at").nullable()
    val status = enumerationByName<AnalysisStatus>("status", 50)
    val error = text("error").nullable()
//    val metrics =  jsonb<CodeMetrics>("metrics", CodeMetrics::class).nullable()
    override val primaryKey = PrimaryKey(id)
}