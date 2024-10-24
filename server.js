const express = require('express');
const bodyParser = require('body-parser');
const { Pool } = require('pg');
const _ = require('lodash');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Database setup (connect to PostgreSQL)
const pool = new Pool({
    user: "postgres",
    host: "localhost",
  database: "rule_engine_db",
  password: "123456",
  port: 5000,
});

// Routes

// Render homepage
app.get('/', (req, res) => {
  res.render('index', { result: null });
});

// Create rule and store in PostgreSQL
app.post('/create-rule', async (req, res) => {
  const ruleString = req.body.rule;
  const ast = create_rule(ruleString);
  // Insert rule and AST into the database
  await pool.query('INSERT INTO rules (rule_string) VALUES ($1)', [ruleString]);
  res.redirect('/');
});

// Combine rules
app.post('/combine-rules', async (req, res) => {
  const ruleIds = req.body.rules.split(',').map(Number);
  const rules = await pool.query('SELECT rule_string FROM rules WHERE id = ANY($1)', [ruleIds]);
  const combinedAst = combine_rules(rules.rows.map(row => row.rule_string));
  res.redirect('/');
});

// Evaluate rule
app.post('/evaluate-rule', (req, res) => {
  const data = JSON.parse(req.body.data);
  const ast = req.body.ast; // Fetch AST from the request or combine previous rules
  const result = evaluate_rule(ast, data);
  res.render('index', { result });
});


// Define a Node structure for the AST
class Node {
  constructor(type, value = null, left = null, right = null) {
    this.type = type; // "operator" or "operand"
    this.value = value; // condition 
    this.left = left; // left child
    this.right = right; // right child
  }
}

// Utility function to parse simple conditions
function parseCondition(condition) {
  const [attribute, operator, value] = condition.split(' ');
  return {
    attribute,
    operator,
    value: value.replace(/['"]+/g, '') // Remove quotes for strings like 'Sales'
  };
}

// Function to parse a rule string into an AST
function create_rule(rule_string) {
  // Remove unnecessary spaces
  rule_string = rule_string.replace(/\s+/g, '');

  // Stack to store nodes
  const nodeStack = [];

  // Stack to store operators (AND, OR)
  const operatorStack = [];

  let current = ''; // To build conditions

  for (let i = 0; i < rule_string.length; i++) {
    const char = rule_string[i];

    if (char === '(') {
      // New sub-expression, push to the stack
      continue;
    }

    if (char === ')') {
      // End of sub-expression
      if (current) {
        // Parse condition
        nodeStack.push(new Node('operand', parseCondition(current)));
        current = '';
      }

      // Pop operator stack and combine with nodes
      while (operatorStack.length) {
        const operator = operatorStack.pop();
        const right = nodeStack.pop();
        const left = nodeStack.pop();

        nodeStack.push(new Node('operator', operator, left, right));
      }
    } else if (char === 'A' || char === 'O') {
      // Handle operators (AND or OR)
      if (current) {
        nodeStack.push(new Node('operand', parseCondition(current)));
        current = '';
      }

      // Push operator to the stack
      operatorStack.push(rule_string.substring(i, i + 3)); // AND or OR
      i += 2;
    } else {
      // Build condition (e.g., age > 30)
      current += char;
    }
  }

  return nodeStack.pop(); // Return the root of the AST
}

// Function to combine multiple ASTs using a specified operator
function combine_rules(rule_asts, operator = 'AND') {
    if (!rule_asts.length) {
      return null;
    }
  
    // Start by combining two rules
    let combinedAst = new Node('operator', operator, rule_asts[0], rule_asts[1]);
  
    // If there are more than two rules, combine iteratively
    for (let i = 2; i < rule_asts.length; i++) {
      combinedAst = new Node('operator', operator, combinedAst, rule_asts[i]);
    }
  
    return combinedAst; // Return the root of the combined AST
  }

  
  // Helper function to evaluate a single condition
function evaluateCondition(condition, data) {
    const { attribute, operator, value } = condition;
    const actualValue = data[attribute];
  
    switch (operator) {
      case '>':
        return actualValue > Number(value);
      case '<':
        return actualValue < Number(value);
      case '=':
        return actualValue === value;
      default:
        throw new Error(`Unsupported operator: ${operator}`);
    }
  }
  
  // Function to evaluate the AST against user data
  function evaluate_rule(ast, data) {
    if (!ast) return false;
  
    // If it's an operand, evaluate the condition
    if (ast.type === 'operand') {
      return evaluateCondition(ast.value, data);
    }
  
    // If it's an operator, evaluate the left and right children
    const leftEval = evaluate_rule(ast.left, data);
    const rightEval = evaluate_rule(ast.right, data);
  
    // Apply the operator (AND, OR)
    if (ast.value === 'AND') {
      return leftEval && rightEval;
    } else if (ast.value === 'OR') {
      return leftEval || rightEval;
    }
  
    throw new Error(`Unsupported operator: ${ast.value}`);
  }  


// Start the server
app.listen(3000, () => console.log('Server running on port 3000'));
