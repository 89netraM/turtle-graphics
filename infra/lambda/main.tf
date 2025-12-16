resource "aws_lambda_function" "lambda" {
  function_name    = "svelte_lambda_function"
  role             = aws_iam_role.lambda_execution_role.arn
  handler          = "index.handler"
  filename         = data.archive_file.lambda.output_path
  source_code_hash = data.archive_file.lambda.output_base64sha256
  runtime          = "nodejs24.x"
  architectures    = ["arm64"]
  publish          = true
  logging_config {
    log_format            = "JSON"
    application_log_level = "INFO"
    system_log_level      = "WARN"
  }
  environment {
    variables = {
      ORIGIN   = var.domain_name
      PASSWORD = var.admin_password
    }
  }
}

data "archive_file" "lambda" {
  type        = "zip"
  source_dir  = "${path.module}/../../build/"
  output_path = "${path.module}/lambda.zip"
  excludes = [
    "client/_app"
  ]
}

resource "aws_iam_role" "lambda_execution_role" {
  name               = "lambda_execution_role"
  assume_role_policy = data.aws_iam_policy_document.assume_role.json
}

data "aws_iam_policy_document" "assume_role" {
  statement {
    effect = "Allow"
    principals {
      type        = "Service"
      identifiers = ["lambda.amazonaws.com"]
    }
    actions = ["sts:AssumeRole"]
  }
}

resource "aws_iam_role_policy_attachment" "lambda_logs" {
  role       = aws_iam_role.lambda_execution_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

resource "aws_cloudwatch_log_group" "lambda" {
  name              = "/aws/lambda/${aws_lambda_function.lambda.function_name}"
  retention_in_days = 1
}

locals {
  static_files = fileset("${path.module}/../../build/client/_app", "**/*")
}

resource "aws_s3_object" "static_assets" {
  for_each = local.static_files

  bucket = var.s3_bucket_name
  key    = "_app/${each.value}"
  source = "${path.module}/../../build/client/_app/${each.value}"
  etag   = filemd5("${path.module}/../../build/client/_app/${each.value}")
  content_type = lookup(
    {
      "js"    = "application/javascript"
      "css"   = "text/css"
      "json"  = "application/json"
      "svg"   = "image/svg+xml"
      "png"   = "image/png"
      "jpg"   = "image/jpeg"
      "jpeg"  = "image/jpeg"
      "gif"   = "image/gif"
      "woff"  = "font/woff"
      "woff2" = "font/woff2"
      "ttf"   = "font/ttf"
      "eot"   = "application/vnd.ms-fontobject"
      "gz"    = "application/gzip"
      "br"    = "application/x-br"
    },
    reverse(split(".", each.value))[0],
    "application/octet-stream"
  )
  cache_control = "public, max-age=31536000, immutable"
}
