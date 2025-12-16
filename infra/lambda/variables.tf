variable "domain_name" {
  type        = string
  description = "Domain name for website"
}

variable "admin_password" {
  type        = string
  description = "The password used for the admin page"
}

variable "s3_bucket_name" {
  type        = string
  description = "Name of the S3 bucket for static assets"
}
