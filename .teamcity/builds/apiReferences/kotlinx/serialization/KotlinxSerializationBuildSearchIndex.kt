package builds.apiReferences.kotlinx.serialization

import BuildParams.KOTLINX_SERIALIZATION_ID
import builds.apiReferences.templates.BuildApiReferenceSearchIndex
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxSerializationBuildSearchIndex : BuildType({
    name = "$KOTLINX_SERIALIZATION_ID search"
    description = "Build search index for Kotlinx Serialization"

    templates(BuildApiReferenceSearchIndex)

    params {
        param("env.ALGOLIA_INDEX_NAME", "$KOTLINX_SERIALIZATION_ID-stage")
    }

    dependencies {
        dependency(KotlinxSerializationBuildApiReference) {
            snapshot {}
            artifacts {
                artifactRules = """
                    pages.zip!** => dist/api/$KOTLINX_SERIALIZATION_ID/
                """.trimIndent()
                cleanDestination = true
            }
        }
    }
})