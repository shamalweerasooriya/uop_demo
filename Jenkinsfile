pipeline {
    agent any

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
            steps {
                sh 'corepack enable && corepack prepare pnpm@latest --activate'
                sh 'pnpm install --frozen-lockfile'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }

        stage('Test') {
            steps {
                sh 'pnpm test'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Deploy') {
            steps {
                sh 'docker stop uop-demo || true'
                sh 'docker rm uop-demo || true'
                sh "docker run -d --name uop-demo -p 3001:80 --restart unless-stopped ${IMAGE_NAME}:${IMAGE_TAG}"
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
            echo "Pipeline succeeded — ${IMAGE_NAME}:${IMAGE_TAG} deployed."
        }
    }
}
