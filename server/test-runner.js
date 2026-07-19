const { spawnSync } = require('child_process');

function runCurl(args) {
  const result = spawnSync('curl.exe', args, { encoding: 'utf-8' });
  console.log(result.stdout);
}

console.log("=== Testing Signup ===");
runCurl(['-s', '-c', 'cookies.txt', '-b', 'cookies.txt', '-X', 'POST', 'http://localhost:4000/api/auth/signup', '-H', 'Content-Type: application/json', '-d', JSON.stringify({username: "testuser", email: "testuser@example.com", password: "password123"})]);

console.log("\n=== Testing /me ===");
runCurl(['-s', '-c', 'cookies.txt', '-b', 'cookies.txt', 'http://localhost:4000/api/auth/me']);

console.log("\n=== Testing Logout ===");
runCurl(['-s', '-c', 'cookies.txt', '-b', 'cookies.txt', '-X', 'POST', 'http://localhost:4000/api/auth/logout']);

console.log("\n=== Testing /me after logout ===");
runCurl(['-s', '-c', 'cookies.txt', '-b', 'cookies.txt', 'http://localhost:4000/api/auth/me']);

console.log("\n=== Testing Login (Real User) ===");
runCurl(['-s', '-c', 'cookies.txt', '-b', 'cookies.txt', '-X', 'POST', 'http://localhost:4000/api/auth/login', '-H', 'Content-Type: application/json', '-d', JSON.stringify({email: "george@example.com", password: "password123"})]);
