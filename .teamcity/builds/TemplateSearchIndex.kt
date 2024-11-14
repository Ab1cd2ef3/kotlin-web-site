package builds

import BuildParams.SEARCH_APP_ID
import builds.kotlinlang.buidTypes.PageViews
import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.buildSteps.script
import vcsRoots.KotlinLangOrg

open class TemplateSearchIndex(init: BuildType.() -> Unit) : BuildType({
    artifactRules = """
        search-report/** => search-report.zip
    """.trimIndent()

    requirements {
        doesNotContain("docker.server.osType", "windows")
    }

    params {
        param("env.NODE_OPTIONS", "--max-old-space-size=32768")

        param("env.WH_SEARCH_USER", SEARCH_APP_ID)
        param("env.WH_SEARCH_WRITE_KEY", "%ALGOLIA_WRITE_API_KEY%")
    }

    vcs {
        root(
            KotlinLangOrg, """
                scripts/doindex
            """.trimIndent()
        )
        cleanCheckout = true
        showDependenciesChanges = true
    }

    steps {
        script {
            name = "Build and push search index"
            //language=bash
            scriptContent = """
                #!/bin/sh
                set -e
                npm install
                node index.mjs
            """.trimIndent()
            dockerImage = "node:22-alpine"
            workingDir = "scripts/doindex/"
            dockerPull = true
        }
    }

    dependencies {
        dependency(PageViews) {
            snapshot {}
            artifacts {
                artifactRules = """
                    page_views_map.json => data/
                """.trimIndent()
            }
        }
    }

    init()
})
