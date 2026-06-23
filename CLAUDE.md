# CLAUDE.md — Project Context for AI Assistants
## Test from Abdullah three
## Project Overview

**Name:** Cloud-Native Event-Driven Market  
**Type:** End-to-end DevOps portfolio project  
**Goal:** Demonstrate production-grade microservices, GitOps, IaC, observability, and secrets management in a single cohesive system.

This is a **monorepo** containing three microservices that communicate asynchronously via a message broker, deployed on Kubernetes (AWS EKS) using GitOps principles.

---

## Architecture Summary

```
External Traffic
      │
      ▼
Ingress (Istio Gateway)
      │
      ▼
┌─────────────────────────────────────────────────┐
│              Istio Service Mesh (mTLS)           │
│                                                  │
│  [A] Product Service ──► AWS RDS (PostgreSQL)   │
│       Go / Node.js                               │
│                                                  │
│  [B] Order Service ──► RabbitMQ (Message Broker)│
│       Python / Flask      │                      │
│                           ▼                      │
│  [C] Notification Service (consumes queue)       │
│       Python Worker ──► Email simulation         │
└─────────────────────────────────────────────────┘
```

**Full system diagram:** See `docs/architecture.md`

---

## Services

### A. Product Service
- **Language:** Go (preferred) or Node.js
- **Role:** CRUD REST API for product catalog
- **Database:** AWS RDS PostgreSQL
- **Port:** 8080
- **Path:** `services/product-service/`

### B. Order Service
- **Language:** Python / Flask
- **Role:** Accepts order requests, publishes events to RabbitMQ queue
- **Queue:** `order_events` on RabbitMQ
- **Port:** 5000
- **Path:** `services/order-service/`

### C. Notification Service
- **Language:** Python (worker, no HTTP server)
- **Role:** Consumes messages from RabbitMQ, simulates email sending (prints to stdout / logs)
- **Path:** `services/notification-service/`

---

## Tech Stack

| Layer | Technology |
|---|---|
| Microservices | Go/Node.js, Python/Flask, Python Worker |
| Message Broker | RabbitMQ |
| Database | AWS RDS (PostgreSQL) |
| Container Runtime | Docker |
| Local Dev | Docker Compose |
| Container Registry | Docker Hub / AWS ECR |
| Orchestration | Kubernetes on AWS EKS |
| Package Manager (K8s) | Helm |
| GitOps | ArgoCD |
| IaC | Terraform |
| Service Mesh | Istio (mTLS between services) |
| Secrets Management | HashiCorp Vault (via External Secrets Operator) |
| CI Pipeline | GitHub Actions |
| Security Scanning | Trivy (container image scanning) |
| Metrics | Prometheus |
| Dashboards | Grafana |
| Distributed Tracing | Jaeger |
| Log Aggregation | Loki |

---

## Repository Structure

```
end-to-end-devops-arena/
├── CLAUDE.md                        # This file — AI context
├── .github/
│   ├── copilot-instructions.md      # GitHub Copilot context
│   └── workflows/
│       ├── ci-product.yml
│       ├── ci-order.yml
│       └── ci-notification.yml
├── services/
│   ├── product-service/
│   │   ├── Dockerfile
│   │   ├── main.go (or index.js)
│   │   └── ...
│   ├── order-service/
│   │   ├── Dockerfile
│   │   ├── app.py
│   │   └── ...
│   └── notification-service/
│       ├── Dockerfile
│       ├── worker.py
│       └── ...
├── infra/
│   └── terraform/
│       ├── modules/
│       │   ├── vpc/
│       │   ├── eks/
│       │   ├── rds/
│       │   └── iam/
│       └── environments/
│           ├── dev/
│           └── prod/
├── k8s/
│   ├── helm/
│   │   ├── product-service/
│   │   ├── order-service/
│   │   └── notification-service/
│   └── argocd/
│       └── applications/
├── docs/
│   └── architecture.md
└── docker-compose.yml               # Local development
```

---

## Implementation Phases

### Phase 1 — Local Stack (Current Focus)
- Write all three services
- Connect via Docker Compose (services + RabbitMQ + PostgreSQL)
- Validate the event-driven flow end-to-end locally

### Phase 2 — IaC
- Terraform: VPC, EKS cluster, RDS instance, IAM roles
- Remote state in S3 + DynamoDB locking

### Phase 3 — CI/CD + GitOps
- GitHub Actions: lint → test → Trivy scan → Docker build & push
- Helm charts for each service
- ArgoCD watching `k8s/helm/` directory

### Phase 4 — Security & Service Mesh
- HashiCorp Vault + External Secrets Operator for secret injection
- Istio installation, mTLS enforcement between services
- Istio Gateway replacing any Nginx ingress

### Phase 5 — Observability
- Prometheus scraping all services
- Jaeger for distributed tracing (OpenTelemetry instrumentation)
- Loki for log aggregation
- Grafana dashboards: business metrics (order count, error rate) + infra metrics

---

## Key Conventions

- **No secrets in code or git.** All credentials come from Vault or environment variables injected at runtime.
- **Each service is independently deployable.** No shared libraries between services.
- **Docker Compose for local dev**, Helm + ArgoCD for Kubernetes.
- **Terraform workspaces** separate dev and prod environments.
- **All Kubernetes manifests live in `k8s/`** — ArgoCD watches this directory, not the application repos.
- **CI builds on every push to `main` and on PRs.** Tags trigger image pushes to registry.

---

## Environment Variables Reference

### Product Service
```
DATABASE_URL=postgresql://user:pass@host:5432/products
PORT=8080
```

### Order Service
```
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672/
PORT=5000
```

### Notification Service
```
RABBITMQ_URL=amqp://user:pass@rabbitmq:5672/
QUEUE_NAME=order_events
```

---

## Local Development Quick Start

```bash
# Start all services + RabbitMQ + PostgreSQL
docker compose up

# Product Service: http://localhost:8080
# Order Service:   http://localhost:5000
# RabbitMQ UI:     http://localhost:15672  (guest/guest)
```

---

## Decision Log

| Decision | Rationale |
|---|---|
| RabbitMQ over Kafka | Task queue semantics fit better; simpler ops for this scale |
| Loki over ELK | Grafana-native, far lower resource consumption |
| Istio over Linkerd | More features needed (traffic management, mTLS policy) |
| ESO over Vault Agent Sidecar | Cleaner K8s-native secret injection pattern |
| Monorepo | Easier to manage cross-cutting changes (CI, Helm, IaC) in one place |
