plugins {
    kotlin("jvm")
    kotlin("plugin.serialization")
    id("io.ktor.plugin")
}
repositories {
    mavenCentral()
    mavenLocal()
}

dependencies {
    // OpenAI Kotlin SDK
    implementation("com.aallam.openai:openai-client:3.6.2")

    // Ktor client - required by openai-client
    implementation("io.ktor:ktor-client-core:2.3.7")
    implementation("io.ktor:ktor-client-cio:2.3.7")
    implementation("io.ktor:ktor-client-content-negotiation:2.3.7")
    implementation("io.ktor:ktor-serialization-kotlinx-json:2.3.7")

    // Kotlinx serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    // Kotlinx coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-core:1.7.3")

    // exposed ORM
    implementation("org.jetbrains.exposed:exposed-jdbc:0.50.1")
    implementation("org.jetbrains.exposed:exposed-java-time:0.50.1")
    implementation("org.jetbrains.exposed:exposed-json:0.50.1")
    implementation("org.jetbrains.exposed:exposed-postgresql:0.50.1")

    // PostgreSQL driver
    implementation("org.postgresql:postgresql:42.7.3")
}