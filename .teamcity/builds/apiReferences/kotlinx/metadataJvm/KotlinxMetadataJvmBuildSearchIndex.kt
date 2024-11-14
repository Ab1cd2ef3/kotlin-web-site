package builds.apiReferences.kotlinx.metadataJvm

import BuildParams.KOTLINX_METADATA_ID
import builds.apiReferences.templates.BuildApiReferenceSearchIndex
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxMetadataJvmBuildSearchIndex : BuildType({
    name = "$KOTLINX_METADATA_ID search"
    description = "Build search index for Kotlinx Metadata JVM"

    templates(BuildApiReferenceSearchIndex)

    params {
        param("env.ALGOLIA_INDEX_NAME", "$KOTLINX_METADATA_ID-stage")
    }

    dependencies {
        dependency(KotlinxMetadataJvmBuildApiReference) {
            snapshot {}
            artifacts {
                artifactRules = """
                    pages.zip!** => dist/api/$KOTLINX_METADATA_ID/
                """.trimIndent()
                cleanDestination = true
            }
        }
    }
})
