Write-Host "=== Testing Signup ==="
curl.exe -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/signup -H "Content-Type: application/json" -d "{`"username`":`"testps1`",`"email`":`"testps1@test.com`",`"password`":`"password`"}"

Write-Host "`n=== Testing /me ==="
curl.exe -s -c cookies.txt -b cookies.txt http://localhost:4000/api/auth/me

Write-Host "`n=== Testing Logout ==="
curl.exe -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/logout

Write-Host "`n=== Testing /me again ==="
curl.exe -s -c cookies.txt -b cookies.txt http://localhost:4000/api/auth/me

Write-Host "`n=== Testing Login with Existing Real User ==="
curl.exe -s -c cookies.txt -b cookies.txt -X POST http://localhost:4000/api/auth/login -H "Content-Type: application/json" -d "{`"email`":`"george@example.com`",`"password`":`"password123`"}"
