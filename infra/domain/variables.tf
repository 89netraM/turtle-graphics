variable "domain_name" {
  type        = string
  description = "Domain name for website"
}

variable "dns_zone_id" {
  type        = string
  description = "DNS zone ID from Cloudflare"
}

variable "api_gateway_domain" {
  type        = string
  description = "Internal AWS domain name for resources"
}
