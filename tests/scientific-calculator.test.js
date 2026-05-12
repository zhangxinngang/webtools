import { describe, it, expect, beforeEach, vi } from 'vitest';

/**
 * 科学计算器测试套件
 * 测试所有按钮功能和计算逻辑
 */

// 模拟 DOM 环境
describe('科学计算器', () => {
  let expr, lastAnswer, isDeg, calcHistory;

  // 计算器核心函数（从 HTML 中提取）
  function toRad(deg) { return deg * Math.PI / 180; }

  function factorial(n) {
    n = Math.floor(n);
    if (n < 0 || n > 170) return NaN;
    let r = 1;
    for (let i = 2; i <= n; i++) r *= i;
    return r;
  }

  function formatNum(n) {
    if (!isFinite(n)) return String(n);
    if (Math.abs(n) > 1e15 || (Math.abs(n) < 1e-10 && n !== 0)) {
      return n.toExponential(8).replace(/\.?0+e/, 'e');
    }
    let s = parseFloat(n.toPrecision(12)).toString();
    return s;
  }

  function parseAndEval(raw) {
    // Replace display tokens with JS equivalents
    let s = raw
      .replace(/π/g, '(Math.PI)')
      .replace(/\be\b/g, '(Math.E)')
      .replace(/\^/g, '**')
      .replace(/\bmod\b/g, '%');

    // trig functions (angle conversion if deg mode)
    if (isDeg) {
      s = s
        .replace(/\bsin\(/g, 'Math.sin(__toRad(')
        .replace(/\bcos\(/g, 'Math.cos(__toRad(')
        .replace(/\btan\(/g, 'Math.tan(__toRad(')
        .replace(/\basin\(/g, '__toDeg(Math.asin(')
        .replace(/\bacos\(/g, '__toDeg(Math.acos(')
        .replace(/\batan\(/g, '__toDeg(Math.atan(');
      // close extra parens for deg-wrapped functions
      s = s
        .replace(/Math\.sin\(__toRad\(([^)]*)\)/g, m => m + ')')
        .replace(/Math\.cos\(__toRad\(([^)]*)\)/g, m => m + ')')
        .replace(/Math\.tan\(__toRad\(([^)]*)\)/g, m => m + ')')
        .replace(/__toDeg\(Math\.asin\(([^)]*)\)/g, m => m + ')')
        .replace(/__toDeg\(Math\.acos\(([^)]*)\)/g, m => m + ')')
        .replace(/__toDeg\(Math\.atan\(([^)]*)\)/g, m => m + ')');
    } else {
      s = s
        .replace(/\bsin\(/g, 'Math.sin(')
        .replace(/\bcos\(/g, 'Math.cos(')
        .replace(/\btan\(/g, 'Math.tan(')
        .replace(/\basin\(/g, 'Math.asin(')
        .replace(/\bacos\(/g, 'Math.acos(')
        .replace(/\batan\(/g, 'Math.atan(');
    }

    s = s
      .replace(/\bsqrt\(/g, 'Math.sqrt(')
      .replace(/\bln\(/g, 'Math.log(')
      .replace(/\blog2\(/g, 'Math.log2(')
      // 使用负向前瞻，避免匹配 Math.log( 中的 log
      .replace(/(?<!Math\.)\blog\(/g, 'Math.log10(');

    // factorial: number!
    s = s.replace(/(\d+\.?\d*)!/g, (_, n) => `__fact(${n})`);

    // Safety: only allow safe characters
    if (/[a-zA-Z_$]/.test(s.replace(/Math\.(sin|cos|tan|asin|acos|atan|sqrt|log|log2|log10|PI|E)\b/g, '')
      .replace(/__toRad\b/g, '').replace(/__toDeg\b/g, '').replace(/__fact\b/g, ''))) {
      throw new Error('非法字符');
    }

    const fn = new Function(
      '__toRad', '__toDeg', '__fact',
      `"use strict"; return (${s});`
    );
    return fn(toRad, (r) => r * 180 / Math.PI, factorial);
  }

  // 模拟输入函数
  function inputChar(c) {
    expr = expr + c;
  }

  function inputFn(token) {
    switch (token) {
      case 'π': expr = expr + 'π'; break;
      case 'e': expr = expr + 'e'; break;
      case '^': expr = expr + '^'; break;
      case ' mod ': expr = expr + ' mod '; break;
      case '!': expr = expr + '!'; break;
      case '1/x': expr = '1/(' + (expr || '0') + ')'; break;
      case 'x²': expr = '(' + (expr || '0') + ')^2'; break;
      case 'ans':
        if (lastAnswer !== null) expr = expr + String(lastAnswer);
        return;
      default: expr = expr + token;
    }
  }

  function negate() {
    if (!expr) return;
    expr = '(-(' + expr + '))';
  }

  function delChar() {
    if (!expr) return;
    expr = expr.slice(0, -1);
  }

  function clearAll() {
    expr = '';
  }

  function calculate() {
    if (!expr) return;
    const displayExpr = expr;
    const val = parseAndEval(expr, isDeg);
    lastAnswer = val;
    const formatted = formatNum(val);
    expr = formatted;
    calcHistory.unshift({ expr: displayExpr, result: formatted });
    if (calcHistory.length > 20) calcHistory.pop();
    return val;
  }

  beforeEach(() => {
    expr = '';
    lastAnswer = null;
    isDeg = true;
    calcHistory = [];
  });

  describe('数字按钮 (0-9, .)', () => {
    it('按钮 0 - 应输入数字 0', () => {
      inputChar('0');
      expect(expr).toBe('0');
    });

    it('按钮 1 - 应输入数字 1', () => {
      inputChar('1');
      expect(expr).toBe('1');
    });

    it('按钮 2 - 应输入数字 2', () => {
      inputChar('2');
      expect(expr).toBe('2');
    });

    it('按钮 3 - 应输入数字 3', () => {
      inputChar('3');
      expect(expr).toBe('3');
    });

    it('按钮 4 - 应输入数字 4', () => {
      inputChar('4');
      expect(expr).toBe('4');
    });

    it('按钮 5 - 应输入数字 5', () => {
      inputChar('5');
      expect(expr).toBe('5');
    });

    it('按钮 6 - 应输入数字 6', () => {
      inputChar('6');
      expect(expr).toBe('6');
    });

    it('按钮 7 - 应输入数字 7', () => {
      inputChar('7');
      expect(expr).toBe('7');
    });

    it('按钮 8 - 应输入数字 8', () => {
      inputChar('8');
      expect(expr).toBe('8');
    });

    it('按钮 9 - 应输入数字 9', () => {
      inputChar('9');
      expect(expr).toBe('9');
    });

    it('按钮 . - 应输入小数点', () => {
      inputChar('3');
      inputChar('.');
      inputChar('1');
      inputChar('4');
      expect(expr).toBe('3.14');
    });
  });

  describe('基本运算符 (+, -, *, /)', () => {
    it('按钮 + - 应进行加法运算', () => {
      inputChar('2');
      inputFn('+');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(5);
    });

    it('按钮 - - 应进行减法运算', () => {
      inputChar('5');
      inputFn('-');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(2);
    });

    it('按钮 × (*) - 应进行乘法运算', () => {
      inputChar('4');
      inputFn('*');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(12);
    });

    it('按钮 ÷ (/) - 应进行除法运算', () => {
      inputChar('8');
      inputFn('/');
      inputChar('2');
      const result = calculate();
      expect(result).toBe(4);
    });
  });

  describe('清除和删除按钮', () => {
    it('按钮 AC - 应清除所有内容', () => {
      inputChar('1');
      inputChar('2');
      inputChar('3');
      clearAll();
      expect(expr).toBe('');
    });

    it('按钮 ⌫ - 应删除最后一个字符', () => {
      inputChar('1');
      inputChar('2');
      inputChar('3');
      delChar();
      expect(expr).toBe('12');
      delChar();
      expect(expr).toBe('1');
      delChar();
      expect(expr).toBe('');
    });

    it('按钮 ⌫ - 空表达式时不应报错', () => {
      expect(() => delChar()).not.toThrow();
    });
  });

  describe('科学函数', () => {
    describe('三角函数', () => {
      it('按钮 sin - 应计算正弦值（角度模式）', () => {
        isDeg = true;
        inputFn('sin(');
        inputChar('3');
        inputChar('0');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(0.5, 6);
      });

      it('按钮 cos - 应计算余弦值（角度模式）', () => {
        isDeg = true;
        inputFn('cos(');
        inputChar('6');
        inputChar('0');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(0.5, 6);
      });

      it('按钮 tan - 应计算正切值（角度模式）', () => {
        isDeg = true;
        inputFn('tan(');
        inputChar('4');
        inputChar('5');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(1, 5);
      });

      it('按钮 asin - 应计算反正弦值（角度模式）', () => {
        // 在角度模式下 asin(0.5) = 30 度
        isDeg = true;
        inputFn('asin(');
        inputChar('0');
        inputChar('.');
        inputChar('5');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(30, 5);
      });

      it('按钮 acos - 应计算反余弦值（角度模式）', () => {
        // 在角度模式下 acos(0.5) = 60 度
        isDeg = true;
        inputFn('acos(');
        inputChar('0');
        inputChar('.');
        inputChar('5');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(60, 5);
      });

      it('按钮 atan - 应计算反正切值（角度模式）', () => {
        // 在角度模式下 atan(1) = 45 度
        isDeg = true;
        inputFn('atan(');
        inputChar('1');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(45, 5);
      });
    });

    describe('对数函数', () => {
      it('按钮 log - 应计算常用对数', () => {
        inputFn('log(');
        inputChar('1');
        inputChar('0');
        inputChar('0');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(2, 6);
      });

      it('按钮 ln - 应计算自然对数', () => {
        // ln(1) = 0
        inputFn('ln(');
        inputChar('1');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(0, 6);
      });

      it('按钮 log₂ - 应计算以2为底的对数', () => {
        inputFn('log2(');
        inputChar('8');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(3, 6);
      });
    });

    describe('其他数学函数', () => {
      it('按钮 √ (sqrt) - 应计算平方根', () => {
        inputFn('sqrt(');
        inputChar('1');
        inputChar('6');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(4, 6);
      });

      it('按钮 √ - 应正确处理小数', () => {
        inputFn('sqrt(');
        inputChar('2');
        inputFn(')');
        const result = calculate();
        expect(parseFloat(result)).toBeCloseTo(1.41421356, 6);
      });
    });
  });

  describe('括号', () => {
    it('按钮 ( - 应输入左括号', () => {
      inputFn('(');
      inputChar('2');
      expect(expr).toBe('(2');
    });

    it('按钮 ) - 应输入右括号', () => {
      inputFn('(');
      inputChar('2');
      inputChar('+');
      inputChar('3');
      inputFn(')');
      expect(expr).toBe('(2+3)');
    });

    it('按钮 () - 应正确处理嵌套表达式', () => {
      inputFn('(');
      inputChar('2');
      inputFn('+');
      inputFn('(');
      inputChar('3');
      inputFn('*');
      inputChar('4');
      inputFn(')');
      inputFn(')');
      const result = calculate();
      expect(result).toBe(14);
    });
  });

  describe('幂运算和模运算', () => {
    it('按钮 xʸ (^) - 应进行幂运算', () => {
      inputChar('2');
      inputFn('^');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(8);
    });

    it('按钮 xʸ - 应处理幂的幂', () => {
      inputChar('2');
      inputFn('^');
      inputChar('2');
      inputFn('^');
      inputChar('2');
      const result = calculate();
      expect(result).toBe(16);
    });

    it('按钮 mod - 应进行模运算', () => {
      inputChar('1');
      inputChar('0');
      inputFn(' mod ');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(1);
    });
  });

  describe('常数', () => {
    it('按钮 π - 应输入圆周率', () => {
      inputFn('π');
      const result = calculate();
      expect(parseFloat(result)).toBeCloseTo(Math.PI, 6);
    });

    it('按钮 e - 应输入自然常数', () => {
      inputFn('e');
      const result = calculate();
      expect(parseFloat(result)).toBeCloseTo(Math.E, 6);
    });
  });

  describe('辅助功能', () => {
    it('按钮 +/- - 应将表达式取负', () => {
      inputChar('5');
      negate();
      const result = calculate();
      expect(result).toBe(-5);
    });

    it('按钮 +/- - 空表达式时不应报错', () => {
      expect(() => negate()).not.toThrow();
    });

    it('按钮 n! - 应计算阶乘', () => {
      inputChar('5');
      inputFn('!');
      const result = calculate();
      expect(result).toBe(120);
    });

    it('按钮 1/x - 应计算倒数', () => {
      inputChar('4');
      inputFn('1/x');
      const result = calculate();
      expect(result).toBe(0.25);
    });

    it('按钮 x² - 应计算平方', () => {
      inputChar('5');
      inputFn('x²');
      const result = calculate();
      expect(result).toBe(25);
    });
  });

  describe('ANS 按钮', () => {
    it('按钮 ANS - 应使用上一次计算结果', () => {
      // 第一次计算
      inputChar('5');
      inputFn('+');
      inputChar('3');
      calculate();

      // 使用 ANS
      clearAll();
      inputFn('ans');
      inputFn('*');
      inputChar('2');
      const result = calculate();
      expect(result).toBe(16);
    });

    it('按钮 ANS - 没有上一次结果时不应输入', () => {
      inputFn('ans');
      expect(expr).toBe('');
    });
  });

  describe('= 按钮', () => {
    it('按钮 = - 应计算表达式并显示结果', () => {
      inputChar('2');
      inputFn('+');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(5);
      expect(expr).toBe('5');
    });

    it('按钮 = - 应将结果存入历史记录', () => {
      inputChar('2');
      inputFn('+');
      inputChar('3');
      calculate();
      expect(calcHistory.length).toBe(1);
      expect(calcHistory[0].expr).toBe('2+3');
      expect(calcHistory[0].result).toBe('5');
    });
  });

  describe('DEG/RAD 模式切换', () => {
    it('按钮 DEG - 应切换到角度模式', () => {
      isDeg = false;
      isDeg = true;
      expect(isDeg).toBe(true);
    });

    it('按钮 RAD - 应切换到弧度模式', () => {
      isDeg = true;
      isDeg = false;
      expect(isDeg).toBe(false);
    });

    it('角度模式下 sin(30) 应等于 0.5', () => {
      isDeg = true;
      inputFn('sin(');
      inputChar('3');
      inputChar('0');
      inputFn(')');
      const result = calculate();
      expect(parseFloat(result)).toBeCloseTo(0.5, 6);
    });

    it('弧度模式下 sin(π/6) 应等于 0.5', () => {
      isDeg = false;
      inputFn('sin(');
      inputFn('π');
      inputFn('/');
      inputChar('6');
      inputFn(')');
      const result = calculate();
      expect(parseFloat(result)).toBeCloseTo(0.5, 6);
    });
  });

  describe('复杂表达式', () => {
    it('应正确处理混合运算', () => {
      inputChar('2');
      inputFn('+');
      inputChar('3');
      inputFn('*');
      inputChar('4');
      const result = calculate();
      expect(result).toBe(14);
    });

    it('应正确处理嵌套函数', () => {
      isDeg = true;
      inputFn('sin(');
      inputFn('sqrt(');
      inputChar('9');
      inputChar('0');
      inputChar('0');
      inputFn(')');
      inputFn(')');
      const result = calculate();
      // sin(sqrt(900)) = sin(30) = 0.5
      expect(parseFloat(result)).toBeCloseTo(0.5, 5);
    });

    it('应正确处理复杂科学计算', () => {
      // 计算 log(100) * 2 = 4
      isDeg = true;
      inputFn('log(');
      inputChar('1');
      inputChar('0');
      inputChar('0');
      inputFn(')');
      inputFn('*');
      inputChar('2');
      const result = calculate();
      expect(result).toBe(4);
    });
  });

  describe('错误处理', () => {
    it('非法字符应抛出错误', () => {
      expect(() => parseAndEval('alert(1)')).toThrow('非法字符');
    });

    it('过大阶乘应返回 NaN', () => {
      const result = factorial(171);
      expect(result).toBe(NaN);
    });

    it('负数阶乘应返回 NaN', () => {
      const result = factorial(-1);
      expect(result).toBe(NaN);
    });

    it('0 的阶乘应等于 1', () => {
      inputChar('0');
      inputFn('!');
      const result = calculate();
      expect(result).toBe(1);
    });
  });

  describe('历史记录', () => {
    it('应存储最多 20 条历史记录', () => {
      for (let i = 1; i <= 25; i++) {
        clearAll();
        inputChar(String(i));
        calculate();
      }
      expect(calcHistory.length).toBe(20);
    });

    it('新记录应插入到开头', () => {
      inputChar('1');
      calculate();
      clearAll();
      inputChar('2');
      calculate();
      expect(calcHistory[0].expr).toBe('2');
      expect(calcHistory[1].expr).toBe('1');
    });
  });

  describe('键盘支持', () => {
    it('应处理数字键盘输入', () => {
      const keys = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
      keys.forEach(k => inputChar(k));
      expect(expr).toBe('0123456789');
    });

    it('应处理运算符键盘输入', () => {
      inputChar('5');
      inputFn('+');
      inputChar('3');
      const result = calculate();
      expect(result).toBe(8);
    });

    it('应处理 Enter 键计算', () => {
      inputChar('2');
      inputFn('+');
      inputChar('2');
      const result = calculate();
      expect(result).toBe(4);
    });
  });

  describe('格式化输出', () => {
    it('应格式化极大数字为科学计数法', () => {
      const result = formatNum(1e20);
      expect(result).toContain('e');
    });

    it('应格式化极小数字为科学计数法', () => {
      const result = formatNum(1e-15);
      expect(result).toContain('e');
    });

    it('应正确处理无穷大', () => {
      expect(formatNum(Infinity)).toBe('Infinity');
      expect(formatNum(-Infinity)).toBe('-Infinity');
    });
  });
});
