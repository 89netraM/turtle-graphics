resource "aws_s3_bucket" "challenge_images" {
  bucket = var.bucket_name

  tags = {
    Name        = "${var.bucket_name}"
    Environment = "production"
    ManagedBy   = "Terraform"
  }
}

resource "aws_s3_bucket_public_access_block" "challenge_images" {
  bucket = aws_s3_bucket.challenge_images.id

  block_public_acls       = false
  block_public_policy     = false
  ignore_public_acls      = false
  restrict_public_buckets = false
}

resource "aws_s3_bucket_policy" "challenge_images" {
  bucket = aws_s3_bucket.challenge_images.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Sid       = "PublicReadGetObject"
        Effect    = "Allow"
        Principal = "*"
        Action    = "s3:GetObject"
        Resource  = "${aws_s3_bucket.challenge_images.arn}/*"
      }
    ]
  })

  depends_on = [aws_s3_bucket_public_access_block.challenge_images]
}

resource "aws_s3_bucket_cors_configuration" "challenge_images" {
  bucket = aws_s3_bucket.challenge_images.id

  cors_rule {
    allowed_headers = ["*"]
    allowed_methods = ["GET", "HEAD"]
    allowed_origins = ["*"]
    expose_headers  = ["ETag"]
    max_age_seconds = 3000
  }
}

output "bucket_name" {
  value       = aws_s3_bucket.challenge_images.bucket
  description = "The name of the S3 bucket"
}

output "bucket_arn" {
  value       = aws_s3_bucket.challenge_images.arn
  description = "The ARN of the S3 bucket"
}

output "bucket_domain_name" {
  value       = aws_s3_bucket.challenge_images.bucket_domain_name
  description = "The bucket domain name"
}
