# CMMS Platform - Comprehensive Maintenance Management System

A modern, full-stack Computerized Maintenance Management System (CMMS) built with Next.js 14, TypeScript, Prisma, and tRPC.

## 🚀 Features

### Core Modules
- **Asset Management**: Complete asset registry with hierarchy, status tracking, and performance metrics
- **Work Order Management**: Full lifecycle work order management with task tracking and assignment
- **Maintenance Planning**: Preventive maintenance scheduling with compliance tracking
- **Inventory Management**: Spare parts catalog with stock monitoring and usage tracking
- **Team Management**: Employee and team organization with workload tracking
- **Location Management**: Hierarchical location structure (sites, buildings, areas)
- **IoT Sensors**: Real-time sensor monitoring and data analytics
- **Reports & Analytics**: Comprehensive reporting with performance insights
- **Dashboard**: Executive overview with KPIs and real-time metrics

### Technical Features
- **Type-Safe APIs**: Full-stack type safety with tRPC
- **Authentication**: Secure user management with NextAuth.js
- **Role-Based Access**: Admin, Manager, and Technician roles
- **Real-Time Updates**: Live data synchronization
- **Responsive Design**: Mobile-first UI with PWA capabilities
- **Advanced Filtering**: Powerful search and filter capabilities
- **Data Validation**: Comprehensive input validation with Zod

## 🛠️ Technology Stack

### Frontend
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS with shadcn/ui components
- **State Management**: tRPC with React Query
- **Forms**: React Hook Form with Zod validation
- **Charts**: Recharts for data visualization

### Backend
- **API**: tRPC for type-safe APIs
- **Database**: Prisma ORM with PostgreSQL
- **Authentication**: NextAuth.js with JWT
- **Validation**: Zod schemas
- **Security**: bcryptjs for password hashing

### Infrastructure
- **Database**: PostgreSQL (recommended for production)
- **Deployment**: Vercel-ready (or Docker containers)
- **File Storage**: Configurable (AWS S3, etc.)
- **Caching**: Redis support (optional)

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- PostgreSQL database
- npm or yarn package manager

### Setup Steps

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cmms-platform
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/cmms_db"
   NEXTAUTH_SECRET="your-nextauth-secret"
   NEXTAUTH_URL="http://localhost:3000"
   JWT_SECRET="your-jwt-secret"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed initial data (optional)
   npx prisma db seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗃️ Database Schema

The application uses a comprehensive database schema with the following main entities:

### Core Entities
- **Users & Teams**: User management with role-based access control
- **Locations**: Hierarchical location structure (sites → buildings → areas)
- **Assets**: Equipment and machinery with status tracking
- **Categories**: Asset categorization system

### Maintenance Management
- **Work Orders**: Maintenance requests and tasks
- **Maintenance Plans**: Preventive maintenance scheduling
- **Tasks**: Individual work items within work orders

### Inventory & Parts
- **Spare Parts**: Parts catalog with specifications
- **Inventory Records**: Stock tracking and management
- **Work Order Part Usage**: Parts consumption tracking

### IoT & Monitoring
- **Sensor Streams**: IoT sensor configuration
- **Sensor Data**: Real-time sensor readings
- **KPI Records**: Performance metrics tracking

### Audit & Compliance
- **Audit Logs**: System activity tracking
- **Documents**: File attachments and documentation

## 🔐 Authentication & Authorization

### User Roles
- **Admin**: Full system access and user management
- **Manager**: Asset and work order management, reporting
- **Technician**: Work order execution and updates

### Security Features
- JWT-based authentication
- Password hashing with bcryptjs
- Role-based route protection
- Session management with NextAuth.js

## 📊 API Documentation

The application uses tRPC for type-safe APIs. Main router endpoints:

### Core Routers
- `/api/trpc/auth.*` - Authentication and user management
- `/api/trpc/asset.*` - Asset management operations
- `/api/trpc/workOrder.*` - Work order lifecycle management
- `/api/trpc/maintenance.*` - Maintenance planning and scheduling
- `/api/trpc/inventory.*` - Inventory and spare parts management
- `/api/trpc/location.*` - Location hierarchy management
- `/api/trpc/team.*` - Team and user management
- `/api/trpc/sensor.*` - IoT sensor data and monitoring
- `/api/trpc/reports.*` - Reporting and analytics
- `/api/trpc/dashboard.*` - Dashboard KPIs and metrics

### Example API Usage
```typescript
// Get all assets with filtering
const assets = await api.asset.getAll.query({
  locationId: "location-id",
  status: "OPERATIONAL",
  page: 1,
  limit: 20
});

// Create a new work order
const workOrder = await api.workOrder.create.mutate({
  title: "Pump Maintenance",
  assetId: "asset-id",
  priority: "HIGH",
  type: "PREVENTIVE"
});
```

## 🎨 UI Components

The application uses a consistent design system built with:

- **shadcn/ui**: High-quality React components
- **Tailwind CSS**: Utility-first styling
- **Lucide Icons**: Consistent iconography
- **Recharts**: Data visualization components

### Key UI Features
- Responsive navigation with mobile support
- Data tables with sorting and filtering
- Form components with validation
- Modal dialogs and confirmations
- Loading states and error handling
- Toast notifications for user feedback

## 📈 Performance & Optimization

### Database Optimization
- Efficient Prisma queries with proper relations
- Database indexing for frequently queried fields
- Connection pooling for production environments

### Frontend Optimization
- Next.js App Router for optimal performance
- React Query for efficient data caching
- Lazy loading for large datasets
- Optimized bundle splitting

## 🚀 Deployment

### Vercel Deployment (Recommended)
1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Deployment
```dockerfile
# Dockerfile example
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

### Environment Variables for Production
```env
DATABASE_URL="postgresql://prod-db-url"
NEXTAUTH_SECRET="production-secret"
NEXTAUTH_URL="https://your-domain.com"
NODE_ENV="production"
```

## 📊 Project Status

**Current Status**: Backend API Development Completed - Ready for Frontend Integration  
**Development Progress**: 75% Complete  
**Last Updated**: January 2025

### Completed Features
- ✅ Complete UI implementation for all modules
- ✅ Comprehensive backend API with tRPC
- ✅ Database schema with all entities
- ✅ Authentication and authorization system
- ✅ Role-based access control

### Next Steps
- Frontend-backend integration
- Database setup and migrations
- Testing and quality assurance
- Production deployment preparation

---

Built with ❤️ using modern web technologies for efficient maintenance management.
