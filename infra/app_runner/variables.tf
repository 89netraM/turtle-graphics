variable "service_name" {
  type        = string
  description = "Name of the App Runner service"
}

variable "environment_variables" {
  type        = map(string)
  description = "Environment variables for the app"
  default     = {}
}

variable "custom_domain" {
  type        = string
  description = "Custom domain name for the App Runner service"
}

variable "dynamodb_table_arn" {
  type        = string
  description = "ARN of the DynamoDB table for app settings"
}
