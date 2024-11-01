package builds.apiReferences.kgp

import builds.apiReferences.templates.PrepareDokkaTemplate
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinGradlePluginPrepareDokkaTemplates: BuildType({
  name = "Prepare dokka templates for Kotlin Gradle Plugin"

  templates(PrepareDokkaTemplate)

  params {
    param("env.ALGOLIA_INDEX_NAME", "kotlin-gradle-plugin")
  }
})
