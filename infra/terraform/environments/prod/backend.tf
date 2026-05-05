terraform {
  backend "s3" {
    # bucket         = "devops-arena-terraform-state-<account-id>"
    # region         = "eu-west-1"
    key            = "prod/terraform.tfstate"
    dynamodb_table = "devops-arena-terraform-locks"
    encrypt        = true
  }
}
