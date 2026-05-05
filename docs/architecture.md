# Architecture — Cloud-Native Event-Driven Market

## System Overview

```
                        ┌─────────────────────────────────────────────┐
                        │        1. Source Control & CI/CD             │
                        │                                              │
  GitHub ──push──► GitHub Actions                                      │
                        │  checkout → lint/test → trivy → docker build │
                        │       │                    │                  │
                        │       ▼                    ▼                  │
                        │  Docker Hub / ECR    GitOps Repo (k8s/helm/) │
                        └─────────────────────────────────────────────┘
                                                     │
                                                  ArgoCD
                                                     │ (Kubernetes CRDs)
                        ┌────────────────────────────▼────────────────┐
                        │    2. Cloud Infrastructure — AWS EKS         │
                        │                                              │
  External              │  ┌─────────────────────────────────────────┐ │
  Traffic ──► Istio Gateway│        Istio Service Mesh (mTLS)        │ │
                        │  │                                         │ │
                        │  │  [A] Product Service (Go/Node.js)       │ │
                        │  │       Pod ──► Service ──► AWS RDS       │ │
                        │  │                                         │ │
                        │  │  [B] Order Service (Python/Flask)       │ │
                        │  │       Pod ──► Service                   │ │
                        │  │            │         ▲                  │ │
                        │  │            │       Secrets              │ │
                        │  │            ▼         │                  │ │
                        │  │       RabbitMQ (Message Broker)         │ │
                        │  │            │                            │ │
                        │  │            ▼                            │ │
                        │  │  [C] Notification Service (Python Worker)│ │
                        │  │       Pod ──► simulates email sending   │ │
                        │  └─────────────────────────────────────────┘ │
                        └─────────────────────────────────────────────┘
                                   │                │
                    ┌──────────────┘                └────────────────┐
                    ▼                                                ▼
        ┌───────────────────────┐               ┌───────────────────────────┐
        │  3. Observability     │               │  3b. Secrets Management   │
        │                       │               │                           │
        │  Prometheus (metrics) │               │  HashiCorp Vault          │
        │  Jaeger    (traces)   │               │  + External Secrets Op.   │
        │  Loki      (logs)     │               └───────────────────────────┘
        │  Grafana   (UI)       │
        └───────────────────────┘

        ┌─────────────────────────────────────────┐
        │  4. Infrastructure as Code (Terraform)  │
        │  VPC / EKS / RDS / IAM / KMS            │
        └─────────────────────────────────────────┘
```

---

## Data Flow: Placing an Order

```
1. Client sends POST /orders to Order Service (via Istio Gateway)
2. Order Service validates request
3. Order Service publishes JSON message to RabbitMQ queue "order_events"
4. Order Service returns 202 Accepted to client
5. Notification Service (always-running worker) consumes message from queue
6. Notification Service logs "Email sent to customer@example.com for order #xyz"
```

This is **asynchronous** — the client does not wait for the notification to be sent.

---

## Network & Security

### Istio mTLS
All service-to-service communication inside the cluster is encrypted with mutual TLS enforced by Istio. Envoy sidecar proxies are injected into each pod automatically.

### Ingress
Istio Gateway handles all external traffic. No separate Nginx ingress controller.

### Secrets
- Secrets are stored in HashiCorp Vault
- External Secrets Operator (ESO) syncs Vault secrets into Kubernetes Secrets
- No secrets are stored in Git or environment files in the repo

---

## Infrastructure (Terraform Modules)

| Module | Provisions |
|---|---|
| `vpc` | VPC, public/private subnets, NAT gateway, route tables |
| `eks` | EKS cluster, node groups, OIDC provider |
| `rds` | PostgreSQL RDS instance, subnet group, security groups |
| `iam` | Service accounts, IRSA roles for EKS pods |

Environments: `dev` (smaller instances, single-AZ) and `prod` (multi-AZ, larger instances).

---

## CI/CD Pipeline (GitHub Actions)

```
Push to main / PR
        │
        ▼
  1. Code Checkout
        │
        ▼
  2. Lint & Unit Tests
        │
        ▼
  3. Trivy Vulnerability Scan
     (fails on HIGH/CRITICAL)
        │
        ▼
  4. Docker Build & Push
     (tag: git sha + semver on release)
        │
        ▼
  5. Update image tag in k8s/helm/<service>/values.yaml
        │
        ▼
  6. ArgoCD detects change → syncs cluster
```

---

## Observability Details

### Metrics (Prometheus + Grafana)
- Infrastructure: CPU, memory, pod restarts, node status
- Application: request rate, error rate, queue depth, order count

### Distributed Tracing (Jaeger)
- OpenTelemetry SDK instrumented in each service
- Trace follows: Istio Gateway → Product/Order Service → RabbitMQ publish
- Helps identify which service caused a latency spike

### Logs (Loki)
- All services output structured JSON logs
- Loki scrapes via Promtail
- Queryable in Grafana alongside metrics

---

## Local Development

All three services + RabbitMQ + PostgreSQL run via Docker Compose.

```bash
docker compose up
```

| Service | URL |
|---|---|
| Product Service | http://localhost:8080 |
| Order Service | http://localhost:5000 |
| RabbitMQ Management UI | http://localhost:15672 |
| Grafana (when running) | http://localhost:3000 |
