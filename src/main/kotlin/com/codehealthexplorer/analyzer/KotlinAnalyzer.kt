package com.codehealthexplorer.analyzer

import com.codehealthexplorer.model.CodeFile
import com.codehealthexplorer.model.DependencyType
import com.codehealthexplorer.service.FileAnalysisResult
import com.codehealthexplorer.service.FileDependency
import org.jetbrains.kotlin.cli.jvm.compiler.EnvironmentConfigFiles
import org.jetbrains.kotlin.cli.jvm.compiler.KotlinCoreEnvironment
import org.jetbrains.kotlin.com.intellij.openapi.util.Disposer
import org.jetbrains.kotlin.com.intellij.psi.PsiManager
import org.jetbrains.kotlin.com.intellij.testFramework.LightVirtualFile
import org.jetbrains.kotlin.config.CompilerConfiguration
import org.jetbrains.kotlin.idea.KotlinFileType
import org.jetbrains.kotlin.psi.*
import java.nio.file.Files
import java.nio.file.Path

class KotlinAnalyzer : CodeAnalyzer {

    override suspend fun analyzeFile(filePath: Path, codeFile: CodeFile): FileAnalysisResult {
        val content = Files.readString(filePath)
        val linesOfCode = countLinesOfCode(content)

        val dependencies = mutableListOf<FileDependency>()
        val complexity = try {
            val ktFile = parseKotlinFile(filePath.fileName.toString(), content)

            // Extract imports
            ktFile.importDirectives.forEach { import ->
                val importPath = import.importedFqName?.asString()
                if (importPath != null) {
                    dependencies.add(
                        FileDependency(
                            target = importPath,
                            type = DependencyType.IMPORT
                        )
                    )
                }
            }

            // Extract class dependencies
            extractClassDependencies(ktFile, dependencies)

            // Calculate complexity
            calculateComplexity(ktFile)
        } catch (e: Exception) {
            // If parsing fails, return basic metrics
            println("Failed to parse Kotlin file ${filePath}: ${e.message}")
            1.0 // Basic complexity for unparseable files
        }

        return FileAnalysisResult(
            codeFile = codeFile.copy(
                linesOfCode = linesOfCode,
                complexity = complexity
            ),
            linesOfCode = linesOfCode,
            complexity = complexity,
            dependencies = dependencies
        )
    }

    private fun parseKotlinFile(fileName: String, content: String): KtFile {
        val disposable = Disposer.newDisposable()
        try {
            val configuration = CompilerConfiguration()
            val environment = KotlinCoreEnvironment.createForProduction(
                disposable, configuration, EnvironmentConfigFiles.JVM_CONFIG_FILES
            )

            val virtualFile = LightVirtualFile(fileName, KotlinFileType.INSTANCE, content)
            val psiManager = PsiManager.getInstance(environment.project)

            return psiManager.findFile(virtualFile) as? KtFile
                ?: throw IllegalStateException("Failed to parse Kotlin file")
        } finally {
            disposable.dispose()
        }
    }

    private fun extractClassDependencies(ktFile: KtFile, dependencies: MutableList<FileDependency>) {
        ktFile.accept(object : KtVisitorVoid() {
            override fun visitClass(klass: KtClass) {
                super.visitClass(klass)

                // Extract superclass dependencies
                klass.superTypeListEntries.forEach { superType ->
                    val typeName = superType.text
                    dependencies.add(
                        FileDependency(
                            target = typeName,
                            type = if (klass.isInterface()) DependencyType.IMPLEMENTATION
                            else DependencyType.INHERITANCE
                        )
                    )
                }
            }

            override fun visitCallExpression(expression: KtCallExpression) {
                super.visitCallExpression(expression)

                // Extract function call dependencies
                val calleeText = expression.calleeExpression?.text
                if (calleeText != null) {
                    dependencies.add(
                        FileDependency(
                            target = calleeText,
                            type = DependencyType.FUNCTION_CALL
                        )
                    )
                }
            }

            override fun visitProperty(property: KtProperty) {
                super.visitProperty(property)

                // Extract property type dependencies
                property.typeReference?.text?.let { typeText ->
                    dependencies.add(
                        FileDependency(
                            target = typeText,
                            type = DependencyType.VARIABLE_REFERENCE
                        )
                    )
                }
            }
        })
    }

    private fun calculateComplexity(ktFile: KtFile): Double {
        var complexity = 1.0 // Base complexity

        ktFile.accept(object : KtVisitorVoid() {
            override fun visitIfExpression(expression: KtIfExpression) {
                super.visitIfExpression(expression)
                complexity += 1
            }

            override fun visitWhenExpression(expression: KtWhenExpression) {
                super.visitWhenExpression(expression)
                complexity += expression.entries.size
            }

            override fun visitForExpression(expression: KtForExpression) {
                super.visitForExpression(expression)
                complexity += 1
            }

            override fun visitWhileExpression(expression: KtWhileExpression) {
                super.visitWhileExpression(expression)
                complexity += 1
            }

            override fun visitDoWhileExpression(expression: KtDoWhileExpression) {
                super.visitDoWhileExpression(expression)
                complexity += 1
            }

            override fun visitTryExpression(expression: KtTryExpression) {
                super.visitTryExpression(expression)
                complexity += expression.catchClauses.size
            }
        })

        return complexity
    }

    private fun countLinesOfCode(content: String): Int {
        return content.lines()
            .map { it.trim() }
            .count { it.isNotEmpty() && !it.startsWith("//") && !it.startsWith("/*") }
    }
}