variable "lambda_invoke_arn" {
  type = string
}

variable "lambda_name" {
  type = string
}

variable "lambda_qualifier" {
  type = string
}

variable "cloudflare_dns_zone_id" {
  type = string
}

variable "domain_name" {
  type = string
}

variable "s3_bucket_regional_domain_name" {
  type        = string
  description = "Regional domain name of the S3 bucket for static assets"
}
