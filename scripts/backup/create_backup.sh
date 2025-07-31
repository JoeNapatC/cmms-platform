#!/bin/bash
# Database Backup Script for CMMS Migration
# This script creates a comprehensive backup before migration

set -e  # Exit on any error

# Configuration
DB_NAME="${DATABASE_NAME:-cmms_db}"
DB_USER="${DATABASE_USER:-postgres}"
DB_HOST="${DATABASE_HOST:-localhost}"
DB_PORT="${DATABASE_PORT:-5432}"
BACKUP_DIR="./scripts/backup"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/cmms_backup_${TIMESTAMP}.sql"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔄 Starting CMMS Database Backup...${NC}"

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

# Check if PostgreSQL tools are available
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ pg_dump not found. Please install PostgreSQL client tools.${NC}"
    exit 1
fi

# Create database backup
echo -e "${YELLOW}📦 Creating database backup...${NC}"
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-password \
    --format=custom \
    --compress=9 \
    --file="${BACKUP_FILE}.custom"

# Also create a plain SQL backup for easier inspection
pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" \
    --verbose \
    --no-password \
    --format=plain \
    --file="$BACKUP_FILE"

# Verify backup integrity
echo -e "${YELLOW}🔍 Verifying backup integrity...${NC}"
pg_restore --list "${BACKUP_FILE}.custom" > /dev/null

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Backup created successfully!${NC}"
    echo -e "${GREEN}📁 Custom format: ${BACKUP_FILE}.custom${NC}"
    echo -e "${GREEN}📁 Plain SQL: ${BACKUP_FILE}${NC}"
    
    # Display backup file sizes
    echo -e "${YELLOW}📊 Backup file sizes:${NC}"
    ls -lh "${BACKUP_FILE}"*
    
    # Create backup metadata
    cat > "${BACKUP_DIR}/backup_${TIMESTAMP}_metadata.json" << EOF
{
  "timestamp": "${TIMESTAMP}",
  "database": "${DB_NAME}",
  "host": "${DB_HOST}",
  "port": "${DB_PORT}",
  "user": "${DB_USER}",
  "custom_backup": "${BACKUP_FILE}.custom",
  "sql_backup": "${BACKUP_FILE}",
  "created_at": "$(date -Iseconds)",
  "pg_dump_version": "$(pg_dump --version)"
}
EOF
    
    echo -e "${GREEN}📋 Backup metadata saved to: ${BACKUP_DIR}/backup_${TIMESTAMP}_metadata.json${NC}"
else
    echo -e "${RED}❌ Backup verification failed!${NC}"
    exit 1
fi

echo -e "${GREEN}🎉 Backup process completed successfully!${NC}"