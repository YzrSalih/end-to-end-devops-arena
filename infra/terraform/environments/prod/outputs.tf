output "vpc_id" {
  value = module.vpc.vpc_id
}

output "eks_cluster_name" {
  value = module.eks.cluster_name
}

output "eks_cluster_endpoint" {
  value = module.eks.cluster_endpoint
}

output "rds_endpoint" {
  value = module.rds.endpoint
}

output "external_secrets_role_arn" {
  value = module.iam_irsa.external_secrets_role_arn
}

output "load_balancer_controller_role_arn" {
  value = module.iam_irsa.load_balancer_controller_role_arn
}
