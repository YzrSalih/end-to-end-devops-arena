variable "project" {
  type = string
}

variable "environment" {
  type = string
}

variable "vpc_id" {
  type = string
}

variable "private_subnet_ids" {
  type        = list(string)
  description = "Private subnets where the RDS instance will be placed"
}

variable "allowed_security_group_ids" {
  type        = list(string)
  description = "Security groups allowed to connect to RDS (EKS node SG)"
  default     = []
}

variable "instance_class" {
  type    = string
  default = "db.t3.micro"
}

variable "postgres_version" {
  type    = string
  default = "15"
}

variable "db_name" {
  type    = string
  default = "products"
}

variable "db_username" {
  type    = string
  default = "devops"
}

variable "db_password" {
  type      = string
  sensitive = true
}

variable "multi_az" {
  type    = bool
  default = false
}

variable "allocated_storage" {
  type    = number
  default = 20
}

variable "skip_final_snapshot" {
  type    = bool
  default = true
}
