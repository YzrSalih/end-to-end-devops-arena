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
  description = "Private subnets where EKS nodes will run"
}

variable "kubernetes_version" {
  type    = string
  default = "1.29"
}

variable "node_instance_types" {
  type        = list(string)
  description = "EC2 instance types for the managed node group"
  default     = ["t3.medium"]
}

variable "node_desired" {
  type    = number
  default = 2
}

variable "node_min" {
  type    = number
  default = 1
}

variable "node_max" {
  type    = number
  default = 3
}

variable "cluster_role_arn" {
  type        = string
  description = "IAM role ARN for the EKS cluster"
}

variable "node_role_arn" {
  type        = string
  description = "IAM role ARN for the EKS node group"
}
