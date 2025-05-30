package com.codehealthexplorer.analyzer

import java.io.File

interface CodeAnalyzer {
    fun analyze(directory: File): AnalysisResult
}

data class AnalysisResult(
    val files: List<SourceFile>,
    val dependencies: List<Dependency>,
    val metrics: CodeMetrics
)

data class SourceFile(
    val path: String,
    val language: String,
    val size: Long,
    val functions: List<Function>,
    val classes: List<ClassInfo>,
    val imports: List<String>,
    val dependencies: List<String>
)

data class Function(
    val name: String,
    val parameters: List<String>,
    val returnType: String,
    val lineCount: Int,
    val complexity: Int
)

data class ClassInfo(
    val name: String,
    val methods: List<Function>,
    val fields: List<Field>,
    val isAbstract: Boolean,
    val superClasses: List<String>
)

data class Field(
    val name: String,
    val type: String,
    val isPublic: Boolean
)

data class Dependency(
    val from: String,
    val to: String,
    val type: DependencyType
)

enum class DependencyType {
    INHERITANCE,
    IMPLEMENTATION,
    IMPORT,
    FUNCTION_CALL,
    VARIABLE_REFERENCE
}

data class CodeMetrics(
    val linesOfCode: Int,
    val numberOfFiles: Int,
    val numberOfClasses: Int,
    val numberOfFunctions: Int,
    val averageComplexity: Double,
    val dependencyCount: Int
)

class StaticAnalyzer : CodeAnalyzer {
    override fun analyze(directory: File): AnalysisResult {
        if (!directory.exists() || !directory.isDirectory) {
            throw IllegalArgumentException("Provided path is not a valid directory")
        }

        val sourceFiles = mutableListOf<SourceFile>()
        val allDependencies = mutableListOf<Dependency>()
        
        // Recursively process all files in the directory
        directory.walk()
            .filter { it.isFile }
            .forEach { file ->
                when (file.extension.lowercase()) {
                    "kt", "java", "js", "ts", "py" -> {
                        val sourceFile = analyzeFile(file, directory)
                        sourceFiles.add(sourceFile)
                        // Extract dependencies from imports
                        sourceFile.imports.forEach { imp ->
                            allDependencies.add(
                                Dependency(
                                    from = file.relativeTo(directory).path,
                                    to = imp,
                                    type = DependencyType.IMPORT
                                )
                            )
                        }
                    }
                }
            }
        
        // Calculate metrics
        val metrics = calculateMetrics(sourceFiles, allDependencies)
        
        return AnalysisResult(
            files = sourceFiles,
            dependencies = allDependencies,
            metrics = metrics
        )
    }
    
    private fun analyzeFile(file: File, rootDir: File): SourceFile {
        val relativePath = file.relativeTo(rootDir).path
        val content = file.readText()
        val lines = content.lines()
        
        // Simple analysis - in a real implementation, you'd use a proper parser for each language
        val imports = extractImports(content, file.extension.lowercase())
        val functions = extractFunctions(content, file.extension.lowercase())
        val classes = extractClasses(content, file.extension.lowercase())
        
        return SourceFile(
            path = relativePath,
            language = file.extension.uppercase(),
            size = file.length(),
            functions = functions,
            classes = classes,
            imports = imports,
            dependencies = imports // Simple approach - dependencies are just imports for now
        )
    }
    
    private fun extractImports(content: String, fileExtension: String): List<String> {
        val imports = mutableListOf<String>()
        val importPattern = when (fileExtension) {
            "kt", "java" -> "^\\s*import\\s+([^;\\n]+)".toRegex(RegexOption.MULTILINE)
            "js", "ts" -> "^\\s*import\\s+.*?['\"]([^'\"]+)['\"]".toRegex(RegexOption.MULTILINE)
            "py" -> "^\\s*import\\s+([^\\n#]+)".toRegex(RegexOption.MULTILINE)
            else -> return emptyList()
        }
        
        importPattern.findAll(content).forEach {
            imports.add(it.groupValues[1].trim())
        }
        
        return imports
    }
    
    private fun extractFunctions(content: String, fileExtension: String): List<Function> {
        // Simplified function extraction - in a real implementation, use proper parsing
        val functions = mutableListOf<Function>()
        val functionPattern = when (fileExtension) {
            "kt", "java" -> "(?:fun|(?:public|private|protected|static|final|native|synchronized|abstract|transient)+)\\s+([A-Za-z0-9_<>, ]+\\s+)?([A-Za-z0-9_]+)\\s*\\(([^)]*)\\)".toRegex()
            "js", "ts" -> "(?:function\\s+)?([A-Za-z0-9_]+)\\s*\\(([^)]*)\\)".toRegex()
            "py" -> "def\\s+([A-Za-z0-9_]+)\\s*\\(([^)]*)\\)".toRegex()
            else -> return emptyList()
        }
        
        functionPattern.findAll(content).forEach { match ->
            val returnType = if (fileExtension in listOf("kt", "java") && match.groupValues.size > 2) {
                match.groupValues[1].trim()
            } else ""
            
            val name = match.groupValues[if (fileExtension in listOf("kt", "java")) 2 else 1].trim()
            val params = match.groupValues.last().split(',').map { it.trim() }.filter { it.isNotEmpty() }
            
            functions.add(
                Function(
                    name = name,
                    parameters = params,
                    returnType = returnType,
                    lineCount = 1, // Simplified
                    complexity = 1  // Simplified
                )
            )
        }
        
        return functions
    }
    
    private fun extractClasses(content: String, fileExtension: String): List<ClassInfo> {
        // Simplified class extraction - in a real implementation, use proper parsing
        val classes = mutableListOf<ClassInfo>()
        val classPattern = when (fileExtension) {
            "kt" -> "(?:class|object|interface)\\s+([A-Za-z0-9_]+)(?:\\s*:\\s*([^{]*))?\\s*\\{".toRegex()
            "java" -> "(?:public\\s+)?(?:class|interface|enum|@interface)\\s+([A-Za-z0-9_]+)(?:\\s+(?:extends|implements)\\s+([^{]*))?\\s*\\{".toRegex()
            "js", "ts" -> "(?:class|interface)\\s+([A-Za-z0-9_]+)(?:\\s+extends\\s+([^{]*))?\\s*\\{".toRegex()
            "py" -> "class\\s+([A-Za-z0-9_]+)(?:\\(([^)]*)\\))?\\s*:".toRegex()
            else -> return emptyList()
        }
        
        classPattern.findAll(content).forEach { match ->
            val className = match.groupValues[1].trim()
            val superClasses = if (match.groupValues.size > 2) {
                match.groupValues[2].split(',').map { it.trim() }.filter { it.isNotEmpty() }
            } else emptyList()
            
            classes.add(
                ClassInfo(
                    name = className,
                    methods = emptyList(), // Simplified - in reality, you'd parse method bodies
                    fields = emptyList(),  // Simplified - in reality, you'd parse fields
                    isAbstract = false,    // Simplified
                    superClasses = superClasses
                )
            )
        }
        
        return classes
    }
    
    private fun calculateMetrics(files: List<SourceFile>, dependencies: List<Dependency>): CodeMetrics {
        val totalLines = files.sumOf { File(it.path).readLines().size }
        val totalFunctions = files.sumOf { it.functions.size }
        val totalClasses = files.sumOf { it.classes.size }
        val avgComplexity = if (files.isNotEmpty()) {
            files.flatMap { it.functions }.map { it.complexity }.average()
        } else 0.0
        
        return CodeMetrics(
            linesOfCode = totalLines,
            numberOfFiles = files.size,
            numberOfClasses = totalClasses,
            numberOfFunctions = totalFunctions,
            averageComplexity = avgComplexity,
            dependencyCount = dependencies.size
        )
    }
}
