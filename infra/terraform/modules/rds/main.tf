locals {
  identifier = "${var.project}-${var.environment}-postgres"
  common_tags = {
    Project     = var.project
    Environment = var.environment
    ManagedBy   = "terraform"
  }
}

# Security Group

resource "aws_security_group" "rds" {
  name        = "${local.identifier}-sg"
  description = "Allow PostgreSQL access from EKS nodes"
  vpc_id      = var.vpc_id

  ingress {
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = var.allowed_security_group_ids
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = merge(local.common_tags, {
    Name = "${local.identifier}-sg"
  })
}

# Subnet Group

resource "aws_db_subnet_group" "this" {
  name        = "${local.identifier}-subnet-group"
  subnet_ids  = var.private_subnet_ids
  description = "RDS subnet group for ${local.identifier}"

  tags = local.common_tags
}

# Parameter Group

resource "aws_db_parameter_group" "this" {
  name        = "${local.identifier}-pg15"
  family      = "postgres${var.postgres_version}"
  description = "Custom parameter group for ${local.identifier}"

  parameter {
    name  = "log_connections"
    value = "1"
  }

  parameter {
    name  = "log_min_duration_statement"
    value = "1000"
  }

  tags = local.common_tags
}

# RDS Instance

resource "aws_db_instance" "this" {
  identifier        = local.identifier
  engine            = "postgres"
  engine_version    = var.postgres_version
  instance_class    = var.instance_class
  allocated_storage = var.allocated_storage
  storage_type      = "gp3"
  storage_encrypted = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.this.name
  parameter_group_name   = aws_db_parameter_group.this.name
  vpc_security_group_ids = [aws_security_group.rds.id]

  multi_az               = var.multi_az
  publicly_accessible    = false
  deletion_protection    = !var.skip_final_snapshot
  skip_final_snapshot    = var.skip_final_snapshot
  backup_retention_period = var.multi_az ? 7 : 1
  backup_window          = "03:00-04:00"
  maintenance_window     = "Mon:04:00-Mon:05:00"

  tags = local.common_tags
}
