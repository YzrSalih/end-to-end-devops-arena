terraform {
  backend "s3" {
    # Fill in your account-specific values after running bootstrap
    # bucket         = "devops-arena-terraform-state-<account-id>"
    # region         = "eu-west-1"
    key            = "dev/terraform.tfstate"
    dynamodb_table = "devops-arena-terraform-locks"
    encrypt        = true
  }
}
