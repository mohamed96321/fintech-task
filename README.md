# Expense Tracker NestJS Application

A modular, scalable backend application for managing financial accounts and transactions, built using NestJS and MongoDB.

---

## Why NestJS?

NestJS was chosen for the following reasons:

- **Scalability and Modularity**: The modular structure aligns well with domain-driven design and supports future growth and separation of concerns.
- **Type Safety**: Built on TypeScript, providing static typing and reducing runtime errors.
- **Maintainability**: Encourages clean architecture through dependency injection and a clear separation between controllers, services, and data access layers.
- **Developer Productivity**: Includes built-in support for validation, logging, exception handling, lifecycle hooks, and testing.
- **Flexible Transport Layer**: Supports building both RESTful APIs and microservices using protocols like HTTP, gRPC, WebSockets, RabbitMQ, and Kafka.

---

## Prerequisites

- Node.js v18 or above
- MongoDB (locally installed or Dockerized)
- Docker and Docker Compose (optional, for containerized deployment)

---

## Setup Instructions

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd expense-tracker-api
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create your environment configuration**:
   ```bash
   cp .env.example .env
   ```

   > **Tip**: Please we should replace MONGO_URI in .env file with actually the atlas cloud MONGO_URI to make acid work correct, this loaclhost `{MONGO_URI=mongodb://localhost:27017/expense-tracker}` not work to make session and startTransaction work in MongoDB, we want to make replication server in configs of mongodb and add replicaSet=rs0 in URI of mongodb to make it work on local, or we can run it with docker

4. **Run the application**:

   **Development**:
   ```bash
   npm run start:dev
   ```

   **Production**:
   ```bash
   npm run build
   npm run start
   ```

5. **Access the application**:
   - API: `http://localhost:3000`
   - Swagger Docs: `http://localhost:3000/api`

### Docker Deployment
You can run the application using Docker:
```bash
# Build and start containers
docker-compose up --build

## License

This project is licensed under the MIT License.