variable "domain_name" {
  type        = string
  description = "Domain name for website"
}

variable "dns_zone_id" {
  type        = string
  description = "DNS zone ID from Cloudflare"
}

variable "app_runner_domain" {
  type        = string
  description = "App Runner service domain"
}

variable "app_runner_validation_records" {
  type = map(object({
    type    = string
    content = string
  }))
  description = "DNS validation records for App Runner custom domain"
  default     = {}
}
