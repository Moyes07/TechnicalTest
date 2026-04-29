# Systems Technical Test

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install & Run

```bash
# Install dependencies
npm install

# Start in development mode (hot-reload)
npm run start:dev

# OR build and run in production mode
npm run build && npm run start:prod
```

The API will be available at **http://localhost:3000/**


## API Endpoints

### Parents
| Method | Path | Description |
|--------|------|-------------|
| GET | `/parents` | List all parents |
| GET | `/parents/:id` | Get parent by ID |

### Students
| Method | Path | Description |
|--------|------|-------------|
| GET | `/students` | List all students |
| GET | `/students/:id` | Get student by ID |

### Menu
| Method | Path | Description |
|--------|------|-------------|
| GET | `/menu` | List all menu items |
| GET | `/menu/:id` | Get menu item by ID |

### Orders
| Method | Path | Description |
|--------|------|-------------|
| GET | `/orders` | List all orders |
| GET | `/orders/:id` | Get order by ID |
| POST | `/orders` | Create a new order |

---

## Seeded Data

The application starts with the following in-memory data:

**Parent:** `parent-1` — Sara John (wallet: £50.00)  
**Student:** `student-1` — Sam John (allergens: `nuts`) — linked to `parent-1`  
**Menu Items:**
| ID | Name | Price | Allergens | Available |
|----|------|-------|-----------|-----------|
| `item-1` | Peanut Butter Cookie | £1.50 | nuts, gluten | ✅ |
| `item-2` | Fresh Apple Juice | £2.00 | none | ✅ |
| `item-3` | Cheese Sandwich | £3.50 | gluten, dairy | ✅ |
| `item-4` | Seasonal Soup | £4.00 | none | ❌ (unavailable) |

---



## Key Design Decisions & Trade-offs

### 1. Module-per-domain structure
Each domain (Parents, Students, Menu, Orders) is a self-contained NestJS module with its own entity, repository, service, and controller. This makes each domain independently testable and replaceable (e.g. swapping an in-memory repository for a TypeORM one requires touching only the repository file and the module's provider registration).

### 2. BusinessException + unified error filter
Rather than throwing raw `HttpException` instances from services, a typed `BusinessException` carries a semantic `ErrorCode` enum value. The global `HttpExceptionFilter` formats *all* errors — business errors, NestJS validation errors, and unexpected errors — into the same JSON shape: `{ code, message, statusCode, path, timestamp }`. This means the frontend has a single contract to program against.

### 3. Repository pattern with in-memory Maps
Each domain service is injected with a repository class that wraps a `Map`. This keeps the service logic ignorant of the storage layer. Migrating to Postgres means writing a `TypeOrmParentsRepository` that implements the same interface and swapping the provider in the module — no service code changes required.


---


## Assumptions

1. **Currency**: Prices and balances are treated as PKR floats. `parseFloat(...toFixed(2))` keeps rounding deterministic for in-memory use. In production, monetary values would be stored as integer pence to avoid floating-point drift.

2. **Authentication**: No auth layer is included. In production, requests would carry a JWT and the parent would be derived from the token, not the student's `parentId` field.

---

## AI Tools Used

Claude.ai and ChatGPT were used for assistance.



## Transaction Considerations
**In our current code**: In orders.service.ts, these two operations happen back to back:
*** typescriptthis.parentsService.deductWalletBalance(parent.id, total); *** //step 1
*** return this.repo.save(order); *** //step 2
If the process crashes between step 1 and step 2, wallet is debited but no order record exists. The parent loses money with nothing to show for it.

If a database was being used, the wallet deduction and order creation would be wrapped in a single database transaction to guarantee atomicity. The workflow would start by opening a transaction and explicitly locking the parent's wallet row to prevent concurrent requests from causing race conditions. Inside this safe transactional block, the system would deduct the wallet balance and insert the new order record before finally committing the changes. If the a process crashes, the server loses power, or any intermediate validation fails before the COMMIT command is successfully issued, the database automatically performs a ROLLBACK. This restores the wallet balance to its exact previous state, ensuring that a parent's money is absolutely never deducted unless the corresponding order is fully persisted.


## Part 2: Production Thinking

### Scenerio: Some orders were created successfully, but the wallet balance was not deducted.

1. **What could cause this issue?**
- A try/catch somewhere catching the deduction error and letting execution continue.

- If total computes to 0 or NaN, the deduction call runs but subtracts nothing, no error is thrown.

- In case of deployment, each instance has its own in-memory Map; one instance creates the order, a different instance holds the wallet, so the deduction never reaches the right Map.

- If the wallet balance is being fetched from a fast cache but updated in a slow SQL database, a bug in cache invalidation could mean the application thinks the wallet balance was successfully decreased internally, but the permanent record is never updated.

- A code path (e.g. an early return or a conditional branch) skips the deductWalletBalance() call entirely.

2. **How would you debug it?**
- Log parentId, amount, and wallet balance before and after the deduction call on every order creation.

- Inspect the parent record immediately if balance is unchanged, the deduction either didn't fire or hit the wrong record.

- Search the codebase for bare catch blocks that don't rethrow or log.

- Confirm total is a valid positive number before it reaches the deduction call.

- Reproduce with a unit test.

3. **How would you prevent it in the future?**
- Use a proper database and use databasetransaction to ensure atomicity.

- Add a guard, after deduction, read the balance back and verify it decreased by the expected amount, throw an alert if it didn't.

- Use multiple track of balance variable. For an order to succeed, you insert two balancing rows in the same transaction: Credit the Revenue account and Debit the Parent Wallet account. If the debits and credits do not sum to zero across the system, throw an error.

- Write to the cache first, which immediately then saves to the database. Only return success if both succeed, and if the database fails, the cache clears the data to stay consistent.