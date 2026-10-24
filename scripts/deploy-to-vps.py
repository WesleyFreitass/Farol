import sys
import os
import paramiko

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

HOST = "187.127.17.88"
USER = "root"
PASSWORD = "Nead1075846@"
PORT = 22

def main():
    print("[1/5] Conectando via SSH e SFTP na VPS...")
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    client.connect(HOST, port=PORT, username=USER, password=PASSWORD, timeout=20)
    
    sftp = client.open_sftp()
    
    bundle_local = "farol-latest.bundle"
    bundle_remote = "/root/farol/farol-latest.bundle"
    
    print(f"[2/5] Enviando git bundle ({os.path.getsize(bundle_local)} bytes) para {bundle_remote}...")
    sftp.put(bundle_local, bundle_remote)
    sftp.close()
    print("      Bundle enviado com sucesso!")
    
    commands = [
        ("Aplicando commits do bundle", "cd /root/farol && git pull /root/farol/farol-latest.bundle main && git log -3 --oneline"),
        ("Reconstruindo container Farol", "cd /root/farol && docker compose build farol"),
        ("Reiniciando container Farol", "cd /root/farol && docker compose up -d farol"),
        ("Aguardando subida do container", "sleep 5 && docker ps --filter name=farol"),
        ("Executando seed de teste para Fimose no container", "docker exec -i farol node scripts/seed-fimose.js"),
        ("Removendo bundle temporario", "rm -f /root/farol/farol-latest.bundle")
    ]
    
    for title, cmd in commands:
        print(f"\n🚀 [{title}]")
        print(f"   Comando: {cmd}")
        stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
        
        for line in iter(stdout.readline, ""):
            print(line, end="")
            
        code = stdout.channel.recv_exit_status()
        if code != 0:
            err = stderr.read().decode()
            print(f"❌ Falha no comando (código {code}): {err}")
            client.close()
            sys.exit(code)
            
    client.close()
    print("\n🎉 Deploy e injeção de dados de teste concluídos com sucesso total na VPS!")

if __name__ == "__main__":
    main()
