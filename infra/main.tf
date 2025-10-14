provider "aws" {
  region = var.aws_region
}

provider "cloudflare" {}

module "lambda" {
  source      = "./lambda"
  domain_name = var.domain_name
}

module "api_gateway" {
  source                 = "./api_gateway"
  lambda_invoke_arn      = module.lambda.lambda_invoke_arn
  lambda_name            = module.lambda.lambda_name
  lambda_qualifier       = module.lambda.lambda_qualifier
  domain_name            = var.domain_name
  cloudflare_dns_zone_id = var.cloudflare_dns_zone_id
}

module "domain" {
  source             = "./domain"
  dns_zone_id        = var.cloudflare_dns_zone_id
  domain_name        = var.domain_name
  api_gateway_domain = module.api_gateway.api_domain_target
}
