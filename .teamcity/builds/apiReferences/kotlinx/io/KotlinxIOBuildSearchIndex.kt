package builds.apiReferences.kotlinx.io

import BuildParams.KOTLINX_IO_ID
import builds.apiReferences.templates.BuildApiReferenceSearchIndex
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxIOBuildSearchIndex : BuildType({
    name = "$KOTLINX_IO_ID search"
    description = "Build search index for Kotlinx IO"

    templates(BuildApiReferenceSearchIndex)

    params {
        param("env.ALGOLIA_INDEX_NAME", "$KOTLINX_IO_ID-stage")
    }

    dependencies {
        dependency(KotlinxIOBuildApiReference) {
            snapshot {}
            artifacts {
                artifactRules = """
                    pages.zip!** => dist/api/$KOTLINX_IO_ID/
                """.trimIndent()
                cleanDestination = true
            }
        }
    }
})
