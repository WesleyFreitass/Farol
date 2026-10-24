import sys
import paramiko

sys.stdout.reconfigure(encoding='utf-8', errors='replace')
sys.stderr.reconfigure(encoding='utf-8', errors='replace')

def run_remote(cmd):
    client = paramiko.SSHClient()
    client.set_missing_host_key_policy(paramiko.AutoAddPolicy())
    print("[SSH] Conectando ao servidor 187.127.17.88...")
    client.connect("187.127.17.88", port=22, username="root", password="Nead1075846@", timeout=15)
    print(f"🚀 Executando: {cmd}")
    stdin, stdout, stderr = client.exec_command(cmd, get_pty=True)
    
    for line in iter(stdout.readline, ""):
        print(line, end="")
        
    exit_status = stdout.channel.recv_exit_status()
    err = stderr.read().decode()
    if err:
        print(f"⚠️ STDERR: {err}")
    client.close()
    return exit_status

if __name__ == "__main__":
    command = sys.argv[1] if len(sys.argv) > 1 else "uptime; docker ps"
    code = run_remote(command)
    sys.exit(code)
