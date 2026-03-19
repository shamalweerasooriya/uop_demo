pipeline {
    agent any

    parameters {
        choice(name: 'ACTION', choices: ['deploy', 'rollback'], description: 'Deploy a new build or rollback to a previous one')
        string(name: 'ROLLBACK_TAG', defaultValue: '', description: 'Image tag (build number) to rollback to. Only used when ACTION = rollback.')
    }

    triggers {
        pollSCM('H/5 * * * *')
    }

    tools {
        nodejs 'NodeJS-20'
    }

    environment {
        PNPM_HOME    = "${WORKSPACE}/.pnpm-store"
        IMAGE_NAME   = 'uop-demo'
        IMAGE_TAG    = "${env.BUILD_NUMBER}"
    }

    stages {
        stage('Install') {
            when { expression { params.ACTION == 'deploy' } }
            steps {
                sh 'corepack enable && corepack prepare pnpm@latest --activate'
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Build') {
            when { expression { params.ACTION == 'deploy' } }
            steps {
                sh 'pnpm build'
            }
        }

        stage('Test') {
            when { expression { params.ACTION == 'deploy' } }
            steps {
                sh 'pnpm test'
            }
        }

        stage('Docker Build') {
            when { expression { params.ACTION == 'deploy' } }
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Approval') {
            options {
                timeout(time: 30, unit: 'MINUTES')
            }
            steps {
                script {
                    def action = params.ACTION == 'rollback'
                        ? "rollback to ${IMAGE_NAME}:${params.ROLLBACK_TAG}"
                        : "deploy ${IMAGE_NAME}:${IMAGE_TAG}"
                    input message: "Approve ${action}?", ok: 'Approve'
                }
            }
        }

        stage('Deploy') {
            when { expression { params.ACTION == 'deploy' } }
            steps {
                sh 'docker stop uop-demo || true'
                sh 'docker rm uop-demo || true'
                sh "docker run -d --name uop-demo -p 3001:80 --restart unless-stopped ${IMAGE_NAME}:${IMAGE_TAG}"
            }
        }

        stage('Rollback') {
            when { expression { params.ACTION == 'rollback' } }
            steps {
                script {
                    if (!params.ROLLBACK_TAG?.trim()) {
                        error 'ROLLBACK_TAG is required for rollback action'
                    }
                    def tagExists = sh(
                        script: "docker image inspect ${IMAGE_NAME}:${params.ROLLBACK_TAG} > /dev/null 2>&1",
                        returnStatus: true
                    ) == 0
                    if (!tagExists) {
                        error "Image ${IMAGE_NAME}:${params.ROLLBACK_TAG} not found"
                    }
                }
                sh 'docker stop uop-demo || true'
                sh 'docker rm uop-demo || true'
                sh "docker run -d --name uop-demo -p 3001:80 --restart unless-stopped ${IMAGE_NAME}:${params.ROLLBACK_TAG}"
            }
        }
    }

    post {
        always {
            cleanWs()
        }
        failure {
            echo 'Pipeline failed — check the logs above for details.'
        }
        success {
            script {
                if (params.ACTION == 'rollback') {
                    echo "Rolled back to ${IMAGE_NAME}:${params.ROLLBACK_TAG}"
                } else {
                    echo "Deployed ${IMAGE_NAME}:${IMAGE_TAG}"
                }
            }
        }
    }
}
