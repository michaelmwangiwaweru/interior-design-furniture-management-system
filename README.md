# Interior Design Furniture Management System

Full-stack e-commerce platform for browsing, selling, and managing furniture products.

## Features
- User & Admin authentication (login/register)
- Furniture catalog (products with images, categories, prices)
- Shopping cart & order placement
- Admin dashboard (add/edit/delete products)
- Secure JWT-based authentication
- Login history tracking
- sales record
- dashboard report
- orders record
- inventory record

## Tech Stack
- **Frontend**: React (Vite) → `/client`
- **Backend**: Spring Boot 3 + Spring Security + JWT + MySQL → `/interior_design`
- **Database**: MySQL

## Setup Instructions

### Prerequisites
- Java 17+ (for backend)
- Node.js 18+ & npm (for frontend)
- MySQL server running

### Backend
```bash,
Runs on: http://localhost:9193
frontend
run on :http://localhost:5173
cd client
npm install
npm run dev
cd interior_design
mvn clean install
mvn spring-boot:run
