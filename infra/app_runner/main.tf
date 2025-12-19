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

# IAM role for App Runner instance to access DynamoDB
resource "aws_iam_role" "instance_role" {
  name = "${var.service_name}-instance-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "tasks.apprunner.amazonaws.com"
        }
      }
    ]
  })
}

resource "aws_iam_role_policy" "dynamodb_access" {
  name = "${var.service_name}-dynamodb-policy"
  role = aws_iam_role.instance_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "dynamodb:GetItem",
          "dynamodb:PutItem",
          "dynamodb:UpdateItem",
          "dynamodb:DeleteItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = var.dynamodb_table_arn
      }
    ]
  })
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
    cpu               = "1024"
    memory            = "2048"
    instance_role_arn = aws_iam_role.instance_role.arn
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
