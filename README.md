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

The first time the App Runner Connection is deployed you have to manually go in to the AWS Console to approve it before
the App Runner can pull the code from the repository. Do this by navigating to [Connections | AWS App Runner](https://console.aws.amazon.com/apprunner/home#/connections)
and taking the "Complete handshake" action for the newly created connection. This can be done while the Terraform apply
is running, it will continually try to pull the repository until it is able to.
