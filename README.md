# Fintech NestJS Application

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
   cd fintech-task
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Create your environment configuration**:
   ```bash
   cp .env.example .env
   ```

   > **Tip**: Please we should replace MONGO_URI in .env file with actually the atlas cloud MONGO_URI to make acid work correct, this loaclhost `{MONGO_URI=mongodb://localhost:27017/fintech-task}` not work to make session and startTransaction work in MongoDB, we want to make replication server in configs of mongodb and add replicaSet=rs0 in URI of mongodb to make it work on local, or we can run it with docker

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

# Run tests inside the container
docker-compose run app npm test
```

### Running Tests
**Unit tests**:
```bash
npm run test
```

**End-to-End (E2E) tests**:
```bash
npm run test:e2e
```

---

## API Endpoints

| Method | Endpoint                     | Description                     |
|--------|------------------------------|---------------------------------|
| POST   | `/accounts`                  | Open a new account              |
| GET    | `/accounts/:id/balance`      | Retrieve account balance        |
| POST   | `/transactions`              | Deposit or withdraw funds       |
| PATCH  | `/accounts/:id/unfreeze`     | Unfreeze an account             |
| PATCH  | `/accounts/:id/freeze`       | Freeze an account               |

---

## Postman Testing Guide

This section provides step-by-step instructions to test the API using Postman. Ensure the application is running (`http://localhost:3000`).

### 1. Create a New Bank Account

- **Method**: POST
- **URL**: `http://localhost:3000/accounts`
- **Request Body** (JSON):
  ```json
  {
    "fullName": "Mohamed Atef",
    "email": "mohamed@example.com",
    "phone": "0123456789",
    "nationality": "Egyptian",
    "religion": "Islam",
    "address": "Cairo",
    "type": "savings"
  }
  ```
- **Expected Response**: 201 Created
  ```json
  {
    "accountId": "<generated-account-id>",
    "fullName": "Mohamed Atef",
    "email": "mohamed@example.com",
    "phone": "0123456789",
    "nationality": "Egyptian",
    "religion": "Islam",
    "address": "Cairo",
    "type": "savings",
    "balance": 0,
    "isFrozen": false
  }
  ```

### 2. Deposit or Withdraw Funds

- **Method**: POST
- **URL**: `http://localhost:3000/transactions`
- **Request Body** (JSON):
  - **Deposit Example**:
    ```json
    {
      "accountId": "<your-account-id>",
      "type": "deposit",
      "amount": 500
    }
    ```
  - **Withdraw Example**:
    ```json
    {
      "accountId": "<your-account-id>",
      "type": "withdraw",
      "amount": 200
    }
    ```
- **Expected Response**: 201 Created
  ```json
  {
    "transactionId": "<generated-transaction-id>",
    "accountId": "<your-account-id>",
    "type": "deposit",
    "amount": 500,
    "timestamp": "<date-time>"
  }
  ```

> **Note**: Replace `<your-account-id>` with the `accountId` from the account creation response.

### 3. Check Account Balance

- **Method**: GET
- **URL**: `http://localhost:3000/accounts/<your-account-id>/balance`
- **Expected Response**: 200 OK
  ```json
  {
    "accountId": "<your-account-id>",
    "balance": 300
  }
  ```

### 4. Freeze an Account

- **Method**: PATCH
- **URL**: `http://localhost:3000/accounts/<your-account-id>/freeze`
- **Expected Response**: 200 OK
  ```json
  {
    "message": "Account frozen successfully",
    "accountId": "<your-account-id>",
    "isFrozen": true
  }
  ```

### 5. Unfreeze an Account

- **Method**: PATCH
- **URL**: `http://localhost:3000/accounts/<your-account-id>/unfreeze`
- **Expected Response**: 200 OK
  ```json
  {
    "message": "Account unfrozen successfully",
    "accountId": "<your-account-id>",
    "isFrozen": false
  }
  ```
  
---

## Design Decisions

- **Atomic Transactions**: MongoDB sessions are used to ensure consistency when modifying account balances.
- **RESTful API Design**: Endpoints follow REST principles with appropriate HTTP methods and status codes.
- **Modular Architecture**: The project is organized into modules by domain (e.g., Accounts, Transactions).
- **Validation Layer**: DTOs are validated using `class-validator`, with custom validation logic where needed.
- **Security Measures**:
  - Applied Helmet middleware for secure HTTP headers.
  - Enabled and configured CORS.
  - Used rate limiting to prevent abuse.
- **API Documentation**: Swagger is integrated for live and interactive API documentation.
- **Testing**:
  - Unit tests cover business logic in isolation.
  - E2E tests validate the full request-response flow.

---

## Challenges and Solutions

| Challenge                   | Description                                     | Solution                                      |
|----------------------------|------------------------------------------------|-----------------------------------------------|
| Concurrency Handling       | Race conditions during concurrent balance updates | Used MongoDB transactions for atomic operations |
| Consistent Error Handling  | Needed a unified structure for error responses   | Implemented a global exception filter         |
| Complex Validation Rules   | Business rules needed detailed validation logic | Used `class-validator` with custom decorators |
| Test Isolation             | Preventing contamination between test cases     | Used `mongodb-memory-server` for isolated in-memory test databases |

---

## License

This project is licensed under the MIT License.