package builds.apiReferences.kotlinx.metadataJvm

import builds.apiReferences.templates.PrepareDokkaTemplate
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxMetadataJvmPrepareDokkaTemplates: BuildType({
  name = "Prepare dokka templates for kotlinx-metadata-jvm"
  templates(PrepareDokkaTemplate)
})
