# DNS record pointing to App Runner service
resource "cloudflare_dns_record" "app_runner" {
  zone_id = var.dns_zone_id
  name    = var.domain_name
  ttl     = 1 # Automatic
  type    = "CNAME"
  content = var.app_runner_domain
  proxied = false
}

resource "cloudflare_dns_record" "app_runner_validation" {
  for_each = var.app_runner_validation_records
  zone_id  = var.dns_zone_id
  name     = trimsuffix(each.key, ".")
  ttl      = 1
  type     = each.value.type
  content  = each.value.content
  proxied  = false
}
