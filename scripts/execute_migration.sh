#!/bin/bash

# CMMS Database Migration Execution Script
# This script orchestrates the complete database migration process
# 
# Usage: ./execute_migration.sh [environment]
# Environment: development, staging, production

set -e  # Exit on any error

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
MIGRATION_DIR="$SCRIPT_DIR/migration"
BACKUP_DIR="$SCRIPT_DIR/backup"
ROLLBACK_DIR="$SCRIPT_DIR/rollback"

# Default environment
ENVIRONMENT=${1:-development}

# Database configuration (set these environment variables)
DB_HOST=${DB_HOST:-localhost}
DB_PORT=${DB_PORT:-5432}
DB_NAME=${DB_NAME:-cmms_db}
DB_USER=${DB_USER:-postgres}
DB_PASSWORD=${DB_PASSWORD}

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Check prerequisites
check_prerequisites() {
    log "Checking prerequisites..."
    
    # Check if psql is available
    if ! command -v psql &> /dev/null; then
        error "psql is not installed or not in PATH"
        exit 1
    fi
    
    # Check if pg_dump is available
    if ! command -v pg_dump &> /dev/null; then
        error "pg_dump is not installed or not in PATH"
        exit 1
    fi
    
    # Check database connection
    if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "SELECT 1;" &> /dev/null; then
        error "Cannot connect to database. Please check your connection parameters."
        exit 1
    fi
    
    # Check if migration scripts exist
    local required_scripts=(
        "$MIGRATION_DIR/01_create_optimized_schema.sql"
        "$MIGRATION_DIR/02_migrate_data_phase1.sql"
        "$MIGRATION_DIR/03_migrate_data_phase2.sql"
        "$MIGRATION_DIR/04_switch_tables_cleanup.sql"
    )
    
    for script in "${required_scripts[@]}"; do
        if [[ ! -f "$script" ]]; then
            error "Required migration script not found: $script"
            exit 1
        fi
    done
    
    success "Prerequisites check passed"
}

# Create backup
create_backup() {
    log "Creating database backup..."
    
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/cmms_backup_${ENVIRONMENT}_${timestamp}.sql"
    local backup_custom="$BACKUP_DIR/cmms_backup_${ENVIRONMENT}_${timestamp}.dump"
    
    # Create backup directory if it doesn't exist
    mkdir -p "$BACKUP_DIR"
    
    # Create SQL backup
    PGPASSWORD=$DB_PASSWORD pg_dump \
        -h $DB_HOST -p $DB_PORT -U $DB_USER \
        --verbose --clean --no-acl --no-owner \
        -f "$backup_file" $DB_NAME
    
    # Create custom format backup
    PGPASSWORD=$DB_PASSWORD pg_dump \
        -h $DB_HOST -p $DB_PORT -U $DB_USER \
        --verbose --format=custom \
        -f "$backup_custom" $DB_NAME
    
    # Verify backup
    if [[ -f "$backup_file" && -f "$backup_custom" ]]; then
        local sql_size=$(stat -f%z "$backup_file" 2>/dev/null || stat -c%s "$backup_file" 2>/dev/null)
        local custom_size=$(stat -f%z "$backup_custom" 2>/dev/null || stat -c%s "$backup_custom" 2>/dev/null)
        
        success "Backup created successfully:"
        echo "  SQL backup: $backup_file ($(numfmt --to=iec $sql_size))"
        echo "  Custom backup: $backup_custom ($(numfmt --to=iec $custom_size))"
        
        # Store backup paths for potential rollback
        echo "$backup_file" > "$BACKUP_DIR/latest_backup.txt"
        echo "$backup_custom" >> "$BACKUP_DIR/latest_backup.txt"
    else
        error "Backup creation failed"
        exit 1
    fi
}

# Execute SQL script
execute_sql_script() {
    local script_path=$1
    local script_name=$(basename "$script_path")
    
    log "Executing $script_name..."
    
    if PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -f "$script_path"; then
        success "$script_name executed successfully"
    else
        error "$script_name execution failed"
        return 1
    fi
}

# Check migration status
check_migration_status() {
    log "Checking migration status..."
    
    local status_query="
    SELECT 
        step_name,
        status,
        created_at,
        completed_at,
        details
    FROM migration_log 
    WHERE created_at >= CURRENT_DATE
    ORDER BY created_at DESC
    LIMIT 10;
    "
    
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$status_query"
}

# Rollback migration
rollback_migration() {
    warning "Initiating migration rollback..."
    
    read -p "Are you sure you want to rollback the migration? This will restore the database to its previous state. (y/N): " -n 1 -r
    echo
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        log "Executing rollback script..."
        execute_sql_script "$ROLLBACK_DIR/rollback_migration.sql"
        success "Migration rollback completed"
    else
        log "Rollback cancelled"
    fi
}

# Main migration execution
execute_migration() {
    log "Starting CMMS database migration for environment: $ENVIRONMENT"
    
    # Confirmation for production
    if [[ "$ENVIRONMENT" == "production" ]]; then
        warning "You are about to run migration on PRODUCTION environment!"
        read -p "Are you absolutely sure you want to continue? (y/N): " -n 1 -r
        echo
        
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            log "Migration cancelled"
            exit 0
        fi
    fi
    
    # Phase 1: Create optimized schema
    log "Phase 1: Creating optimized schema..."
    execute_sql_script "$MIGRATION_DIR/01_create_optimized_schema.sql"
    
    # Phase 2: Migrate core data
    log "Phase 2: Migrating core data..."
    execute_sql_script "$MIGRATION_DIR/02_migrate_data_phase1.sql"
    
    # Phase 3: Migrate dependent data
    log "Phase 3: Migrating dependent data..."
    execute_sql_script "$MIGRATION_DIR/03_migrate_data_phase2.sql"
    
    # Phase 4: Switch tables and cleanup
    log "Phase 4: Switching tables and cleanup..."
    execute_sql_script "$MIGRATION_DIR/04_switch_tables_cleanup.sql"
    
    success "Database migration completed successfully!"
    
    # Show migration summary
    log "Migration Summary:"
    check_migration_status
}

# Print usage
print_usage() {
    echo "Usage: $0 [COMMAND] [ENVIRONMENT]"
    echo ""
    echo "Commands:"
    echo "  migrate     Execute the complete migration (default)"
    echo "  backup      Create database backup only"
    echo "  rollback    Rollback the migration"
    echo "  status      Check migration status"
    echo "  help        Show this help message"
    echo ""
    echo "Environments:"
    echo "  development (default)"
    echo "  staging"
    echo "  production"
    echo ""
    echo "Environment Variables:"
    echo "  DB_HOST     Database host (default: localhost)"
    echo "  DB_PORT     Database port (default: 5432)"
    echo "  DB_NAME     Database name (default: cmms_db)"
    echo "  DB_USER     Database user (default: postgres)"
    echo "  DB_PASSWORD Database password (required)"
}

# Main script logic
main() {
    local command=${1:-migrate}
    
    case $command in
        migrate)
            check_prerequisites
            create_backup
            execute_migration
            ;;
        backup)
            check_prerequisites
            create_backup
            ;;
        rollback)
            check_prerequisites
            rollback_migration
            ;;
        status)
            check_prerequisites
            check_migration_status
            ;;
        help|--help|-h)
            print_usage
            ;;
        *)
            error "Unknown command: $command"
            print_usage
            exit 1
            ;;
    esac
}

# Check if DB_PASSWORD is set
if [[ -z "$DB_PASSWORD" ]]; then
    error "DB_PASSWORD environment variable is required"
    echo "Example: DB_PASSWORD=your_password $0 migrate production"
    exit 1
fi

# Execute main function
main "$@"