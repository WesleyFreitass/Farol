import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HOST = "187.127.17.88"
USER = "root"
PASSWORD = "Nead1075846@"
PORT = 22

SQL_MIGRATION = """
ALTER TABLE users ADD COLUMN themeOpacity INTEGER DEFAULT 85;
ALTER TABLE users ADD COLUMN replayMonth TEXT DEFAULT 'current';
ALTER TABLE users ADD COLUMN readingGoal INTEGER DEFAULT 12;
ALTER TABLE wishlist_items ADD COLUMN storeOffers TEXT;

CREATE TABLE IF NOT EXISTS crew_members (
    id TEXT PRIMARY KEY NOT NULL,
    captainId TEXT NOT NULL,
    memberId TEXT NOT NULL,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (captainId) REFERENCES users (id) ON DELETE CASCADE,
    FOREIGN KEY (memberId) REFERENCES users (id) ON DELETE CASCADE
);
CREATE UNIQUE INDEX IF NOT EXISTS crew_members_captainId_memberId_key ON crew_members(captainId, memberId);
CREATE INDEX IF NOT EXISTS crew_members_captainId_idx ON crew_members(captainId);
CREATE INDEX IF NOT EXISTS crew_members_memberId_idx ON crew_members(memberId);

CREATE TABLE IF NOT EXISTS book_recommendations (
    id TEXT PRIMARY KEY NOT NULL,
    senderId TEXT NOT NULL,
    userBookId TEXT,
    bookTitle TEXT NOT NULL,
    author TEXT NOT NULL,
    coverUrl TEXT,
    note TEXT,
    createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (senderId) REFERENCES users (id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS book_recommendations_senderId_idx ON book_recommendations(senderId);
"""

def main():
    print("[1/3] Conectando na VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=20)
    
    sftp = client.open_sftp()
    with sftp.file("/tmp/farol_migration.sql", "w") as f:
        f.write(SQL_MIGRATION)
    sftp.close()
    
    print("[2/3] Aplicando migração de schema SQLite no banco persistido...")
    cmd_migrate = "sqlite3 /var/lib/docker/volumes/farol_farol_data/_data/dev.db < /tmp/farol_migration.sql && rm -f /tmp/farol_migration.sql && echo 'MIGRATION_SUCCESS'"
    stdin, stdout, stderr = client.exec_command(cmd_migrate)
    out = stdout.read().decode()
    err = stderr.read().decode()
    print(out)
    if err:
        print(f"Nota: {err}")
        
    print("[3/3] Executando injeção de dados de teste (Seed) para Fimose...")
    cmd_seed = "docker exec -i farol node scripts/seed-fimose.js"
    stdin, stdout, stderr = client.exec_command(cmd_seed, get_pty=True)
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    code = stdout.channel.recv_exit_status()
    print(f"\nSeed finalizado com código {code}")
    client.close()

if __name__ == "__main__":
    main()
