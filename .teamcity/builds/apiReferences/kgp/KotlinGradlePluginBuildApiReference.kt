package builds.apiReferences.kgp

import builds.apiReferences.dependsOnDokkaTemplate
import builds.apiReferences.templates.BuildApiReference
import builds.apiReferences.templates.buildDokkaHTML
import builds.apiReferences.templates.scriptDropSnapshot
import builds.apiReferences.templates.vcsDefaultTrigger
import builds.apiReferences.vcsRoots.KotlinKGP
import jetbrains.buildServer.configs.kotlin.BuildType
import jetbrains.buildServer.configs.kotlin.buildSteps.script

private const val KGP_API_OUTPUT_DIR = "libraries/tools/gradle/documentation/build/documentation/kotlinlang"
private const val KGP_API_TEMPLATES_DIR = "build/api-reference/templates"

object KotlinGradlePluginBuildApiReference : BuildType({
    name = "Kotlin Gradle Plugin API reference"

    templates(BuildApiReference)

    artifactRules = "${KGP_API_OUTPUT_DIR}/** => pages.zip"

    params {
        param("release.tag", BuildParams.KOTLIN_RELEASE_TAG)
    }

    triggers {
        vcsDefaultTrigger {
            enabled = false
        }
    }

    vcs {
        root(KotlinKGP)
    }

    steps {
        scriptDropSnapshot {
            enabled = false
        }
        buildDokkaHTML {
            enabled = false
        }
        script {
            name = "build api reference"
            scriptContent = """
                #!/bin/bash
                
                 set -e -u
                
                ./gradlew :gradle:documentation:dokkaKotlinlangDocumentation -PdeployVersion=${BuildParams.KOTLIN_RELEASE_TAG.removePrefix("v")} --no-daemon --no-configuration-cache
            """.trimIndent()
        }
    }

    dependencies {
       dependsOnDokkaTemplate(KotlinGradlePluginPrepareDokkaTemplates, KGP_API_TEMPLATES_DIR)
    }
})