package com.codehealthexplorer.model

import org.jetbrains.exposed.v1.core.Table
import org.jetbrains.exposed.v1.javatime.datetime
import java.time.LocalDateTime
import java.util.*

object Teams : Table("teams") {
    val id = uuid("id").clientDefault { UUID.randomUUID() }
    val name = varchar("name", 255)
    val ownerId = uuid("owner_id").references(Users.id)
    val createdAt = datetime("created_at").clientDefault { LocalDateTime.now() }
    val updatedAt = datetime("updated_at").clientDefault { LocalDateTime.now() }
    
    override val primaryKey = PrimaryKey(id)
}

object TeamMembers : Table("team_members") {
    val teamId = uuid("team_id").references(Teams.id)
    val userId = uuid("user_id").references(Users.id)
    val role = enumerationByName<TeamRole>("role", 50)
    val joinedAt = datetime("joined_at").clientDefault { LocalDateTime.now() }
    
    override val primaryKey = PrimaryKey(teamId, userId)
}