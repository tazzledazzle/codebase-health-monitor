rootProject.name = "kotlin-compiler-plugin"

pluginManagement {
    repositories {
        gradlePluginPortal()
        mavenCentral()
    }
}

include("frontend", "backend")