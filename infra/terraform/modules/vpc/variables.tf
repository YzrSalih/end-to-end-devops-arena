variable "project" {
  type        = string
  description = "Project name, used in resource naming and tags"
}

variable "environment" {
  type        = string
  description = "Environment name (dev, prod)"
}

variable "vpc_cidr" {
  type        = string
  description = "CIDR block for the VPC"
}

variable "public_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for public subnets (one per AZ)"
}

variable "private_subnet_cidrs" {
  type        = list(string)
  description = "CIDR blocks for private subnets (one per AZ)"
}

variable "availability_zones" {
  type        = list(string)
  description = "List of availability zones to use"
}

variable "single_nat_gateway" {
  type        = bool
  description = "Use a single NAT GW (dev) instead of one per AZ (prod)"
  default     = true
}
