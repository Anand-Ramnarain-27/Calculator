document.addEventListener("DOMContentLoaded", function () {
  const expressionDisplay = document.getElementById("expression");
  const resultDisplay = document.getElementById("result");
  const buttons = document.querySelectorAll("#buttons button");

  let expression = "";
  let currentInput = "";
  let result = "";

  const operations = {
    add: (a, b) => a + b,
    subtract: (a, b) => a - b,
    multiply: (a, b) => a * b,
    divide: (a, b) => (b !== 0 ? a / b : "Error"),
    square: (a) => a * a,
    sqrt: (a) => Math.sqrt(a),
    sin: (a) => Math.sin((a * Math.PI) / 180),
    cos: (a) => Math.cos((a * Math.PI) / 180),
    tan: (a) => Math.tan((a * Math.PI) / 180),
    log: (a) => Math.log10(a),
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
    currentInput = currentInput ? currentInput + number : number;
    expression += number;
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
          result = "";
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
        handleSquare();
        break;
      case "sqrt":
        handleSqrt();
        break;
      case "sin":
      case "cos":
      case "tan":
      case "log":
        handleScientificFunction(action);
        break;
      default:
        handleOperator(action, buttonText);
        break;
    }
  };

  const handleSquare = () => {
    if (currentInput) {
      const num = parseFloat(currentInput);
      expression += `²`;
      currentInput = `Math.pow(${num}, 2)`; // Prepare for evaluation
      updateDisplays();
    }
  };

  const handleSqrt = () => {
    if (currentInput) {
      const num = parseFloat(currentInput);
      if (num < 0) {
        result = "Error";
      } else {
        expression = expression.slice(0, -currentInput.length);
        expression += `√(${num})`;
        currentInput = `Math.sqrt(${num})`;
      }
      updateDisplays();
    }
  };

  const handleScientificFunction = (action) => {
    if (currentInput || result) {
      const num = parseFloat(currentInput || result);
      let functionCall;

      switch (action) {
        case "sin":
          functionCall = `Math.sin(${(num * Math.PI) / 180})`;
          break;
        case "cos":
          functionCall = `Math.cos(${(num * Math.PI) / 180})`;
          break;
        case "tan":
          functionCall = `Math.tan(${(num * Math.PI) / 180})`;
          break;
        case "log":
          functionCall = `Math.log10(${num})`;
          break;
        default:
          functionCall = "Error";
      }

      expression = expression.slice(0, -currentInput.length);
      expression += `${action}(${num})`;
      currentInput = functionCall;
      result = "";
      updateDisplays();
    } else {
      alert("Please enter a number before using scientific functions.");
    }
  };

  const handleOperator = (action, buttonText) => {
    if (currentInput || result) {
      if (result) {
        expression = result;
        result = "";
      }

      expression += ` ${buttonText} `;
      currentInput = "";
    }
    updateDisplays();
  };

  const evaluateExpression = (expr) => {
    const sanitizedExpr = expr
      .replace(/π/g, Math.PI)
      .replace(/sin/g, "Math.sin")
      .replace(/cos/g, "Math.cos")
      .replace(/tan/g, "Math.tan")
      .replace(/log/g, "Math.log10")
      .replace(/√/g, "Math.sqrt")
      .replace(/\²/g, "**2")
      .replace(/Math\.(sin|cos|tan)\((\d+(\.\d+)?)\)/g, (match, func, num) => {
        const radians = (parseFloat(num) * Math.PI) / 180;
        return `Math.${func}(${radians})`;
      });

    try {
      return Function('"use strict"; return (' + sanitizedExpr + ")")();
    } catch (e) {
      return "Error";
    }
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
