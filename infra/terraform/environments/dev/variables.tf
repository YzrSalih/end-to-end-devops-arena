variable "aws_region" {
  type    = string
  default = "eu-west-1"
}

variable "db_password" {
  type      = string
  sensitive = true
  # Set via: export TF_VAR_db_password="..."
  # or via Vault / AWS Secrets Manager in CI
}
