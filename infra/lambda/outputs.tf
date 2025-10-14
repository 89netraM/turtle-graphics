output "lambda_name" {
  value = aws_lambda_function.lambda.function_name
}

output "lambda_qualifier" {
  value = aws_lambda_function.lambda.version
}

output "lambda_invoke_arn" {
  value = aws_lambda_function.lambda.qualified_invoke_arn
}
