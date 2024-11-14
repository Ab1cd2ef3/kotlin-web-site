package builds.apiReferences.stdlib

import BuildParams.KOTLIN_CORE_API_BUILD_ID
import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.buildSteps.script

object BuildStdlibApiReference : BuildType({
  name = "Core API reference"

  artifactRules = """
      +:content/** => latest-version.zip
      +:pages.json => ./
  """.trimIndent()

  steps {
      script {
          name = "Drop unnecessary files"
          // language=bash
          scriptContent = """
              ls -la ./
              ls -la ./content/
              ls -la ./content/all-libs/

              rm ./content/all-libs/not-found-version.html
              
              # empty pages.json
              mv ./content/all-libs/scripts/pages.json ./
              echo "[]" > ./content/all-libs/scripts/pages.json
          """.trimIndent()
      }
  }

  dependencies {
      dependency(AbsoluteId(KOTLIN_CORE_API_BUILD_ID)) {
          artifacts {
              buildRule = tag(tag = "publish", branch = """
                  +:<default>
                  +:*
              """.trimIndent())
              cleanDestination = true
              artifactRules = "+:latest-version.zip!** => content/"
          }
    }
  }
})
