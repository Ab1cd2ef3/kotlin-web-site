package builds.apiReferences.kotlinx.coroutines

import BuildParams.KOTLINX_COROUTINES_ID
import builds.apiReferences.templates.BuildApiReferenceSearchIndex
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxCoroutinesBuildSearchIndex : BuildType({
    name = "$KOTLINX_COROUTINES_ID search"
    description = "Build search index for Kotlinx Coroutines"

    templates(BuildApiReferenceSearchIndex)

    params {
        param("env.ALGOLIA_INDEX_NAME", "$KOTLINX_COROUTINES_ID-stage")
    }

    dependencies {
        dependency(KotlinxCoroutinesBuildApiReference) {
            snapshot {}
            artifacts {
                artifactRules = """
                    pages.zip!** => dist/api/$KOTLINX_COROUTINES_ID/
                """.trimIndent()
                cleanDestination = true
            }
        }
    }
})
