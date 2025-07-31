# CMMS Database Migration Execution Script (PowerShell)
# This script orchestrates the complete database migration process
# 
# Usage: .\execute_migration.ps1 [Command] [Environment]
# Commands: migrate, backup, rollback, status, help
# Environment: development, staging, production

param(
    [Parameter(Position=0)]
    [ValidateSet("migrate", "backup", "rollback", "status", "help")]
    [string]$Command = "migrate",
    
    [Parameter(Position=1)]
    [ValidateSet("development", "staging", "production")]
    [string]$Environment = "development"
)

# Configuration
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$MigrationDir = Join-Path $ScriptDir "migration"
$BackupDir = Join-Path $ScriptDir "backup"
$RollbackDir = Join-Path $ScriptDir "rollback"

# Database configuration (set these environment variables)
$DbHost = if ($env:DB_HOST) { $env:DB_HOST } else { "localhost" }
$DbPort = if ($env:DB_PORT) { $env:DB_PORT } else { "5432" }
$DbName = if ($env:DB_NAME) { $env:DB_NAME } else { "cmms_db" }
$DbUser = if ($env:DB_USER) { $env:DB_USER } else { "postgres" }
$DbPassword = $env:DB_PASSWORD

# Logging functions
function Write-Log {
    param([string]$Message)
    $timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    Write-Host "[$timestamp] $Message" -ForegroundColor Blue
}

function Write-Error-Log {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

function Write-Success {
    param([string]$Message)
    Write-Host "[SUCCESS] $Message" -ForegroundColor Green
}

function Write-Warning-Log {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

# Check prerequisites
function Test-Prerequisites {
    Write-Log "Checking prerequisites..."
    
    # Check if psql is available
    try {
        $null = Get-Command psql -ErrorAction Stop
    }
    catch {
        Write-Error-Log "psql is not installed or not in PATH"
        exit 1
    }
    
    # Check if pg_dump is available
    try {
        $null = Get-Command pg_dump -ErrorAction Stop
    }
    catch {
        Write-Error-Log "pg_dump is not installed or not in PATH"
        exit 1
    }
    
    # Check database connection
    $env:PGPASSWORD = $DbPassword
    $testConnection = & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c "SELECT 1;" 2>$null
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Cannot connect to database. Please check your connection parameters."
        exit 1
    }
    
    # Check if migration scripts exist
    $requiredScripts = @(
        (Join-Path $MigrationDir "01_create_optimized_schema.sql"),
        (Join-Path $MigrationDir "02_migrate_data_phase1.sql"),
        (Join-Path $MigrationDir "03_migrate_data_phase2.sql"),
        (Join-Path $MigrationDir "04_switch_tables_cleanup.sql")
    )
    
    foreach ($script in $requiredScripts) {
        if (-not (Test-Path $script)) {
            Write-Error-Log "Required migration script not found: $script"
            exit 1
        }
    }
    
    Write-Success "Prerequisites check passed"
}

# Create backup
function New-DatabaseBackup {
    Write-Log "Creating database backup..."
    
    $timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
    $backupFile = Join-Path $BackupDir "cmms_backup_${Environment}_${timestamp}.sql"
    $backupCustom = Join-Path $BackupDir "cmms_backup_${Environment}_${timestamp}.dump"
    
    # Create backup directory if it doesn't exist
    if (-not (Test-Path $BackupDir)) {
        New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
    }
    
    # Set password environment variable
    $env:PGPASSWORD = $DbPassword
    
    # Create SQL backup
    Write-Log "Creating SQL backup..."
    & pg_dump -h $DbHost -p $DbPort -U $DbUser --verbose --clean --no-acl --no-owner -f $backupFile $DbName
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "SQL backup creation failed"
        exit 1
    }
    
    # Create custom format backup
    Write-Log "Creating custom format backup..."
    & pg_dump -h $DbHost -p $DbPort -U $DbUser --verbose --format=custom -f $backupCustom $DbName
    if ($LASTEXITCODE -ne 0) {
        Write-Error-Log "Custom backup creation failed"
        exit 1
    }
    
    # Verify backup
    if ((Test-Path $backupFile) -and (Test-Path $backupCustom)) {
        $sqlSize = (Get-Item $backupFile).Length
        $customSize = (Get-Item $backupCustom).Length
        
        Write-Success "Backup created successfully:"
        Write-Host "  SQL backup: $backupFile ($([math]::Round($sqlSize/1MB, 2)) MB)"
        Write-Host "  Custom backup: $backupCustom ($([math]::Round($customSize/1MB, 2)) MB)"
        
        # Store backup paths for potential rollback
        $backupFile, $backupCustom | Out-File -FilePath (Join-Path $BackupDir "latest_backup.txt")
    }
    else {
        Write-Error-Log "Backup creation failed"
        exit 1
    }
}

# Execute SQL script
function Invoke-SqlScript {
    param([string]$ScriptPath)
    
    $scriptName = Split-Path -Leaf $ScriptPath
    Write-Log "Executing $scriptName..."
    
    $env:PGPASSWORD = $DbPassword
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -f $ScriptPath
    
    if ($LASTEXITCODE -eq 0) {
        Write-Success "$scriptName executed successfully"
        return $true
    }
    else {
        Write-Error-Log "$scriptName execution failed"
        return $false
    }
}

# Check migration status
function Get-MigrationStatus {
    Write-Log "Checking migration status..."
    
    $statusQuery = @"
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
"@
    
    $env:PGPASSWORD = $DbPassword
    & psql -h $DbHost -p $DbPort -U $DbUser -d $DbName -c $statusQuery
}

# Rollback migration
function Invoke-MigrationRollback {
    Write-Warning-Log "Initiating migration rollback..."
    
    $confirmation = Read-Host "Are you sure you want to rollback the migration? This will restore the database to its previous state. (y/N)"
    
    if ($confirmation -eq 'y' -or $confirmation -eq 'Y') {
        Write-Log "Executing rollback script..."
        $rollbackScript = Join-Path $RollbackDir "rollback_migration.sql"
        if (Invoke-SqlScript -ScriptPath $rollbackScript) {
            Write-Success "Migration rollback completed"
        }
        else {
            Write-Error-Log "Migration rollback failed"
            exit 1
        }
    }
    else {
        Write-Log "Rollback cancelled"
    }
}

# Main migration execution
function Invoke-Migration {
    Write-Log "Starting CMMS database migration for environment: $Environment"
    
    # Confirmation for production
    if ($Environment -eq "production") {
        Write-Warning-Log "You are about to run migration on PRODUCTION environment!"
        $confirmation = Read-Host "Are you absolutely sure you want to continue? (y/N)"
        
        if ($confirmation -ne 'y' -and $confirmation -ne 'Y') {
            Write-Log "Migration cancelled"
            exit 0
        }
    }
    
    # Phase 1: Create optimized schema
    Write-Log "Phase 1: Creating optimized schema..."
    $script1 = Join-Path $MigrationDir "01_create_optimized_schema.sql"
    if (-not (Invoke-SqlScript -ScriptPath $script1)) {
        Write-Error-Log "Phase 1 failed"
        exit 1
    }
    
    # Phase 2: Migrate core data
    Write-Log "Phase 2: Migrating core data..."
    $script2 = Join-Path $MigrationDir "02_migrate_data_phase1.sql"
    if (-not (Invoke-SqlScript -ScriptPath $script2)) {
        Write-Error-Log "Phase 2 failed"
        exit 1
    }
    
    # Phase 3: Migrate dependent data
    Write-Log "Phase 3: Migrating dependent data..."
    $script3 = Join-Path $MigrationDir "03_migrate_data_phase2.sql"
    if (-not (Invoke-SqlScript -ScriptPath $script3)) {
        Write-Error-Log "Phase 3 failed"
        exit 1
    }
    
    # Phase 4: Switch tables and cleanup
    Write-Log "Phase 4: Switching tables and cleanup..."
    $script4 = Join-Path $MigrationDir "04_switch_tables_cleanup.sql"
    if (-not (Invoke-SqlScript -ScriptPath $script4)) {
        Write-Error-Log "Phase 4 failed"
        exit 1
    }
    
    Write-Success "Database migration completed successfully!"
    
    # Show migration summary
    Write-Log "Migration Summary:"
    Get-MigrationStatus
}

# Print usage
function Show-Usage {
    Write-Host "Usage: .\execute_migration.ps1 [Command] [Environment]"
    Write-Host ""
    Write-Host "Commands:"
    Write-Host "  migrate     Execute the complete migration (default)"
    Write-Host "  backup      Create database backup only"
    Write-Host "  rollback    Rollback the migration"
    Write-Host "  status      Check migration status"
    Write-Host "  help        Show this help message"
    Write-Host ""
    Write-Host "Environments:"
    Write-Host "  development (default)"
    Write-Host "  staging"
    Write-Host "  production"
    Write-Host ""
    Write-Host "Environment Variables:"
    Write-Host "  DB_HOST     Database host (default: localhost)"
    Write-Host "  DB_PORT     Database port (default: 5432)"
    Write-Host "  DB_NAME     Database name (default: cmms_db)"
    Write-Host "  DB_USER     Database user (default: postgres)"
    Write-Host "  DB_PASSWORD Database password (required)"
}

# Main script logic
function Main {
    # Check if DB_PASSWORD is set
    if (-not $DbPassword) {
        Write-Error-Log "DB_PASSWORD environment variable is required"
        Write-Host "Example: `$env:DB_PASSWORD='your_password'; .\execute_migration.ps1 migrate production"
        exit 1
    }
    
    switch ($Command) {
        "migrate" {
            Test-Prerequisites
            New-DatabaseBackup
            Invoke-Migration
        }
        "backup" {
            Test-Prerequisites
            New-DatabaseBackup
        }
        "rollback" {
            Test-Prerequisites
            Invoke-MigrationRollback
        }
        "status" {
            Test-Prerequisites
            Get-MigrationStatus
        }
        "help" {
            Show-Usage
        }
        default {
            Write-Error-Log "Unknown command: $Command"
            Show-Usage
            exit 1
        }
    }
}

# Execute main function
Main