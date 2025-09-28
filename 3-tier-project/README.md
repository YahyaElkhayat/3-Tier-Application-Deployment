# School Management System - Local Development

## What is this?

A simple 3-tier web application for managing school records:
- **Add/View Students**: Track student information with roll numbers and classes
- **Add/View Teachers**: Manage teacher profiles with subjects and assigned classes
- **Data Persistence**: All records stored in MySQL database

**Tech Stack:**
- Frontend: React.js with responsive UI
- Backend: Node.js/Express REST API
- Database: MySQL with automatic schema creation

## Local Development Setup

### Prerequisites
- Node.js 16+
- MySQL 8.0 (or Docker)
- Git

### 1. Database Setup
```bash
# Option A: Using Docker (recommended)
docker run --name mysql-local \
  -e MYSQL_ROOT_PASSWORD=rootpassword123 \
  -e MYSQL_DATABASE=school \
  -e MYSQL_USER=school_user \
  -e MYSQL_PASSWORD=password123 \
  -p 3306:3306 -d mysql:8.0

# Option B: Local MySQL installation
# Create database 'school' and user 'school_user' manually
```

### 2. Backend Setup
```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3500
# Database tables created automatically
```

### 3. Frontend Setup
```bash
cd frontend
npm install
npm start
# Runs on http://localhost:3000
```

### 4. Test the Application
- Open http://localhost:3000
- Navigate to /student to add/view students
- Navigate to /teacher to add/view teachers
- Backend API available at http://localhost:3500

## API Endpoints

```
GET  /student        - List all students
POST /addstudent     - Add new student
GET  /teacher        - List all teachers  
POST /addteacher     - Add new teacher
GET  /health         - Health check
```

## Challenge: Containerize & Deploy

Now that you have the application running locally, here's your challenge:

### Phase 1: Docker Challenge
**Your task**: Create Dockerfiles for each component and run the full stack with Docker

**What you need to figure out:**
- How to containerize a React production build
- How to handle Node.js dependencies in containers
- How to connect containers to each other
- How to handle environment variables

**Success criteria**: All three tiers running in separate containers with proper networking

### Phase 2: Kubernetes Challenge
**Your task**: Create Kubernetes manifests and deploy to a cluster

**What you need to research:**
- How to create Deployments, Services, and ConfigMaps
- How to handle persistent storage for MySQL
- How to manage secrets for database credentials
- How to enable communication between pods

**Success criteria**: Complete 3-tier application running in Kubernetes with persistent data

### Phase 3: Advanced Challenge
**Bonus challenges** (optional):
- Set up Ingress for external access
- Implement health checks and readiness probes
- Add horizontal pod autoscaling
- Create Helm charts for templating

## Learning Resources

**Docker:**
- Multi-stage builds for React apps
- Container networking and environment variables
- Docker Compose for local development

**Kubernetes:**
- Pod-to-pod communication via services
- Persistent volumes for database storage
- ConfigMaps vs Secrets usage
- Port forwarding for testing

## Hints (Don't peek unless stuck!)

<details>
<summary>Docker Hints</summary>

- React needs nginx for production serving
- Backend should expose port 3500
- Use multi-stage builds for smaller images
- Environment variables connect the tiers

</details>

<details>
<summary>Kubernetes Hints</summary>

- Services enable pod-to-pod communication
- Use service names in environment variables
- PersistentVolumes needed for MySQL data
- Port forwarding helps with testing

</details>

## Solution Repository

Once you've attempted the challenge, check out the complete solution with:
- Optimized Dockerfiles
- Production-ready Kubernetes manifests
- Comprehensive troubleshooting guide
- CI/CD pipeline examples

**Repository**: `https://github.com/yourusername/3tier-k8s-complete`

## Common Issues & Solutions

**Frontend shows white page**: Check browser console for API connection errors

**Backend can't connect to database**: Verify MySQL is running and credentials match

**"Unknown column" errors**: Backend creates tables automatically on startup

**React routes return 404**: Production builds need proper nginx configuration

---

**Ready to take on the containerization challenge?** Start with Docker, then progress to Kubernetes. The learning happens when you struggle through the problems yourself!
