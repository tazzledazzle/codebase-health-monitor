package com.codehealthexplorer.model

// Enums
enum class RepositoryStatus {
    PENDING,
    CLONING,
    ANALYZING,
    READY,
    ERROR
}

enum class AnalysisStatus {
    PENDING,
    IN_PROGRESS,
    COMPLETED,
    FAILED
}

enum class DependencyType {
    INHERITANCE,
    IMPLEMENTATION,
    IMPORT,
    FUNCTION_CALL,
    VARIABLE_REFERENCE
}

