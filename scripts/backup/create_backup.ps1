# Database Backup Script for CMMS Migration (PowerShell)
# This script creates a comprehensive backup before migration

param(
    [string]$DatabaseName = $env:DATABASE_NAME ?? "cmms_db",
    [string]$DatabaseUser = $env:DATABASE_USER ?? "postgres", 
    [string]$DatabaseHost = $env:DATABASE_HOST ?? "localhost",
    [string]$DatabasePort = $env:DATABASE_PORT ?? "5432"
)

# Configuration
$BackupDir = ".\scripts\backup"
$Timestamp = Get-Date -Format "yyyyMMdd_HHmmss"
$BackupFile = "$BackupDir\cmms_backup_$Timestamp.sql"

Write-Host "🔄 Starting CMMS Database Backup..." -ForegroundColor Green

# Create backup directory if it doesn't exist
if (!(Test-Path $BackupDir)) {
    New-Item -ItemType Directory -Path $BackupDir -Force | Out-Null
}

# Check if PostgreSQL tools are available
try {
    $pgDumpVersion = & pg_dump --version 2>$null
    Write-Host "✅ PostgreSQL tools found: $pgDumpVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ pg_dump not found. Please install PostgreSQL client tools." -ForegroundColor Red
    exit 1
}

try {
    # Create database backup (custom format)
    Write-Host "📦 Creating database backup (custom format)..." -ForegroundColor Yellow
    & pg_dump -h $DatabaseHost -p $DatabasePort -U $DatabaseUser -d $DatabaseName --verbose --no-password --format=custom --compress=9 --file="$BackupFile.custom"
    
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump failed with exit code $LASTEXITCODE"
    }

    # Create plain SQL backup
    Write-Host "📦 Creating database backup (plain SQL)..." -ForegroundColor Yellow
    & pg_dump -h $DatabaseHost -p $DatabasePort -U $DatabaseUser -d $DatabaseName --verbose --no-password --format=plain --file=$BackupFile
    
    if ($LASTEXITCODE -ne 0) {
        throw "pg_dump (plain) failed with exit code $LASTEXITCODE"
    }

    # Verify backup integrity
    Write-Host "🔍 Verifying backup integrity..." -ForegroundColor Yellow
    & pg_restore --list "$BackupFile.custom" | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Backup created successfully!" -ForegroundColor Green
        Write-Host "📁 Custom format: $BackupFile.custom" -ForegroundColor Green
        Write-Host "📁 Plain SQL: $BackupFile" -ForegroundColor Green
        
        # Display backup file sizes
        Write-Host "📊 Backup file sizes:" -ForegroundColor Yellow
        Get-ChildItem "$BackupFile*" | Format-Table Name, Length, LastWriteTime
        
        # Create backup metadata
        $metadata = @{
            timestamp = $Timestamp
            database = $DatabaseName
            host = $DatabaseHost
            port = $DatabasePort
            user = $DatabaseUser
            custom_backup = "$BackupFile.custom"
            sql_backup = $BackupFile
            created_at = (Get-Date -Format "yyyy-MM-ddTHH:mm:ssK")
            pg_dump_version = $pgDumpVersion
        }
        
        $metadata | ConvertTo-Json -Depth 3 | Out-File "$BackupDir\backup_${Timestamp}_metadata.json" -Encoding UTF8
        
        Write-Host "📋 Backup metadata saved to: $BackupDir\backup_${Timestamp}_metadata.json" -ForegroundColor Green
        Write-Host "🎉 Backup process completed successfully!" -ForegroundColor Green
    } else {
        throw "Backup verification failed"
    }
} catch {
    Write-Host "❌ Backup failed: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}