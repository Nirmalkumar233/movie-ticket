pipeline {
    agent any

    tools {
        maven 'Maven-3.9.x'
        jdk 'JDK-17'
    }

    stages {
        stage('Checkout Code') {
            steps {
                checkout scm
            }
        }

        stage('Build Parent & Modules') {
            steps {
                sh 'mvn clean package'
            }
        }

        stage('Archive Build Artifacts') {
            steps {
                archiveArtifacts artifacts: '**/target/*.jar, **/target/*.war', fingerprint: true
            }
        }
    }

    post {
        success {
            echo 'Movie Ticketing System built successfully and ready for deployment!'
        }
        failure {
            echo 'Pipeline encountered an error during build or testing.'
        }
    }
}
