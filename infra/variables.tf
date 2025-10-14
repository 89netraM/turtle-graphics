variable "aws_region" {
  type = string
}

variable "domain_name" {
  type        = string
  description = "Domain name for website"
}

variable "cloudflare_dns_zone_id" {
  type        = string
  description = "Zone ID from Cloudflare"
}

variable "admin_password" {
  type        = string
  description = "The password used for the admin page"
}
