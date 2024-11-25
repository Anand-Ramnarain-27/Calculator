document.addEventListener("DOMContentLoaded", function () {
  const expressionDisplay = document.getElementById("expression");
  const resultDisplay = document.getElementById("result");
  const buttons = document.querySelectorAll("#buttons button");

  let expression = "";
  let currentInput = "";
  let result = "";

  const operators = {
    "+": (a, b) => a + b,
    "-": (a, b) => a - b,
    "*": (a, b) => a * b,
    "/": (a, b) => (b !== 0 ? a / b : "Error"),
    "^": (a, b) => Math.pow(a, b),
  };

  const functions = {
    sin: (a) => Math.sin((a * Math.PI) / 180),
    cos: (a) => Math.cos((a * Math.PI) / 180),
    tan: (a) => Math.tan((a * Math.PI) / 180),
    log: (a) => Math.log10(a),
    sqrt: (a) => Math.sqrt(a),
  };

  const updateDisplays = () => {
    expressionDisplay.textContent = expression || "";
    resultDisplay.textContent = result || "";
  };

  const clearCalculator = () => {
    expression = "";
    currentInput = "";
    result = "";
    updateDisplays();
  };

  const handleNumberInput = (number) => {
    if (
      number === "-" &&
      (currentInput === "" || isNaN(expression.slice(-1)))
    ) {
      currentInput = "-";
      expression += number;
    } else {
      currentInput += number;
      expression += number;
    }
    updateDisplays();
  };

  const handleAction = (action, buttonText) => {
    switch (action) {
      case "clear":
        clearCalculator();
        break;
      case "delete":
        if (currentInput) {
          currentInput = currentInput.slice(0, -1);
          expression = expression.slice(0, -1);
          result = " ";
        }
        updateDisplays();
        break;
      case "equals":
        try {
          result = evaluateExpression(expression);
          updateDisplays();
        } catch {
          result = "Error";
          updateDisplays();
        }
        break;
      case "pi":
        currentInput += Math.PI.toFixed(6);
        expression += "π";
        updateDisplays();
        break;
      case "square":
        if (currentInput) {
          currentInput = `(${currentInput})^2`;
          expression += "²";
        }
        updateDisplays();
        break;
      case "sqrt":
        if (currentInput) {
          expression = expression.slice(0, -currentInput.length);
          expression += `√(${currentInput})`;
          currentInput = `sqrt(${currentInput})`;
        }
        updateDisplays();
        break;
      case "subtract":
        handleNumberInput("-");
        break;

      case "open-bracket":
        expression += "(";
        currentInput = "";
        updateDisplays();
        break;
      case "close-bracket":
        if (
          expression.includes("(") &&
          (expression.match(/\(/g) || []).length >
            (expression.match(/\)/g) || []).length
        ) {
          expression += ")";
          currentInput = "";
          updateDisplays();
        }
        break;
      case "cos":
      case "sin":
      case "tan":
      case "log":
        if (currentInput) {
          expression = expression.slice(0, -currentInput.length);
          expression += `${action}(${currentInput})`;
          currentInput = `${action}(${currentInput})`;
        } else if (result) {
          expression += `${action}(${result})`;
          currentInput = `${action}(${result})`;
        } else {
          expression += `${action}()`;
          currentInput = `${action}()`;
        }
        updateDisplays();
        break;
      default:
        handleOperator(action, buttonText);
        updateDisplays();
        break;
    }
  };

  const handleOperator = (action, buttonText) => {
    if (currentInput || result) {
      if (result) {
        expression = result;
        result = "";
      }
      if (buttonText === "-") {
        expression += ` ${buttonText} `;
      } else {
        expression += ` ${buttonText} `;
      }
      currentInput = "";
    }
    updateDisplays();
  };

  const evaluateExpression = (expr) => {
    try {
      const tokens = tokenize(expr);
      const rpn = infixToRPN(tokens);
      return evaluateRPN(rpn);
    } catch {
      return "Error";
    }
  };

  const tokenize = (expr) => {
    return expr
      .replace(/²/g, "^2")
      .replace(/√/g, "sqrt")
      .match(/[\d.]+|[+\-*/^()]|sin|cos|tan|log|sqrt|π/g)
      .reduce((tokens, token, index, allTokens) => {
        if (
          token === "-" &&
          (index === 0 || "+-*/^(".includes(allTokens[index - 1]))
        ) {
          tokens.push(-parseFloat(allTokens[index + 1]) || "-");
          allTokens.splice(index + 1, 1);
        } else if (token === "π") {
          tokens.push(Math.PI);
        } else {
          tokens.push(isNaN(token) ? token : parseFloat(token));
        }
        return tokens;
      }, []);
  };

  const infixToRPN = (tokens) => {
    const output = [];
    const stack = [];
    const precedence = { "+": 1, "-": 1, "*": 2, "/": 2, "^": 3 };
    tokens.forEach((token) => {
      if (!isNaN(token)) {
        output.push(token);
      } else if (token in functions) {
        stack.push(token);
      } else if (token === "(") {
        stack.push(token);
      } else if (token === ")") {
        while (stack.length && stack[stack.length - 1] !== "(") {
          output.push(stack.pop());
        }
        stack.pop();
        if (stack.length && stack[stack.length - 1] in functions) {
          output.push(stack.pop());
        }
      } else {
        while (
          stack.length &&
          precedence[token] <= precedence[stack[stack.length - 1]]
        ) {
          output.push(stack.pop());
        }
        stack.push(token);
      }
    });
    while (stack.length) {
      output.push(stack.pop());
    }
    return output;
  };

  const evaluateRPN = (rpn) => {
    const stack = [];
    rpn.forEach((token) => {
      if (!isNaN(token)) {
        stack.push(token);
      } else if (token in operators) {
        const b = stack.pop();
        const a = stack.pop();
        stack.push(operators[token](a, b));
      } else if (token in functions) {
        const a = stack.pop();
        stack.push(functions[token](a));
      }
    });
    return stack[0];
  };

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const action = button.getAttribute("data-action");
      const buttonText = button.textContent;

      if (!action) {
        handleNumberInput(buttonText);
      } else {
        handleAction(action, buttonText);
      }
    });
  });
});
