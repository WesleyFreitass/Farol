# 🏮 Farol - Aplicativo de Registro e Avaliação de Leitura

O **Farol** é uma aplicação completa para acompanhamento, registro, avaliação e catalogação de leituras.

---

## 🚀 Stack Tecnológica

- **Framework:** [Next.js](https://nextjs.org/) (App Router, React 19, TypeScript)
- **Estilização:** [Tailwind CSS v4](https://tailwindcss.com/)
- **Containerização:** [Docker](https://www.docker.com/) (Multi-stage build com Node 20 Alpine & Standalone)
- **Orquestração:** [Docker Compose](https://docs.docker.com/compose/)
- **CI/CD:** [GitHub Actions](https://github.com/features/actions)
- **Web Server / Proxy:** [Nginx](https://nginx.org/) com SSL Let's Encrypt (Certbot)

---

## 🌐 Especificação de Infraestrutura & Produção

| Configuração | Valor |
| :--- | :--- |
| **Domínio Oficial** | [farol.pampo.tech](https://farol.pampo.tech) |
| **IP da VPS** | `187.127.17.88` |
| **Porta no Host da VPS** | `3100` (`3100:3000`) |
| **Diretório na VPS** | `/root/farol` |
| **Usuário SSH** | `root` |
| **Container Name** | `farol` |

---

## 🛠️ Comandos de Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Iniciar servidor de desenvolvimento local
npm run dev

# Testar build de produção
npm run build

# Executar build local com Docker Compose
docker compose up -d --build
```

---

## 🚢 Deploy Automatizado (CI/CD)

O deploy é acionado automaticamente a cada `git push` na branch `main` via GitHub Actions (`.github/workflows/deploy.yml`).
O workflow conecta via SSH na VPS e executa:
1. Verificação / clone automático do repositório em `/root/farol` (se ainda não existir);
2. Sincronização forçada (`git fetch` e `git reset --hard origin/main`);
3. Recompilação e reinício sem downtime do container (`docker compose up -d --build`).
