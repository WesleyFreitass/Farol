#!/usr/bin/env bash
set -e

echo "🔧 [Farol VPS Setup] Configurando Nginx, Firewall e SSL para farol.pampo.tech..."

# 1. Copiar configuração do Nginx
cp /root/farol/deploy/nginx/farol.pampo.tech /etc/nginx/sites-available/farol.pampo.tech

# 2. Ativar site criando link simbólico se não existir
if [ ! -f /etc/nginx/sites-enabled/farol.pampo.tech ]; then
  ln -s /etc/nginx/sites-available/farol.pampo.tech /etc/nginx/sites-enabled/farol.pampo.tech
fi

# 3. Testar sintaxe do Nginx e recarregar
nginx -t
systemctl reload nginx

# 4. Liberar porta no firewall UFW
ufw allow 3100/tcp
ufw reload

# 5. Obter certificado SSL via Certbot (requer que o DNS já esteja apontando para o IP da VPS)
echo "🔒 Solicitando certificado SSL com Certbot..."
certbot --nginx -d farol.pampo.tech --redirect --agree-tos --non-interactive -m admin@pampo.tech

echo "🎉 [Farol VPS Setup] Configuração concluída com sucesso! Acesse https://farol.pampo.tech"
