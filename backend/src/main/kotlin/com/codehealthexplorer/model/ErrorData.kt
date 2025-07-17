package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.datetime
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class ErrorData(
    val id: UUID,
    val repositoryId: UUID,
    val fileId: UUID?,
    val message: String,
    val stackTrace: String?,
    val count: Int,
    val firstOccurred: LocalDateTime,
    val lastOccurred: LocalDateTime,
    val severity: ErrorSeverity
)

enum class ErrorSeverity {
    CRITICAL,
    ERROR,
    WARNING,
    INFO
}

object ErrorDatas : Table("error_data") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val repositoryId = uuid("repository_id").references(Repositories.id)
    val fileId = uuid("file_id").references(CodeFiles.id).nullable()
    val message = text("message")
    val stackTrace = text("stack_trace").nullable()
    val count = integer("count").default(1)
    val firstOccurred = datetime("first_occurred").clientDefault { LocalDateTime.now() }
    val lastOccurred = datetime("last_occurred").clientDefault { LocalDateTime.now() }
    val severity = enumerationByName<ErrorSeverity>("severity", 50)
    
    override val primaryKey = PrimaryKey(id)
}