FROM golang:1.23-alpine AS builder
WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o product-service .

FROM alpine:3.21
RUN apk --no-cache upgrade && apk --no-cache add ca-certificates tzdata
WORKDIR /app
COPY --from=builder /app/product-service .
EXPOSE 8080
USER nobody
CMD ["./product-service"]
