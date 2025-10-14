resource "cloudflare_dns_record" "cname_record" {
  zone_id = var.dns_zone_id
  name    = var.domain_name
  ttl     = 1 # Automatic
  type    = "CNAME"
  content = var.api_gateway_domain
  proxied = false
}
