terraform {
  backend "s3" {
    key          = "terraform.tfstate"
    region       = "eu-north-1"
    bucket       = "turtle-graphics-terraform-state"
    use_lockfile = true
  }

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
    cloudflare = {
      source  = "cloudflare/cloudflare"
      version = "~> 5.0"
    }
  }
}
