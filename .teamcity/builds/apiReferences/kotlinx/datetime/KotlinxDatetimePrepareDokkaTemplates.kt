package builds.apiReferences.kotlinx.datetime

import builds.apiReferences.templates.PrepareDokkaTemplate
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxDatetimePrepareDokkaTemplates: BuildType({
  name = "Prepare dokka templates for kotlinx-datetime"
  templates(PrepareDokkaTemplate)
})
