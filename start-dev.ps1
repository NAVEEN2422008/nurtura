# NURTURA Development Startup Script for Windows PowerShell
# This script starts all services needed for local development

"═══════════════════════════════════════════════════════════"
"  NURTURA MVP - Development Environment Startup"
"═══════════════════════════════════════════════════════════"
""

# Check if Docker is running
"⏳ Checking Docker status..."
try {
    docker info > $null 2>&1
    "✅ Docker is running"
} catch {
    "❌ Docker is not running. Please start Docker Desktop."
    exit 1
}

# Check if .env files exist
""
"⏳ Checking environment files..."
if ((Test-Path "backend\.env") -and (Test-Path "frontend\.env.local")) {
    "✅ Environment files found (.env and .env.local)"
} else {
    "⚠️  Environment files not found. Creating from examples..."
    if (!(Test-Path "backend\.env")) {
        Copy-Item "backend\.env.example" "backend\.env"
        "  ✓ Created backend/.env"
    }
    if (!(Test-Path "frontend\.env.local")) {
        Copy-Item "frontend\.env.example" "frontend\.env.local"
        "  ✓ Created frontend/.env.local"
    }
}

# Start Docker containers
"" 
"⏳ Starting Docker containers (MongoDB + Redis)..."
docker-compose up -d
$dockerStart = $LASTEXITCODE

if ($dockerStart -eq 0) {
    "✅ Docker containers started"
} else {
    "❌ Failed to start Docker containers"
    exit 1
}

# Wait for MongoDB to be ready
"⏳ Waiting for MongoDB to be ready..."
$maxAttempts = 30
$attempt = 0
while ($attempt -lt $maxAttempts) {
    try {
        docker exec nurtura_mongo mongosh -u root -p password --eval "db.adminCommand('ping')" > $null 2>&1
        if ($LASTEXITCODE -eq 0) {
            "✅ MongoDB is ready"
            break
        }
    } catch {}
    $attempt++
    Start-Sleep -Seconds 1
}

if ($attempt -eq $maxAttempts) {
    "⚠️  MongoDB may still be starting. You can proceed with the next steps."
}

""
"═══════════════════════════════════════════════════════════"
"  Ready to Start Servers"
"═══════════════════════════════════════════════════════════"
""
"Next steps (open 2 new PowerShell windows and run):"
""
"  Terminal 1 - Backend (http://localhost:3001):"
"    cd backend"
"    npm install  # (first time only)"
"    npm run dev"
""
"  Terminal 2 - Frontend (http://localhost:3000):"
"    cd frontend"
"    npm install  # (first time only)"
"    npm run dev"
""
"Then visit: http://localhost:3000"
""
"Demo Credentials:"
"  Email: demo@example.com"
"  Password: password123"
""
"To stop everything:"
"  docker-compose down"
""
"═══════════════════════════════════════════════════════════"
