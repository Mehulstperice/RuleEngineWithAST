
# Rule Engine with AST

## Project Overview

This project is a simple 3-tier rule engine application that evaluates user eligibility based on attributes like age, department, income, and spend. The application uses an Abstract Syntax Tree (AST) to represent conditional rules and supports dynamic creation, combination, and modification of these rules.

---

## Features

- **Dynamic Rule Creation**: Create rules dynamically using a string format (e.g., `age > 30 AND department = 'Sales'`).
- **Rule Combination**: Combine multiple rules into a single AST for efficient evaluation.
- **User Data Evaluation**: Evaluate user attributes against defined rules.
- **Customizable**: Modify rules by changing operators, operands, or sub-expressions.
- **Error Handling**: Handles invalid rule formats or unsupported operations gracefully.

---

## Design Choices

### 1. **Data Structure - Abstract Syntax Tree (AST)**

- **Node Structure**: The AST is structured using nodes where each node is either an `operator` (AND/OR) or an `operand` (a condition such as `age > 30`).
- **Tree Navigation**: Each operator node has left and right child nodes representing the sub-expressions it connects.

### 2. **Rule Parsing and AST Generation**

- Rules are parsed using a custom-built parser that reads conditions and operators, builds the corresponding AST, and ensures logical precedence based on parentheses.

### 3. **Rule Combination**

- Multiple ASTs can be combined into a single rule using operators (e.g., combining multiple rules with an `AND` operator).

### 4. **Evaluation**

- The AST is traversed recursively to evaluate whether user data matches the defined conditions.
- Custom logic handles operands and evaluates each condition against user-provided data.

---

## Build Instructions

### Prerequisites

1. **Node.js**: Ensure that Node.js is installed on your system. You can download it from [Node.js Official Website](https://nodejs.org/).
2. **PostgreSQL**: Ensure that PostgreSQL is installed for database support. You can download it from [PostgreSQL Official Website](https://www.postgresql.org/download/).

### Setup Instructions

1. Clone the repository from GitHub:
   ```bash
   git clone https://github.com/yourusername/RuleEngineWithAST.git
   cd RuleEngineWithAST
   ```

2. Install the required dependencies:
   ```bash
   npm install
   ```

3. **Database Setup**:
   - Install PostgreSQL and create a database for storing rules and metadata.
   - Modify the connection details in the application (`config/database.js`).
   - Run the migration scripts to set up tables (if provided).
   
   Example PostgreSQL command:
   ```bash
   CREATE DATABASE rule_engine_db;
   ```

4. Start the application:
   ```bash
   npm start
   ```

### Running the Application

- Once the application is running, open your browser and navigate to `http://localhost:3000` to interact with the UI for rule creation, modification, and evaluation.

---

## Dependencies

The following dependencies are required for the application:

```json
{
  "body-parser": "^1.18.3",
  "ejs": "^2.6.1",
  "express": "^4.16.3",
  "lodash": "^4.17.11",
  "mongoose": "^5.3.6",
  "pg": "^8.11.3"
}
```

### Docker Option (Optional)

You can set up the application using Docker containers for both the web server and PostgreSQL:

1. **Run PostgreSQL as a Docker container**:
   ```bash
   docker run --name postgres-container -e POSTGRES_PASSWORD=yourpassword -d postgres
   ```

2. **Run the application in a container** (if `Dockerfile` is provided):
   ```bash
   docker build -t rule-engine-app .
   docker run -p 3000:3000 rule-engine-app
   ```

---

## Testing

To test the application:

1. Create rules using the provided UI or API.
2. Combine multiple rules.
3. Evaluate different user attributes against the rules.
4. Check edge cases such as invalid rule formats or missing user data.

---

## Future Improvements

- Extend rule language to support custom user-defined functions.
- Implement user-friendly rule editors for non-technical users.
- Support for more complex data types and conditions.

---

Let me know if you'd like further adjustments!
