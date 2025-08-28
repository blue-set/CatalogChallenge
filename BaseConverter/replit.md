# Overview

This is a web application that implements **Shamir's Secret Sharing** using **Lagrange Interpolation** to solve for secret values. The application allows users to input JSON data containing polynomial points with different numerical bases, then calculates the secret (the y-intercept at x=0) using mathematical interpolation. It's designed as an educational tool for understanding cryptographic secret sharing schemes.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Technology Stack**: Pure HTML5, CSS3, and vanilla JavaScript
- **UI Framework**: Bootstrap 5.1.3 for responsive design and components
- **Styling**: Custom CSS with gradient backgrounds and modern card-based layout
- **Icons**: Font Awesome 6.0.0 for visual elements
- **Architecture Pattern**: Client-side rendering with AJAX API calls

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **API Design**: RESTful endpoints for test case loading and secret solving
- **Mathematical Processing**: Custom implementation using big-integer library for arbitrary precision arithmetic
- **File Structure**: Single server file with modular function organization

## Core Mathematical Components
- **Number Base Conversion**: Custom parser supporting bases 2-36 with validation
- **Lagrange Interpolation**: Implementation using modular arithmetic and extended Euclidean algorithm
- **Big Integer Support**: Handles large numbers that exceed JavaScript's native number precision
- **Modular Inverse Calculation**: Extended GCD algorithm for cryptographic operations

## API Endpoints
- `GET /api/testcase/:caseNumber` - Loads predefined test cases from JSON files
- `POST /api/solve` - Processes input data and returns the calculated secret
- Static file serving for frontend assets

## Data Processing Flow
1. **Input Validation**: JSON parsing and structure verification
2. **Base Conversion**: Converts values from various bases to decimal BigInt
3. **Point Extraction**: Creates coordinate pairs (x, y) from the input data
4. **Interpolation**: Applies Lagrange interpolation formula to find P(0)
5. **Result Formatting**: Returns the secret value with success/error status

# External Dependencies

## NPM Packages
- **express**: Web framework for Node.js server and routing
- **big-integer**: Arbitrary precision integer arithmetic library for handling large numbers in cryptographic calculations

## CDN Resources
- **Bootstrap 5.1.3**: CSS framework for responsive UI components
- **Font Awesome 6.0.0**: Icon library for enhanced user interface

## Test Data
- **testcase1.json**: Simple test case with 4 points using various bases
- **testcase2.json**: Complex test case with 10 points for advanced testing
- **C++ Reference**: Attached implementation guide for mathematical validation

## Browser APIs
- **Fetch API**: For client-server communication
- **JSON**: For data serialization and parsing
- **DOM Manipulation**: For dynamic UI updates and user interaction