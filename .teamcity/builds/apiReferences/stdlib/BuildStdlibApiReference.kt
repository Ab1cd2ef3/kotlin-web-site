package builds.apiReferences.stdlib

import BuildParams.KOTLIN_CORE_API_BUILD_ID
import jetbrains.buildServer.configs.kotlin.*
import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.buildSteps.script

object BuildStdlibApiReference : BuildType({
  name = "Core API reference"

  artifactRules = """
      +:dist/api/core/** => latest-version.zip!all-libs/
      +:pages.json => ./
  """.trimIndent()

  steps {
      script {
          name = "Drop unnecessary files"
          // language=bash
          scriptContent = """
              rm ./dist/api/core/not-found-version.html
              
              # empty pages.json
              mv ./dist/api/core/scripts/pages.json ./
              echo "[]" > ./dist/api/core/scripts/pages.json
          """.trimIndent()
      }
      script {
          name = "Add no robots for older versions"
          workingDir = "dist/"
          //language=bash
          scriptContent = """
#!/bin/sh
set -x
find . -type f -path "*/api/*/older/*.html" -exec sed -i -E 's/(<head[^>]*>)/\1<meta name="robots" content="noindex, nofollow">/g' {} \;
          """.trimIndent()
          dockerImage = "alpine"
      }
  }

  dependencies {
      dependency(AbsoluteId(KOTLIN_CORE_API_BUILD_ID)) {
          artifacts {
              buildRule = lastSuccessful()
              cleanDestination = true
              artifactRules = "latest-version.zip!all-libs/** => dist/api/core/"
          }
    }
  }
})
