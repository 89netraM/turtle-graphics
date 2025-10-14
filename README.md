# Turtle Code

## Infra

This project uses [Terraform](https://developer.hashicorp.com/terraform) to setup the infrastructure. It has two parts,
the backend for defining where to store Terraform state, and "the rest" for defining the infrastructure used to run the
project. When setting up the project in a new location, the backend has to be setup first, the backend only has to be
setup once.

When deploying either the backend or the infrastructure you need AWS authentication. Configure your environment with AWS
credentials by following the [Authentication and Configuration](https://registry.terraform.io/providers/hashicorp/aws/latest/docs#authentication-and-configuration)
steps from Terraform's AWS provider documentation.

When deploying the infrastructure you also need to Cloudflare authentication. Configure your environment with Cloudflare
credentials by one of the appropriate [`api_token` et. al.](https://registry.terraform.io/providers/cloudflare/cloudflare/latest/docs#api_token-1)
environment variables.

### Backend

Setup backend storage by going to `infra/backend` and applying the Terraform stack with `terraform apply`. This ony has
to be done once per project location.

### Infrastructure

Now the project infrastructure stack can be deployed. This stack uses the S3 bucket setup by the backend stack for
storing Terraform state. This means that it can be collaborated on and deployed by multiple parties. Such as other
developers, or CI/CD machines.

Go to `infra` and run any `terraform` command you like.

The first time the infrastructure stack is setup it might fail at the domain connection in AWS. This is because AWS'
servers needs to check that the Cloudflare managed domain has the correct DNS settings before issuing a certificate for
it. And it can take some time for AWS to realize that Cloudflare's DNS is updated. This is nothing to worry about, just
wait a bit and apply the Terraform stack again. It should work the second time, and all subsequent time, as long as no
DNS changes are necessary, in which case this might happen again.
