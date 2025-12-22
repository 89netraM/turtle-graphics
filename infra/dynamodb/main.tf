resource "aws_dynamodb_table" "settings" {
  name         = var.table_name
  billing_mode = "PAY_PER_REQUEST"
  hash_key     = "PK"
  range_key    = "SK"

  attribute {
    name = "PK"
    type = "S"
  }

  attribute {
    name = "SK"
    type = "S"
  }

  attribute {
    name = "GSI1PK"
    type = "S"
  }

  attribute {
    name = "GSI1SK"
    type = "S"
  }

  global_secondary_index {
    name            = "GSI1"
    hash_key        = "GSI1PK"
    range_key       = "GSI1SK"
    projection_type = "ALL"
  }

  tags = {
    Name        = "${var.table_name}"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

output "table_name" {
  value       = aws_dynamodb_table.settings.name
  description = "The name of the DynamoDB table"
}

output "table_arn" {
  value       = aws_dynamodb_table.settings.arn
  description = "The ARN of the DynamoDB table"
}
