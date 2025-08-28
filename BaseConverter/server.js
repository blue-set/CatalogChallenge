const express = require('express');
const path = require('path');
const fs = require('fs');
const bigInt = require('big-integer');

const app = express();
const PORT = 5000;

// Middleware
app.use(express.static('.'));
app.use(express.json());

// Parse BigInt from string in given base
function parseBigInt(valueStr, base) {
    let result = bigInt(0);
    const bigBase = bigInt(base);
    
    for (let i = 0; i < valueStr.length; i++) {
        const char = valueStr[i].toLowerCase();
        let digit;
        
        if (char >= '0' && char <= '9') {
            digit = char.charCodeAt(0) - '0'.charCodeAt(0);
        } else if (char >= 'a' && char <= 'z') {
            digit = char.charCodeAt(0) - 'a'.charCodeAt(0) + 10;
        } else {
            throw new Error(`Invalid digit '${char}' for base ${base}`);
        }
        
        if (digit >= base) {
            throw new Error(`Invalid digit '${char}' for base ${base}`);
        }
        
        result = result.multiply(bigBase).add(digit);
    }
    
    return result;
}

// Extended Euclidean Algorithm for modular inverse
function extendedGCD(a, b) {
    if (a.equals(0)) {
        return { gcd: b, x: bigInt(0), y: bigInt(1) };
    }
    
    const result = extendedGCD(b.mod(a), a);
    const x = result.y.subtract(b.divide(a).multiply(result.x));
    const y = result.x;
    
    return { gcd: result.gcd, x: x, y: y };
}

// Modular inverse using extended Euclidean algorithm
function modInverse(a, m) {
    const result = extendedGCD(a, m);
    if (!result.gcd.equals(1)) {
        throw new Error('Modular inverse does not exist');
    }
    return result.x.mod(m).add(m).mod(m);
}

// Lagrange interpolation to find secret at x=0
function lagrangeInterpolation(points) {
    let secret = bigInt(0);
    const k = points.length;
    
    for (let j = 0; j < k; j++) {
        const xj = points[j].x;
        const yj = points[j].y;
        
        let numerator = bigInt(1);
        let denominator = bigInt(1);
        
        for (let i = 0; i < k; i++) {
            if (i === j) continue;
            
            const xi = points[i].x;
            
            // For x=0: numerator *= (0 - xi) = -xi
            numerator = numerator.multiply(xi.negate());
            // denominator *= (xj - xi)
            denominator = denominator.multiply(xj.subtract(xi));
        }
        
        // Calculate the Lagrange basis polynomial at x=0
        // We need to handle division carefully with big integers
        let term;
        
        if (denominator.isNegative()) {
            denominator = denominator.negate();
            numerator = numerator.negate();
        }
        
        // For exact division, we multiply yj by numerator and divide by denominator
        term = yj.multiply(numerator).divide(denominator);
        secret = secret.add(term);
    }
    
    return secret;
}

// Solve for secret using the JSON data
function findSecret(jsonData) {
    try {
        const k = parseInt(jsonData.keys.k);
        const n = parseInt(jsonData.keys.n);
        
        console.log(`Total points (n): ${n}, Points needed (k): ${k}`);
        
        // Decode the points (x, y)
        const points = [];
        
        for (const [key, value] of Object.entries(jsonData)) {
            if (key !== 'keys' && points.length < k) {
                const x = bigInt(key);
                const base = parseInt(value.base);
                const valueStr = value.value;
                const y = parseBigInt(valueStr, base);
                
                points.push({ x: x, y: y });
                console.log(`Point ${points.length}: x=${x}, y=${y} (base ${base}: ${valueStr})`);
            }
        }
        
        if (points.length < k) {
            throw new Error(`Not enough points. Need ${k}, got ${points.length}`);
        }
        
        console.log(`Using first ${points.length} decoded points.`);
        
        // Find the secret using Lagrange interpolation
        const secret = lagrangeInterpolation(points);
        
        return {
            success: true,
            secret: secret.toString(),
            pointsUsed: points.length,
            k: k,
            n: n
        };
        
    } catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}

// API endpoint to solve for secret
app.post('/api/solve', (req, res) => {
    try {
        const result = findSecret(req.body);
        res.json(result);
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API endpoint to load test cases
app.get('/api/testcase/:id', (req, res) => {
    try {
        const id = req.params.id;
        const filePath = `testcase${id}.json`;
        
        if (!fs.existsSync(filePath)) {
            return res.status(404).json({
                success: false,
                error: `Test case ${id} not found`
            });
        }
        
        const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        res.json({
            success: true,
            data: data
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// Serve the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.listen(PORT, '0.0.0.0', () => {
    console.log(`Shamir's Secret Sharing server running on http://0.0.0.0:${PORT}`);
});
