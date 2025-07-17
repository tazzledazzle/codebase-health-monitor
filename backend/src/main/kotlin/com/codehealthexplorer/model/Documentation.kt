package com.codehealthexplorer.model

import kotlinx.serialization.Serializable
import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.datetime
import java.time.LocalDateTime
import java.util.UUID

@Serializable
data class Documentation(
    val id: UUID,
    val repositoryId: UUID,
    val symbolId: String,
    val symbolType: SymbolType,
    val name: String,
    val description: String?,
    val usageNotes: String?,
    val examples: List<String>,
    val generatedAt: LocalDateTime,
    val version: Int
)

enum class SymbolType {
    CLASS,
    INTERFACE,
    FUNCTION,
    PROPERTY,
    MODULE,
    PACKAGE,
    ENUM,
    OTHER
}

object Documentations : Table("documentation") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val repositoryId = uuid("repository_id").references(Repositories.id)
    val symbolId = varchar("symbol_id", 500)
    val symbolType = enumerationByName<SymbolType>("symbol_type", 50)
    val name = varchar("name", 500)
    val description = text("description").nullable()
    val usageNotes = text("usage_notes").nullable()
    val examples = jsonb<List<String>>("examples")
    val generatedAt = datetime("generated_at").clientDefault { LocalDateTime.now() }
    val version = integer("version").default(1)
    
    override val primaryKey = PrimaryKey(id)
    
    init {
        uniqueIndex(repositoryId, symbolId)
    }
}