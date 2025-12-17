resource "aws_apprunner_auto_scaling_configuration_version" "app" {
  auto_scaling_configuration_name = "${var.service_name}-autoscaling"

  max_concurrency = 100
  max_size        = 1
  min_size        = 1
}

resource "aws_apprunner_connection" "app" {
  connection_name = "GitHubConnection"
  provider_type   = "GITHUB"
}

resource "aws_apprunner_service" "app" {
  service_name = var.service_name

  source_configuration {
    authentication_configuration {
      connection_arn = aws_apprunner_connection.app.arn
    }
    code_repository {
      source_code_version {
        type  = "BRANCH"
        value = "main"
      }
      repository_url = "https://github.com/89netraM/turtle-graphics"

      code_configuration {
        configuration_source = "API"
        code_configuration_values {
          runtime                       = "NODEJS_22"
          build_command                 = "npm ci && npm run build"
          start_command                 = "node build"
          port                          = 3000
          runtime_environment_variables = var.environment_variables
        }
      }
    }
  }

  auto_scaling_configuration_arn = aws_apprunner_auto_scaling_configuration_version.app.arn

  instance_configuration {
    cpu    = "1024"
    memory = "2048"
  }

  network_configuration {
    egress_configuration {
      egress_type = "DEFAULT"
    }
  }
}

resource "aws_apprunner_custom_domain_association" "app" {
  domain_name = var.custom_domain
  service_arn = aws_apprunner_service.app.arn
}
