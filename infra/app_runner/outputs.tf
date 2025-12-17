output "service_domain" {
  description = "Domain of the App Runner service"
  value       = aws_apprunner_service.app.service_url
}

output "service_validation_records" {
  description = "DNS validation records of the App Runner service"
  value = {
    for record in aws_apprunner_custom_domain_association.app.certificate_validation_records :
    record.name => {
      type    = record.type
      content = record.value
    }
  }
}
