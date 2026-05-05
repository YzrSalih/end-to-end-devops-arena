# GitHub Copilot Instructions

## Project: Cloud-Native Event-Driven Market

This is a DevOps portfolio project with three Python/Go microservices, deployed on AWS EKS via GitOps (ArgoCD). Read CLAUDE.md at the repo root for full context.

---

## Services at a Glance

| Service | Language | Role | Port |
|---|---|---|---|
| product-service | Go or Node.js | Product catalog REST API | 8080 |
| order-service | Python/Flask | Accepts orders, publishes to RabbitMQ | 5000 |
| notification-service | Python Worker | Consumes RabbitMQ queue, simulates email | — |

---

## Code Style Rules

### Python (order-service, notification-service)
- Use `pika` library for RabbitMQ connections
- Use `psycopg2` or `SQLAlchemy` for PostgreSQL (order-service if needed)
- Environment variables via `os.environ` — never hardcode credentials
- Flask app factory pattern (`create_app()`)
- Keep RabbitMQ connection logic in a separate `broker.py` module

### Go (product-service)
- Standard `net/http` or `chi` router
- Repository pattern for database access
- Config from environment variables using `os.Getenv`

### General
- Every service must have a `Dockerfile` with a multi-stage build
- Health check endpoint at `GET /health` returning `{"status": "ok"}`
- Structured JSON logging (not plain text)
- No secrets or credentials committed to git — use environment variables

---

## Infrastructure Rules

### Terraform
- All resources tagged with `Project = "devops-arena"` and `Environment = var.environment`
- Use remote state (S3 backend + DynamoDB lock)
- Modules live in `infra/terraform/modules/`, environments in `infra/terraform/environments/`
- Never use `count` when `for_each` is more appropriate

### Kubernetes / Helm
- All Helm charts in `k8s/helm/<service-name>/`
- ArgoCD Application manifests in `k8s/argocd/applications/`
- Resource requests and limits must be set on every container
- Never use `latest` tag for images in Kubernetes manifests

### GitHub Actions
- Workflow files in `.github/workflows/`
- CI steps order: checkout → lint → test → trivy scan → docker build → push
- Use `docker/build-push-action` for image builds
- Trivy scan must pass before push (exit-code: 1 on HIGH/CRITICAL)

---

## RabbitMQ Message Schema

Messages on the `order_events` queue are JSON:

```json
{
  "order_id": "uuid-string",
  "product_id": "uuid-string",
  "quantity": 1,
  "customer_email": "user@example.com",
  "created_at": "2026-01-01T00:00:00Z"
}
```

---

## What NOT to Generate

- No `docker-compose.override.yml` with hardcoded passwords — use `.env` file pattern
- No `kubectl apply` in CI — all K8s changes go through ArgoCD (GitOps)
- No synchronous HTTP calls from Order Service to Notification Service — always via queue
- No shared database between services — each service owns its own data
