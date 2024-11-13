package builds.apiReferences.kotlinx.io

import builds.apiReferences.templates.PrepareDokkaTemplate
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxIOPrepareDokkaTemplates: BuildType({
  name = "Prepare dokka templates for kotlinx-io"
  templates(PrepareDokkaTemplate)
})
