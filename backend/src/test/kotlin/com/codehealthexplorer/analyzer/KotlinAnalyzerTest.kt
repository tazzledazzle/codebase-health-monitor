package com.codehealthexplorer.analyzer

import com.codehealthexplorer.model.CodeFile
import com.codehealthexplorer.model.DependencyType
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Assertions.*
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.nio.file.Files
import java.nio.file.Path
import java.time.LocalDateTime
import java.util.*

class KotlinAnalyzerTest {

    private lateinit var kotlinAnalyzer: KotlinAnalyzer
    private lateinit var tempDir: Path

    @BeforeEach
    fun setup() {
        kotlinAnalyzer = KotlinAnalyzer()
        tempDir = Files.createTempDirectory("kotlin-analyzer-test")
    }

    @Test
    fun `analyzeFile should parse simple Kotlin class correctly`() = runBlocking {
        // Given
        val kotlinContent = """
            package com.example.test
            
            import java.util.List
            import kotlin.collections.Map
            
            /**
             * A simple test class
             */
            class TestClass : BaseClass, TestInterface {
                private val items: List<String> = emptyList()
                
                fun processItems(): Map<String, Int> {
                    if (items.isEmpty()) {
                        return emptyMap()
                    }
                    
                    val result = mutableMapOf<String, Int>()
                    for (item in items) {
                        when {
                            item.startsWith("prefix") -> result[item] = 1
                            item.contains("middle") -> result[item] = 2
                            else -> result[item] = 0
                        }
                    }
                    
                    return result
                }
                
                fun simpleMethod() {
                    println("Hello")
                    someOtherFunction()
                }
            }
        """.trimIndent()

        val testFile = tempDir.resolve("TestClass.kt")
        Files.write(testFile, kotlinContent.toByteArray())

        val codeFile = CodeFile(
            id = UUID.randomUUID(),
            repositoryId = UUID.randomUUID(),
            path = "TestClass.kt",
            language = "Kotlin",
            size = kotlinContent.length.toLong(),
            linesOfCode = 0,
            complexity = 0.0,
            lastModified = LocalDateTime.now()
        )

        // When
        val result = kotlinAnalyzer.analyzeFile(testFile, codeFile)

        // Then
        // Check lines of code (excluding comments and empty lines)
        assertTrue(result.linesOfCode > 20) // Should count actual code lines

        // Check complexity (base 1 + conditions)
        assertTrue(result.complexity > 5.0) // if + when entries + for loop

        // Check dependencies
        val dependencies = result.dependencies

        // Should find imports
        assertTrue(dependencies.any {
            it.target == "java.util.List" && it.type == DependencyType.IMPORT
        })
        assertTrue(dependencies.any {
            it.target == "kotlin.collections.Map" && it.type == DependencyType.IMPORT
        })

        // Should find inheritance
        assertTrue(dependencies.any {
            it.target == "BaseClass" && it.type == DependencyType.INHERITANCE
        })
        assertTrue(dependencies.any {
            it.target.contains("TestInterface") && it.type == DependencyType.IMPLEMENTATION
        })

        // Should find function calls
        assertTrue(dependencies.any {
            it.target.contains("println") && it.type == DependencyType.FUNCTION_CALL
        })
        assertTrue(dependencies.any {
            it.target.contains("someOtherFunction") && it.type == DependencyType.FUNCTION_CALL
        })

        // Should find variable references
        assertTrue(dependencies.any {
            it.target.contains("List") && it.type == DependencyType.VARIABLE_REFERENCE
        })
    }

    @Test
    fun `analyzeFile should handle complex control flow correctly`() = runBlocking {
        // Given
        val complexKotlinContent = """
            class ComplexClass {
                fun complexMethod(input: String): String {
                    return when {
                        input.isEmpty() -> "empty"
                        input.length < 5 -> "short"
                        input.length < 10 -> "medium"
                        else -> "long"
                    }
                }
                
                fun loopMethod() {
                    for (i in 1..10) {
                        if (i % 2 == 0) {
                            continue
                        }
                        println(i)
                    }
                    
                    var x = 0
                    while (x < 5) {
                        x++
                    }
                    
                    do {
                        x--
                    } while (x > 0)
                }
                
                fun exceptionMethod() {
                    try {
                        riskyOperation()
                    } catch (e: IllegalArgumentException) {
                        handleError(e)
                    } catch (e: RuntimeException) {
                        handleRuntime(e)
                    } finally {
                        cleanup()
                    }
                }
            }
        """.trimIndent()

        val testFile = tempDir.resolve("ComplexClass.kt")
        Files.write(testFile, complexKotlinContent.toByteArray())

        val codeFile = CodeFile(
            id = UUID.randomUUID(),
            repositoryId = UUID.randomUUID(),
            path = "ComplexClass.kt",
            language = "Kotlin",
            size = complexKotlinContent.length.toLong(),
            linesOfCode = 0,
            complexity = 0.0,
            lastModified = LocalDateTime.now()
        )

        // When
        val result = kotlinAnalyzer.analyzeFile(testFile, codeFile)

        // Then
        // High complexity due to when (4 branches) + if + for + while + do-while + try-catch (2 catches)
        // Expected: 1 + 4 + 1 + 1 + 1 + 1 + 2 = 11
        assertTrue(result.complexity >= 10.0, "Complexity was ${result.complexity}, expected >= 10.0")

        // Should find function calls
        val functionCalls = result.dependencies.filter { it.type == DependencyType.FUNCTION_CALL }
        assertTrue(functionCalls.any { it.target.contains("riskyOperation") })
        assertTrue(functionCalls.any { it.target.contains("handleError") })
        assertTrue(functionCalls.any { it.target.contains("cleanup") })
    }

    @Test
    fun `analyzeFile should handle interface correctly`() = runBlocking {
        // Given
        val interfaceContent = """
            interface TestInterface : ParentInterface {
                fun method1(): String
                fun method2(param: Int): Boolean
                
                companion object {
                    const val CONSTANT = "value"
                }
            }
        """.trimIndent()

        val testFile = tempDir.resolve("TestInterface.kt")
        Files.write(testFile, interfaceContent.toByteArray())

        val codeFile = CodeFile(
            id = UUID.randomUUID(),
            repositoryId = UUID.randomUUID(),
            path = "TestInterface.kt",
            language = "Kotlin",
            size = interfaceContent.length.toLong(),
            linesOfCode = 0,
            complexity = 0.0,
            lastModified = LocalDateTime.now()
        )

        // When
        val result = kotlinAnalyzer.analyzeFile(testFile, codeFile)

        // Then
        // Should have low complexity (just base complexity)
        assertEquals(1.0, result.complexity, 0.1)

        // Should find interface inheritance
        assertTrue(result.dependencies.any {
            it.target.contains("ParentInterface") && it.type == DependencyType.IMPLEMENTATION
        })
    }

    @Test
    fun `analyzeFile should count lines of code correctly`() = runBlocking {
        // Given
        val contentWithComments = """
            // This is a comment
            package com.example
            
            /*
             * Multi-line comment
             * with multiple lines
             */
            
            class TestClass { // Inline comment
                // Another comment
                fun method() {
                    println("Hello") // End of line comment
                    // Comment in method
                }
                
                /*
                 * Another multi-line
                 */
            }
            
            // Final comment
        """.trimIndent()

        val testFile = tempDir.resolve("CommentsTest.kt")
        Files.write(testFile, contentWithComments.toByteArray())

        val codeFile = CodeFile(
            id = UUID.randomUUID(),
            repositoryId = UUID.randomUUID(),
            path = "CommentsTest.kt",
            language = "Kotlin",
            size = contentWithComments.length.toLong(),
            linesOfCode = 0,
            complexity = 0.0,
            lastModified = LocalDateTime.now()
        )

        // When
        val result = kotlinAnalyzer.analyzeFile(testFile, codeFile)

        // Then
        // Should count only non-comment, non-empty lines
        // Expected lines: package, class declaration, method declaration, println statement, closing braces
        assertTrue(result.linesOfCode >= 5, "Lines of code was ${result.linesOfCode}, expected >= 5")
        assertTrue(result.linesOfCode <= 8, "Lines of code was ${result.linesOfCode}, expected <= 8")
    }

    @Test
    fun `analyzeFile should handle parsing errors gracefully`() = runBlocking {
        // Given
        val invalidKotlinContent = """
            class InvalidClass {
                fun method( {
                    // Missing closing parenthesis and other syntax errors
                    if (true {
                        println("broken"
                    }
                }
            // Missing closing brace
        """.trimIndent()

        val testFile = tempDir.resolve("InvalidClass.kt")
        Files.write(testFile, invalidKotlinContent.toByteArray())

        val codeFile = CodeFile(
            id = UUID.randomUUID(),
            repositoryId = UUID.randomUUID(),
            path = "InvalidClass.kt",
            language = "Kotlin",
            size = invalidKotlinContent.length.toLong(),
            linesOfCode = 0,
            complexity = 0.0,
            lastModified = LocalDateTime.now()
        )

        // When
        val result = kotlinAnalyzer.analyzeFile(testFile, codeFile)

        // Then
        // Should still count lines and provide basic complexity
        assertTrue(result.linesOfCode > 0)
        assertEquals(1.0, result.complexity, 0.1) // Basic complexity for unparseable files
        assertTrue(result.dependencies.isEmpty()) // No dependencies extracted from broken code
    }

    @Test
    fun `countLinesOfCode should exclude comments and empty lines`() {
        // Given
        val analyzer = KotlinAnalyzer()
        val content = """
            // Comment line
            
            package com.example // Inline comment
            
            /*
             * Multi-line comment
             */
            
            class Test {
                fun method() {
                    println("code")
                }
            }
            
        """.trimIndent()

        // When
        val method = analyzer.javaClass.getDeclaredMethod("countLinesOfCode", String::class.java)
        method.isAccessible = true
        val lineCount = method.invoke(analyzer, content) as Int

        // Then
        // Should count: package, class, fun, println, closing braces = ~5 lines
        assertTrue(lineCount >= 4, "Line count was $lineCount, expected >= 4")
        assertTrue(lineCount <= 6, "Line count was $lineCount, expected <= 6")
    }
}