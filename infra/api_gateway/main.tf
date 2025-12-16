resource "aws_apigatewayv2_api" "proxy" {
  name          = "SvelteKit_API"
  protocol_type = "HTTP"
}

resource "aws_cloudwatch_log_group" "proxy" {
  name              = "/aws/api_gw/${aws_apigatewayv2_api.proxy.name}"
  retention_in_days = 1
}

resource "aws_apigatewayv2_stage" "lambda" {
  api_id      = aws_apigatewayv2_api.proxy.id
  name        = "SvelteKit_API_Stage"
  auto_deploy = true

  access_log_settings {
    destination_arn = aws_cloudwatch_log_group.proxy.arn
    format = jsonencode({
      requestId               = "$context.requestId"
      sourceIp                = "$context.identity.sourceIp"
      requestTime             = "$context.requestTime"
      protocol                = "$context.protocol"
      httpMethod              = "$context.httpMethod"
      resourcePath            = "$context.resourcePath"
      routeKey                = "$context.routeKey"
      status                  = "$context.status"
      responseLength          = "$context.responseLength"
      integrationErrorMessage = "$context.integrationErrorMessage"
    })
  }
}

resource "aws_apigatewayv2_integration" "proxy" {
  api_id             = aws_apigatewayv2_api.proxy.id
  integration_uri    = var.lambda_invoke_arn
  integration_type   = "AWS_PROXY"
  integration_method = "POST"
}

resource "aws_apigatewayv2_route" "proxy" {
  api_id    = aws_apigatewayv2_api.proxy.id
  route_key = "$default"
  target    = "integrations/${aws_apigatewayv2_integration.proxy.id}"
}

resource "aws_apigatewayv2_integration" "s3" {
  api_id                 = aws_apigatewayv2_api.proxy.id
  integration_type       = "HTTP_PROXY"
  integration_uri        = "http://${var.s3_bucket_regional_domain_name}/{proxy}"
  integration_method     = "GET"
  payload_format_version = "1.0"

  request_parameters = {
    "overwrite:path" = "$request.path"
  }
}

resource "aws_apigatewayv2_route" "s3" {
  api_id    = aws_apigatewayv2_api.proxy.id
  route_key = "GET /_app/{proxy+}"
  target    = "integrations/${aws_apigatewayv2_integration.s3.id}"
}

resource "aws_lambda_permission" "proxy" {
  statement_id  = "AllowExecutionFromAPIGateway"
  action        = "lambda:InvokeFunction"
  function_name = var.lambda_name
  qualifier     = var.lambda_qualifier
  principal     = "apigateway.amazonaws.com"
  source_arn    = "${aws_apigatewayv2_api.proxy.execution_arn}/*/*"
}

resource "aws_apigatewayv2_domain_name" "api" {
  domain_name = var.domain_name

  domain_name_configuration {
    certificate_arn = aws_acm_certificate.proxy.arn
    endpoint_type   = "REGIONAL"
    security_policy = "TLS_1_2"
  }
}

resource "aws_apigatewayv2_api_mapping" "api" {
  api_id      = aws_apigatewayv2_api.proxy.id
  domain_name = aws_apigatewayv2_domain_name.api.id
  stage       = aws_apigatewayv2_stage.lambda.id
}

resource "cloudflare_dns_record" "caa_record" {
  zone_id = var.cloudflare_dns_zone_id
  name    = var.domain_name
  ttl     = 1 # Automatic
  type    = "CAA"
  proxied = false
  data = {
    flags = 0
    tag   = "issue"
    value = "amazonaws.com"
  }
}

resource "aws_acm_certificate" "proxy" {
  domain_name       = var.domain_name
  validation_method = "DNS"

  lifecycle {
    create_before_destroy = true
  }
  depends_on = [
    cloudflare_dns_record.caa_record
  ]
}

resource "cloudflare_dns_record" "cert_validation" {
  count = length(aws_acm_certificate.proxy.domain_validation_options)

  zone_id = var.cloudflare_dns_zone_id
  name    = trimsuffix(one(aws_acm_certificate.proxy.domain_validation_options).resource_record_name, ".")
  content = trimsuffix(one(aws_acm_certificate.proxy.domain_validation_options).resource_record_value, ".")
  type    = one(aws_acm_certificate.proxy.domain_validation_options).resource_record_type
  ttl     = 1 # Automatic
  proxied = false
}
