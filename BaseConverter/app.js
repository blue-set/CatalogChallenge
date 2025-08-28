// Load test case from server
async function loadTestCase(caseNumber) {
    try {
        const response = await fetch(`/api/testcase/${caseNumber}`);
        const result = await response.json();
        
        if (result.success) {
            document.getElementById('jsonInput').value = JSON.stringify(result.data, null, 2);
            showNotification(`Test case ${caseNumber} loaded successfully`, 'success');
        } else {
            showNotification(`Error loading test case ${caseNumber}: ${result.error}`, 'error');
        }
    } catch (error) {
        showNotification(`Error loading test case ${caseNumber}: ${error.message}`, 'error');
    }
}

// Clear input
function clearInput() {
    document.getElementById('jsonInput').value = '';
    document.getElementById('results').innerHTML = '';
}

// Solve for the secret
async function solveSecret() {
    const jsonInput = document.getElementById('jsonInput').value.trim();
    
    if (!jsonInput) {
        showNotification('Please enter JSON input', 'error');
        return;
    }
    
    try {
        // Parse JSON to validate
        const jsonData = JSON.parse(jsonInput);
        
        // Show loading state
        showLoading();
        
        // Send to server for processing
        const response = await fetch('/api/solve', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(jsonData)
        });
        
        const result = await response.json();
        
        if (result.success) {
            showResult(result);
        } else {
            showError(result.error);
        }
        
    } catch (error) {
        if (error instanceof SyntaxError) {
            showError('Invalid JSON format. Please check your input.');
        } else {
            showError(`Error: ${error.message}`);
        }
    }
}

// Show loading state
function showLoading() {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="card mt-4">
            <div class="card-body text-center">
                <div class="spinner-border text-primary" role="status">
                    <span class="visually-hidden">Loading...</span>
                </div>
                <p class="mt-2">Calculating secret using Lagrange interpolation...</p>
            </div>
        </div>
    `;
}

// Show successful result
function showResult(result) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="card result-card">
            <div class="card-header bg-success text-white">
                <h5 class="mb-0">
                    <i class="fas fa-check-circle me-2"></i>
                    Secret Successfully Calculated
                </h5>
            </div>
            <div class="card-body">
                <div class="points-info">
                    <strong>Configuration:</strong> Using ${result.pointsUsed} out of ${result.n} points (minimum ${result.k} required)
                </div>
                
                <h6><i class="fas fa-key me-2"></i>Reconstructed Secret:</h6>
                <div class="secret-display">
                    ${result.secret}
                </div>
                
                <div class="row mt-3">
                    <div class="col-md-4">
                        <div class="bg-light p-3 rounded text-center">
                            <h6 class="text-muted mb-1">Total Points (n)</h6>
                            <h4 class="mb-0 text-primary">${result.n}</h4>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light p-3 rounded text-center">
                            <h6 class="text-muted mb-1">Required (k)</h6>
                            <h4 class="mb-0 text-success">${result.k}</h4>
                        </div>
                    </div>
                    <div class="col-md-4">
                        <div class="bg-light p-3 rounded text-center">
                            <h6 class="text-muted mb-1">Points Used</h6>
                            <h4 class="mb-0 text-info">${result.pointsUsed}</h4>
                        </div>
                    </div>
                </div>
                
                <div class="alert alert-info mt-3">
                    <i class="fas fa-info-circle me-2"></i>
                    <strong>Algorithm:</strong> This secret was reconstructed using Lagrange interpolation 
                    to evaluate the polynomial at x=0, which represents the secret coefficient.
                </div>
            </div>
        </div>
    `;
}

// Show error result
function showError(errorMessage) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = `
        <div class="card error-card">
            <div class="card-header bg-danger text-white">
                <h5 class="mb-0">
                    <i class="fas fa-exclamation-triangle me-2"></i>
                    Calculation Error
                </h5>
            </div>
            <div class="card-body">
                <div class="alert alert-danger">
                    <i class="fas fa-times-circle me-2"></i>
                    ${errorMessage}
                </div>
                <p class="text-muted">
                    Please check your JSON input format and ensure it contains valid shares 
                    with proper base encodings.
                </p>
            </div>
        </div>
    `;
}

// Show notification
function showNotification(message, type) {
    const alertClass = type === 'success' ? 'alert-success' : 'alert-danger';
    const icon = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-triangle';
    
    const notification = document.createElement('div');
    notification.className = `alert ${alertClass} alert-dismissible fade show position-fixed`;
    notification.style.cssText = 'top: 20px; right: 20px; z-index: 1050; min-width: 300px;';
    notification.innerHTML = `
        <i class="${icon} me-2"></i>
        ${message}
        <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
    `;
    
    document.body.appendChild(notification);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Add some example text to the input
    const exampleText = `// Load a test case using the buttons above or paste your JSON here
// Expected format:
{
  "keys": {
    "n": 4,
    "k": 3
  },
  "1": {
    "base": "10",
    "value": "4"
  },
  "2": {
    "base": "2", 
    "value": "111"
  },
  "3": {
    "base": "10",
    "value": "12"
  }
}`;
    
    document.getElementById('jsonInput').placeholder = exampleText;
});
