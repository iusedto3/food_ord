# AI Agent Instructions for Food Ordering Project

## Project Architecture

This is a full-stack food ordering application with three main components:

- `client/` - Customer-facing React frontend (Vite)
- `admin/` - Admin dashboard React frontend (Vite) 
- `backend/` - Express.js REST API server

### Key Architectural Patterns

1. **Backend API Structure** (`backend/`)
   - RESTful API endpoints defined in `routes/` (food, user, cart, order)
   - Controllers in `controllers/` handle business logic
   - MongoDB models in `models/` define data schemas
   - File uploads stored in `uploads/` directory

2. **Frontend State Management** (`client/src/contexts/`)
   - Global state managed through React Context (see `StoreContext.jsx`)
   - Cart state synchronized between local state and backend
   - Authentication token stored in localStorage

3. **Component Organization** (`client/src/components/`)
   - Atomic component pattern with each component in its own directory
   - Component-specific CSS colocated with JSX files
   - Shared components (Header, Footer, etc.) reused across pages

## Development Workflow

1. **Running the Project**
   ```bash
   # Start backend server (port 4000)
   cd backend
   npm install
   npm start

   # Start client app (port 5173)
   cd client
   npm install
   npm run dev

   # Start admin dashboard (port 5174)
   cd admin
   npm install
   npm run dev
   ```

2. **API Integration**
   - Backend API base URL: `http://localhost:4000`
   - Protected routes require `token` header
   - File uploads handled through `/images` endpoint

## Project-Specific Conventions

1. **Authentication**
   - JWT tokens stored in localStorage
   - Token passed in headers for protected routes
   - See `middleware/auth.js` for auth middleware

2. **State Management**
   - Use React Context for global state (`StoreContext.jsx`)
   - Cart synchronization handled automatically
   - Food items fetched on initial load

3. **Component Structure**
   ```jsx
   // Each component follows this structure:
   ComponentName/
     ├── ComponentName.jsx
     └── ComponentName.css
   ```

4. **API Response Format**
   ```javascript
   {
     data: T,        // Main response payload
     message: string // Status message
   }
   ```

## Integration Points

1. **Frontend-Backend Communication**
   - All API calls use axios
   - Base URL configured in `StoreContext.jsx`
   - Protected routes automatically include auth token

2. **Image Handling**
   - Food images stored in `backend/uploads/`
   - Accessed via `/images` endpoint
   - Upload handled by multer middleware

## Common Tasks

1. **Adding New Food Items**
   - Add model fields in `foodModel.js`
   - Update controller in `foodController.js`
   - Add corresponding frontend components

2. **Cart Operations**
   - Cart state managed in `StoreContext.jsx`
   - Updates synced with backend via `/api/cart` endpoints
   - See `CartItems.jsx` for implementation example