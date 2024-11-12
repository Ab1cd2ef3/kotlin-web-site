package builds.kotlinlang.buidTypes

import BuildParams.SEARCH_APP_ID
import BuildParams.SEARCH_INDEX_NAME
import builds.apiReferences.kotlinx.coroutines.KotlinxCoroutinesBuildApiReference
import builds.apiReferences.kotlinx.datetime.KotlinxDatetimeBuildApiReference
import builds.apiReferences.kotlinx.io.KotlinxIOBuildApiReference
import builds.apiReferences.kotlinx.metadataJvm.KotlinxMetadataJvmBuildApiReference
import builds.apiReferences.kotlinx.serialization.KotlinxSerializationBuildApiReference
import builds.apiReferences.stdlib.BuildStdlibApiReference
import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.buildSteps.ScriptBuildStep
import jetbrains.buildServer.configs.kotlin.buildSteps.script
import jetbrains.buildServer.configs.kotlin.triggers.schedule
import vcsRoots.KotlinLangOrg

object BuildSearchIndex : BuildType({
  name = "Build Site Search Index"
  description = "Build search index for Algolia using Google Analytics data"

  artifactRules = """
      search-report/** => search-report.zip
  """.trimIndent()

  params {
    param("env.WH_INDEX_NAME", SEARCH_INDEX_NAME)
    param("env.WH_SEARCH_USER", SEARCH_APP_ID)
    param("env.WH_SEARCH_WRITE_KEY", "%ALGOLIA_WRITE_API_KEY%")
    param("env.NODE_OPTIONS", "--max-old-space-size=32768")
  }

  vcs {
    root(KotlinLangOrg, """
        scripts/doindex
    """.trimIndent())
    cleanCheckout = true
    showDependenciesChanges = true
  }

  steps {
    script {
      name = "Build and push search index"
      scriptContent = """
        #!/bin/sh
        set -e
        npm install
        node index.mjs
      """.trimIndent()
      dockerImage = "node:22-alpine"
      workingDir = "scripts/doindex/"
      dockerImagePlatform = ScriptBuildStep.ImagePlatform.Linux
      dockerPull = true
    }
  }

  triggers {
    schedule {
      schedulingPolicy = cron {
        hours = "3"
        dayOfMonth = "*/2"
      }
      branchFilter = "+:<default>"
      triggerBuild = always()
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

    dependency(BuildSitePages) {
      snapshot {}
      artifacts {
        artifactRules = "+:pages.zip!** => dist"
        cleanDestination = true
      }
    }
    listOf(
      Pair(BuildStdlibApiReference, "core"),
      Pair(KotlinxCoroutinesBuildApiReference, "kotlinx.coroutines"),
      Pair(KotlinxDatetimeBuildApiReference, "kotlinx-datetime"),
      Pair(KotlinxIOBuildApiReference, "kotlinx-io"),
      Pair(KotlinxMetadataJvmBuildApiReference, "kotlinx-metadata-jvm"),
      Pair(KotlinxSerializationBuildApiReference, "kotlinx.serialization"),
    ).forEach { (build, path) ->
      dependency(build) {
          snapshot {}
          artifacts {
              artifactRules = "+:pages.zip!** => dist/api/$path/"
              cleanDestination = true
          }
      }
    }
  }
})
