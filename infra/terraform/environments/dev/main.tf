terraform {
  required_version = ">= 1.7"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
    tls = {
      source  = "hashicorp/tls"
      version = "~> 4.0"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = local.project
      Environment = local.environment
      ManagedBy   = "terraform"
    }
  }
}

locals {
  project     = "devops-arena"
  environment = "dev"
}

# 1. Base IAM roles (no OIDC dependency)

module "iam" {
  source      = "../../modules/iam"
  project     = local.project
  environment = local.environment
}

# 2. Network

module "vpc" {
  source      = "../../modules/vpc"
  project     = local.project
  environment = local.environment

  vpc_cidr             = "10.0.0.0/16"
  availability_zones   = ["${var.aws_region}a", "${var.aws_region}b"]
  public_subnet_cidrs  = ["10.0.1.0/24", "10.0.2.0/24"]
  private_subnet_cidrs = ["10.0.11.0/24", "10.0.12.0/24"]
  single_nat_gateway   = true
}

# 3. EKS cluster (depends on IAM + VPC)

module "eks" {
  source      = "../../modules/eks"
  project     = local.project
  environment = local.environment

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids
  cluster_role_arn   = module.iam.cluster_role_arn
  node_role_arn      = module.iam.node_role_arn

  kubernetes_version  = "1.29"
  node_instance_types = ["t3.medium"]
  node_desired        = 2
  node_min            = 1
  node_max            = 3
}

# 4. IRSA roles (depends on EKS OIDC provider)

module "iam_irsa" {
  source      = "../../modules/iam_irsa"
  project     = local.project
  environment = local.environment

  oidc_provider_arn = module.eks.oidc_provider_arn
  oidc_provider_url = module.eks.oidc_provider_url
}

# 5. Database (depends on VPC + EKS SG)

module "rds" {
  source      = "../../modules/rds"
  project     = local.project
  environment = local.environment

  vpc_id             = module.vpc.vpc_id
  private_subnet_ids = module.vpc.private_subnet_ids

  allowed_security_group_ids = [module.eks.cluster_security_group_id]

  instance_class      = "db.t3.micro"
  postgres_version    = "15"
  db_name             = "products"
  db_username         = "devops"
  db_password         = var.db_password
  multi_az            = false
  skip_final_snapshot = true
}
