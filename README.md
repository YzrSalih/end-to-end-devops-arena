# Cloud-Native Event-Driven Market

A production-grade, end-to-end DevOps portfolio project demonstrating microservices architecture, GitOps, Infrastructure as Code, security, and full observability — all in a single cohesive system.


https://github.com/user-attachments/assets/b07ad7c9-06be-4962-9b99-7ed3b31ca0d6

<img width="1408" height="768" alt="Devops" src="https://github.com/user-attachments/assets/f264b7c5-dd3e-43b8-b6e5-1e1206c028be" />

---
## This is test
## What Is This?

An event-driven e-commerce platform built with three independent microservices that communicate asynchronously via RabbitMQ. When a customer places an order, the Order Service publishes an event to a message queue, and the Notification Service consumes it to send a confirmation — no direct service-to-service calls.

The project covers every layer of a modern DevOps stack: local development, CI/CD, container security scanning, GitOps deployment, secrets management, service mesh, and observability.

---

## Architecture

```
Browser (React)
      │
      ▼
Istio Gateway
      │
      ├──► Product Service (Go)  ──► PostgreSQL (RDS)
      │
      ├──► Order Service (Python/Flask)  ──► RabbitMQ
      │                                         │
      └──────────────────────────────────────   ▼
                                        Notification Service
                                        (Python Worker)
```

All inter-service traffic is encrypted with **Istio mTLS**. Secrets are never stored in code — they are injected at runtime via **HashiCorp Vault + External Secrets Operator**.

---

## Services

| Service | Language | Role | Port |
|---|---|---|---|
| **Product Service** | Go + chi | CRUD REST API for product catalog, backed by PostgreSQL | 8080 |
| **Order Service** | Python + Flask | Accepts orders, publishes events to RabbitMQ | 5000 |
| **Notification Service** | Python Worker | Consumes queue, simulates email notification | — |
| **Frontend** | React + Vite | Animated UI for browsing products and placing orders | 3000 |

---

## Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, TypeScript, Vite, Tailwind CSS, Framer Motion |
| **Microservices** | Go/chi, Python/Flask, Python Worker |
| **Message Broker** | RabbitMQ |
| **Database** | PostgreSQL (AWS RDS) |
| **Containers** | Docker, Docker Compose (local) |
| **Orchestration** | Kubernetes on AWS EKS |
| **Package Manager** | Helm |
| **GitOps** | ArgoCD (App of Apps pattern) |
| **IaC** | Terraform — VPC, EKS, RDS, IAM modules |
| **Service Mesh** | Istio (mTLS STRICT mode, Istio Gateway) |
| **Secrets** | HashiCorp Vault + External Secrets Operator |
| **CI/CD** | GitHub Actions — lint → test → Trivy scan → build → push → deploy |
| **Security Scanning** | Trivy (container image CVE scanning on every push) |
| **Metrics** | Prometheus + kube-prometheus-stack |
| **Dashboards** | Grafana (business metrics + infra metrics) |
| **Tracing** | Jaeger + OpenTelemetry |
| **Log Aggregation** | Loki + Promtail |

---

## Project Phases

### Phase 1 — Local Stack
Three microservices wired together with Docker Compose. Validated the full event-driven flow end-to-end: place order → RabbitMQ → notification log.

### Phase 2 — Infrastructure as Code
Terraform modules for VPC, EKS cluster, RDS instance, and IAM roles. Remote state stored in S3 with DynamoDB locking. Separate `dev` and `prod` environments.

### Phase 3 — CI/CD + GitOps
GitHub Actions pipelines for all three services: lint → test → Trivy CVE scan → Docker build & push to Docker Hub → update Helm values. ArgoCD watches `k8s/helm/` and auto-syncs on every commit to `main`.

### Phase 4 — Security & Service Mesh
HashiCorp Vault deployed on Kubernetes. External Secrets Operator syncs secrets as native Kubernetes Secrets. Istio installed with mTLS STRICT policy enforced cluster-wide. Istio Gateway replaces all Ingress resources.

### Phase 5 — Observability
Full observability stack deployed via ArgoCD:
- **Prometheus** scrapes all services
- **Grafana** dashboards: order rate, error rate, queue depth, p99 latency, pod CPU/memory, Istio success rate
- **Jaeger** receives OpenTelemetry traces from all services
- **Loki + Promtail** aggregates structured JSON logs

### Phase 6 — Frontend
React + TypeScript single-page application with animated UI:
- Animated hero with event-driven architecture flow diagram (SVG with animated dots)
- Product catalog with search, filter, and loading skeletons
- 3-step order form with Framer Motion transitions
- Order success screen showing the processing pipeline lighting up in sequence

---

## Local Development

### Prerequisites
- Docker Desktop
- Node.js 22+ (for frontend)

### Start the full stack

```bash
# Copy environment file
cp .env.example .env   # fill in credentials

# Start all services
docker compose up -d
```

| Service | URL |
|---|---|
| Frontend | http://localhost:3000 |
| Product Service | http://localhost:8080 |
| Order Service | http://localhost:5001 |
| RabbitMQ UI | http://localhost:15672 (guest/guest) |
| PostgreSQL | localhost:5432 |

### Frontend (dev mode with hot reload)

```bash
cd frontend
npm install
npm run dev
# → http://localhost:3000
```

### Place a test order

```bash
curl -X POST http://localhost:5001/orders \
  -H "Content-Type: application/json" \
  -d '{"product_id":"1","quantity":2,"customer_email":"test@example.com"}'
```

Expected response:
```json
{"order_id": "uuid", "status": "queued"}
```

Check the notification-service logs to confirm the event was consumed:
```bash
docker compose logs notification-service
```

---

## Repository Structure

```
end-to-end-devops-arena/
├── frontend/                        # React + Vite frontend
├── services/
│   ├── product-service/             # Go REST API
│   ├── order-service/               # Python/Flask + RabbitMQ publisher
│   └── notification-service/        # Python worker (queue consumer)
├── infra/terraform/
│   ├── modules/                     # vpc, eks, rds, iam, iam_irsa
│   └── environments/dev|prod/
├── k8s/
│   ├── helm/                        # Helm charts for all services
│   ├── argocd/applications/         # ArgoCD App of Apps
│   ├── vault/                       # Vault + ESO manifests
│   ├── istio/                       # PeerAuthentication, Gateway, VirtualService
│   └── grafana-dashboards/          # ConfigMap-based dashboard definitions
├── .github/workflows/               # CI pipelines (3 services)
└── docker-compose.yml
```

---

## CI/CD Pipeline

Every push triggers:

```
Lint & Test  →  Trivy Scan  →  Build & Push  →  Update Helm values
```

- **Lint & Test**: ruff (Python) / golangci-lint (Go)
- **Trivy Scan**: blocks merge on HIGH/CRITICAL CVEs with available fixes
- **Build & Push**: multi-platform Docker image pushed to Docker Hub
- **Update Helm**: bot commit updates `image.tag` in the relevant Helm chart → ArgoCD picks it up and deploys

---

## Key Design Decisions

| Decision | Rationale |
|---|---|
| RabbitMQ over Kafka | Task queue semantics fit better; simpler ops for this scale |
| Loki over ELK | Grafana-native, far lower resource consumption |
| Istio over Linkerd | Richer traffic management and mTLS policy features |
| ESO over Vault Agent Sidecar | Cleaner Kubernetes-native secret injection |
| Monorepo | Easier cross-cutting changes — CI, Helm, IaC all in one place |
| ArgoCD App of Apps | Single root application manages all child apps declaratively |

---

## Author

**YzrSalih** — [github.com/YzrSalih](https://github.com/YzrSalih)
