package builds.apiReferences.kgp

import builds.apiReferences.dependsOnDokkaPagesJson
import builds.apiReferences.templates.BuildApiReferenceSearchIndex
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinGradlePluginBuildSearchIndex: BuildType({
  name = "Build search index for Kotlin Gradle Plugin"

  templates(BuildApiReferenceSearchIndex)

  params {
    param("env.ALGOLIA_INDEX_NAME", "kotlin-gradle-plugin")
    param("env.API_REFERENCE_URL", "/api/kotlin-gradle-plugin")
  }

  dependencies {
    dependsOnDokkaPagesJson(KotlinGradlePluginBuildApiReference)
  }
})
