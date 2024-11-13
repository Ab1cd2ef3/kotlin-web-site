package builds.apiReferences.kotlinx.coroutines

import builds.apiReferences.templates.PrepareDokkaTemplate
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxCoroutinesPrepareDokkaTemplates: BuildType({
  name = "Prepare dokka templates for kotlinx.coroutines"
  templates(PrepareDokkaTemplate)
})
