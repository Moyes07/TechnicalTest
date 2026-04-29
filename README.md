# Systems Technical Test

## Quick Start

### Prerequisites
- Node.js >= 18
- npm >= 9

### Install & Run

# Install dependencies
npm install or npm i

# Running backend (nestjs)
npm run start:dev

# Running frontend (reactjs)
npm run dev

The API will be available at **http://localhost:3000/**


## API Endpoints

### Parents
GET /parents
Returns a list of all parents

GET /parents/:id
Returns a specific parent by ID

### Students
GET /students
Returns a list of all students

GET /students/:id
Returns a specific student by ID

### Menu
GET /menu
Returns a list of all menu items

GET /menu/:id
Returns a specific menu item by ID

### Orders
GET /orders
Returns a list of all orders

GET /orders/:id
Returns a specific order by ID

POST /orders
Creates a new order

## Seeded Data
Parent:
parent1 — Sara John (wallet balance: Rs. 50.00)

Student:
student1 — Sam John
Allergens: nuts
Linked to parent1

Menu Items:
item-1
Name: Peanut Butter Cookie
Price: Rs. 1.50
Allergens: nuts, gluten
Available: yes

item-2
Name: Fresh Apple Juice
Price: Rs. 2.00
Allergens: none
Available: yes

item-3
Name: Cheese Sandwich
Price: Rs. 3.50
Allergens: gluten, dairy
Available: yes

item-4
Name: Seasonal Soup
Price: Rs.4.00
Allergens: none
Available: no



## Key Design Decisions & Trade-offs

### 1. Module-per-domain structure
Each domain (Parents, Students, Menu, Orders) is a self-contained NestJS module with its own entity, repository, service, and controller. This makes each domain independently testable and replaceable.

### 2. BusinessException + unified error filter
Instead of throwing raw HttpException objects directly from services, a custom BusinessException is used that carries a semantic ErrorCode enum to make errors more meaningful and structured; a global HttpExceptionFilter then catches all types of errors, whether they are business logic errors, NestJS validation issues, or unexpected runtime failures, and formats them into a consistent JSON response with the shape { code, message, statusCode, path, timestamp }, allowing the frontend to rely on a single, predictable error handling contract across the entire application.

### 3. Repository pattern with in-memory Maps
Each domain service is injected with a repository class that wraps a Map, which keeps the service logic independent of the underlying storage layer; this means that switching to something like Postgres is straightforward, as you only need to create a TypeOrmParentsRepository that follows the same interface and replace the provider in the module, without making any changes to the service code.


## Assumptions

1. **Currency**: Prices and balances are treated as PKR floats, and using parseFloat with toFixed(2) helps keep rounding consistent for in memory calculations; however, in a production environment, monetary values would typically be stored as integer pence or the smallest currency unit to avoid floating point precision issues.

2. **Authentication**: No authentication layer is included in this setup, but in a production environment requests would include a JWT, and the parent information would be extracted from the token rather than relying on the student's parentId field.

3. **Env file commit**: For ease of runnning and testing the code i have pushed the .env file to the repository.

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