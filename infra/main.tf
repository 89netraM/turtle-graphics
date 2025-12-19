provider "aws" {
  region = var.aws_region
}

provider "cloudflare" {}

module "dynamodb" {
  source     = "./dynamodb"
  table_name = "${var.app_runner_service_name}-settings"
}

module "app_runner" {
  source             = "./app_runner"
  service_name       = var.app_runner_service_name
  custom_domain      = var.domain_name
  dynamodb_table_arn = module.dynamodb.table_arn

  environment_variables = {
    ORIGIN              = "https://${var.domain_name}"
    PASSWORD            = var.admin_password
    DYNAMODB_TABLE_NAME = module.dynamodb.table_name
  }
}

module "domain" {
  source                        = "./domain"
  dns_zone_id                   = var.cloudflare_dns_zone_id
  domain_name                   = var.domain_name
  app_runner_domain             = module.app_runner.service_domain
  app_runner_validation_records = module.app_runner.service_validation_records
}
