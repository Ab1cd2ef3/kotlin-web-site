package builds.apiReferences.kotlinx.datetime

import BuildParams.KOTLINX_DATETIME_ID
import builds.apiReferences.templates.BuildApiReferenceSearchIndex
import jetbrains.buildServer.configs.kotlin.BuildType

object KotlinxDatetimeBuildSearchIndex : BuildType({
    name = "$KOTLINX_DATETIME_ID search"
    description = "Build search index for Kotlinx Datetime"

    templates(BuildApiReferenceSearchIndex)

    params {
        param("env.ALGOLIA_INDEX_NAME", "$KOTLINX_DATETIME_ID-stage")
    }

    dependencies {
        dependency(KotlinxDatetimeBuildApiReference) {
            snapshot {}
            artifacts {
                artifactRules = """
                    pages.zip!** => dist/api/$KOTLINX_DATETIME_ID/
                """.trimIndent()
                cleanDestination = true
            }
        }
    }
})
