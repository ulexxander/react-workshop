FROM golang:1.19 AS builder
ENV \
  GOOS=linux \
  GOARCH=amd64 \
  CGO_ENABLED=0
WORKDIR /build
COPY go.mod go.sum ./
RUN go mod download
COPY . .
RUN go build -o notesapi .

FROM buildpack-deps:bullseye-curl
WORKDIR /app
COPY --from=builder /build/notesapi .
EXPOSE 80
CMD ["/app/notesapi"]
