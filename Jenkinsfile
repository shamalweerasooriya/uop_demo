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

        stage('Test') {
            steps {
                sh 'pnpm test -- --ci --reporters=default'
            }
        }

        stage('Build') {
            steps {
                sh 'pnpm build'
            }
        }

        stage('Docker Build') {
            steps {
                sh "docker build -t ${IMAGE_NAME}:${IMAGE_TAG} -t ${IMAGE_NAME}:latest ."
            }
        }

        stage('Deploy') {
            when {
                branch 'main'
            }
            steps {
                sh 'docker compose down || true'
                sh "IMAGE_TAG=${IMAGE_TAG} docker compose up -d"
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
