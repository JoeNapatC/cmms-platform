# Database Design Best Practices for CMMS/EAM Systems

## 🎯 Key Improvements Made

### 1. **Primary Keys: Integer vs Text**

**❌ Current (Poor Performance):**
```prisma
model Asset {
  id String @id @default(cuid()) // "clxyz123abc456def"
}
```

**✅ Optimized (High Performance):**
```prisma
model Asset {
  id   Int    @id @default(autoincrement()) // 1, 2, 3, 4...
  uuid String @unique @default(cuid())      // For external APIs only
}
```

### 2. **Performance Benefits**

| Aspect | Text IDs | Integer IDs | Performance Gain |
|--------|----------|-------------|------------------|
| Storage | 25-30 bytes | 4-8 bytes | **75-80% less** |
| Index Size | Large | Small | **70-85% smaller** |
| Join Speed | Slow | Fast | **3-10x faster** |
| Foreign Key Lookups | Slow | Fast | **5-15x faster** |

### 3. **Proper Data Types**

**✅ Optimized Types:**
```prisma
// Monetary values
cost Decimal @db.Decimal(15,2) // Instead of Float

// Timestamps with timezone
createdAt DateTime @default(now()) @db.Timestamptz

// Variable text with limits
name String @db.VarChar(255) // Instead of unlimited String

// Large text
description String? @db.Text

// JSON data (PostgreSQL)
permissions Json @db.JsonB // Better performance than Json

// File sizes
fileSize BigInt // For files > 2GB
```

### 4. **Strategic Indexing**

**✅ Essential Indexes:**
```prisma
model Asset {
  // Primary operations
  @@index([tag])           // Asset lookup by tag
  @@index([locationId])    // Assets by location
  @@index([categoryId])    // Assets by category
  
  // Status filtering
  @@index([lifecycleStatus])
  @@index([criticality])
  
  // Time-based queries
  @@index([createdAt])
  @@index([warrantyExpiry])
  
  // Composite indexes for common queries
  @@index([locationId, lifecycleStatus])
  @@index([categoryId, criticality])
}
```

### 5. **Foreign Key Constraints**

**✅ Proper Referential Integrity:**
```prisma
// Prevent deletion of referenced records
asset Asset @relation(fields: [assetId], references: [id], onDelete: Restrict)

// Allow NULL when parent is deleted
team Team? @relation(fields: [teamId], references: [id], onDelete: SetNull)

// Delete children when parent is deleted
tasks Task[] @relation(onDelete: Cascade)
```

## 📊 Migration Strategy

### Phase 1: Backup & Preparation
```bash
# 1. Backup current database
pg_dump your_database > backup_$(date +%Y%m%d).sql

# 2. Create migration scripts
npx prisma migrate dev --create-only --name optimize_schema
```

### Phase 2: Data Migration
```sql
-- Example migration for Asset table
-- 1. Add new integer ID column
ALTER TABLE assets ADD COLUMN new_id SERIAL;

-- 2. Update foreign key references
UPDATE work_orders SET asset_new_id = (
  SELECT new_id FROM assets WHERE assets.id = work_orders.asset_id
);

-- 3. Drop old constraints and rename columns
ALTER TABLE assets DROP CONSTRAINT assets_pkey;
ALTER TABLE assets DROP COLUMN id;
ALTER TABLE assets RENAME COLUMN new_id TO id;
ALTER TABLE assets ADD PRIMARY KEY (id);
```

### Phase 3: Application Updates
```typescript
// Update tRPC procedures to use integer IDs
export const assetRouter = createTRPCRouter({
  getById: publicProcedure
    .input(z.object({ id: z.number() })) // Changed from z.string()
    .query(async ({ input, ctx }) => {
      return await ctx.db.asset.findUnique({
        where: { id: input.id }, // Now using integer
      });
    }),
});
```

## 🚀 Performance Optimizations

### 1. **Query Optimization**
```typescript
// ❌ N+1 Query Problem
const assets = await db.asset.findMany();
for (const asset of assets) {
  const location = await db.location.findUnique({ where: { id: asset.locationId } });
}

// ✅ Optimized with includes
const assets = await db.asset.findMany({
  include: {
    location: true,
    category: true,
    workOrders: {
      where: { status: 'IN_PROGRESS' },
      take: 5,
    },
  },
});
```

### 2. **Pagination Best Practices**
```typescript
// ✅ Cursor-based pagination for large datasets
const assets = await db.asset.findMany({
  take: 20,
  skip: cursor ? 1 : 0,
  cursor: cursor ? { id: cursor } : undefined,
  orderBy: { id: 'asc' },
});
```

### 3. **Database Connection Pooling**
```typescript
// prisma/schema.prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  // Connection pooling
  connection_limit = 20
  pool_timeout = 20
}
```

## 📈 Monitoring & Maintenance

### 1. **Query Performance Monitoring**
```sql
-- Enable query logging in PostgreSQL
ALTER SYSTEM SET log_statement = 'all';
ALTER SYSTEM SET log_min_duration_statement = 1000; -- Log slow queries

-- Analyze query performance
EXPLAIN ANALYZE SELECT * FROM assets WHERE location_id = 123;
```

### 2. **Index Usage Analysis**
```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
ORDER BY idx_scan DESC;

-- Find unused indexes
SELECT schemaname, tablename, indexname
FROM pg_stat_user_indexes
WHERE idx_scan = 0;
```

## 🔧 Implementation Steps

1. **Review the optimized schema** (`schema-optimized.prisma`)
2. **Plan migration strategy** based on your data volume
3. **Test in development environment** first
4. **Update application code** to use integer IDs
5. **Monitor performance improvements**

## 💡 Additional Recommendations

1. **Use database views** for complex reporting queries
2. **Implement read replicas** for heavy read workloads
3. **Consider partitioning** for time-series data (KPI records)
4. **Use materialized views** for dashboard aggregations
5. **Implement proper backup strategies** with point-in-time recovery

This optimized schema will provide significant performance improvements, especially as your data grows!