package com.codehealthexplorer.model

import java.util.UUID

data class Dependency(
    val id: UUID,
    val repositoryId: UUID,
    val sourceFileId: UUID?,
    val target: String,
    val type: DependencyType
)