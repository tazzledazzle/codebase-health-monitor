val ktor_version: String by project
val kotlin_version: String by project
val logback_version: String by project
val exposed_version: String by project
val postgresql_version: String by project

plugins {
    kotlin("jvm") version "1.9.22"
    kotlin("plugin.serialization") version "1.9.22"
    id("io.ktor.plugin") version "2.3.8"
}

group = "com.codehealthexplorer"
version = "0.1.0"

application {
    mainClass.set("com.codehealthexplorer.ApplicationKt")
}

repositories {
    mavenCentral()
}
val lettuce_version="6.2.6.RELEASE"
val jgit_version="6.8.0.202311291450-r"
val openai_client_version="3.7.0"
val sentry_version="7.3.0"
val jedis_version="4.3.2"

dependencies {
    // Ktor server
    implementation("io.ktor:ktor-server-core:$ktor_version")
    implementation("io.ktor:ktor-server-netty:$ktor_version")
    implementation("io.ktor:ktor-server-content-negotiation:$ktor_version")
    implementation("io.ktor:ktor-serialization-kotlinx-json:$ktor_version")
    implementation("io.ktor:ktor-server-cors:$ktor_version")
    implementation("io.ktor:ktor-server-auth:$ktor_version")
    implementation("io.ktor:ktor-server-auth-jwt:$ktor_version")

    // Redis
    implementation("io.lettuce:lettuce-core:$lettuce_version")
    implementation("redis.clients:jedis:$jedis_version")

    // JGit
    implementation("org.eclipse.jgit:org.eclipse.jgit:$jgit_version")

    //OpenAI/LLM Client
    implementation("com.aallam.openai:openai-client:$openai_client_version")

    // Sentry SDK
    implementation("io.sentry:sentry:$sentry_version")
    implementation("io.sentry:sentry-kotlin-extensions:$sentry_version")
//    implementation("io.sentry:sentry-kotlin-logging:$sentry_version")

    // Kotlin Embeddable Components
    implementation("org.jetbrains.kotlin:kotlin-compiler-embeddable:$kotlin_version")

    // Database
    implementation("org.jetbrains.exposed:exposed-core:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-dao:$exposed_version")
    implementation("org.jetbrains.exposed:exposed-jdbc:$exposed_version")
    implementation("org.postgresql:postgresql:$postgresql_version")
    
    // Logging
    implementation("ch.qos.logback:logback-classic:$logback_version")
    
    // Testing
    testImplementation("io.ktor:ktor-server-test-host:$ktor_version")
    testImplementation("org.jetbrains.kotlin:kotlin-test:$kotlin_version")
    testImplementation("io.mockk:mockk:1.13.8")
}

tasks.withType<Test> {
    useJUnitPlatform()
}