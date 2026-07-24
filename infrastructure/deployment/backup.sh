#!/bin/sh

# Automated PostgreSQL Backup Script
BACKUP_DIR="/var/backups/nrt_ops"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/nrt_backup_${TIMESTAMP}.sql.gz"

mkdir -p ${BACKUP_DIR}

echo "Starting Database Backup to ${BACKUP_FILE}..."
pg_dump -h postgres -U ${POSTGRES_USER:-nrt_admin} ${POSTGRES_DB:-nrt_ops_db} | gzip > ${BACKUP_FILE}

if [ $? -eq 0 ]; then
    echo "SUCCESS: Database Backup Completed: ${BACKUP_FILE}"
    # Delete backups older than 30 days
    find ${BACKUP_DIR} -type f -name "*.sql.gz" -mtime +30 -delete
    exit 0
else
    echo "ERROR: Database Backup Failed!"
    exit 1
fi
