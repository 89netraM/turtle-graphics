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
