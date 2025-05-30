package com.codehealthexplorer.model

import org.jetbrains.exposed.sql.javatime.datetime
import java.time.LocalDateTime

object AnalysisRuns : Table("analysis_runs") {
    val id = uuid("id").autoGenerate()
    val repositoryId = ("repository_id" to Repositories.id) /*(Repositories.id)*/
    val startedAt = datetime("started_at").clientDefault { LocalDateTime.now() }
    val completedAt = datetime("completed_at").nullable()
    val status = enumerationByName<AnalysisStatus>("status", 50)
    val error = text("error").nullable()
//    val metrics = jsonb<CodeMetrics>("metrics", CodeMetrics::class.java)

    override val primaryKey = PrimaryKey(id)
}