#!/bin/bash
echo "=== Testing Signup ==="
curl -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/signup -H "Content-Type: application/json" -d '{"username":"testbash","email":"testbash@test.com","password":"password"}'

echo -e "\n\n=== Testing /me ==="
curl -s -c cookies.txt -b cookies.txt http://localhost:4000/api/auth/me

echo -e "\n\n=== Testing Logout ==="
curl -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/logout

echo -e "\n\n=== Testing /me again ==="
curl -s -c cookies.txt -b cookies.txt http://localhost:4000/api/auth/me

echo -e "\n\n=== Testing Login with Existing Real User ==="
curl -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d '{"email":"george@example.com","password":"password123"}'
