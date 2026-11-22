# Contexto para a sessão do Luna Gestão: proteção contra scanners e alerta no celular

Cole este arquivo na sessão que trabalha em `~/projects/luna-gestao` (leia também o `contexto.md` de lá).
Objetivo: dar ao **luna.xpto.in** o mesmo que o **xpto.in** já ganhou: detectar tentativas de invasão por IP,
**bloquear** o IP e **avisar no celular**. Nada disso existe no Luna ainda.

## Por que
Os logs do xpto.in mostram varreduras automáticas todos os dias: IPs de nuvem (Azure `20.x`, Google `34.x`, DigitalOcean IPv6)
com centenas de requisições por semana, pedindo `/.env` em dezenas de pastas, `/.git/HEAD`, `/.git/config`,
`/.github/workflows/deploy.yml`, `phpinfo`, `*.php`, `/wp-login.php`. Um scanner fez ~50 requisições em 5 segundos.
Tudo deu 404 (nada vazou), mas o dono quer ser avisado e que o IP seja barrado. O Luna tem dados reais de empresas
(multi-tenant com RLS), então o risco é maior do que no xpto.in.

## Fatos da infraestrutura (verificados)
- Mesma máquina (`luna`, 192.168.0.21), usuário `luna`. O tráfego chega por **Cloudflare Tunnel** (`cloudflared`):
  `luna.xpto.in` -> `http://localhost:1313` (Next.js). O backend Spring Boot (porta 8080, só localhost) é alcançado via proxy `/api` do Next.
- Por causa do túnel, **a origem TCP é sempre local**. Por isso `fail2ban`/`iptables`/`ufw` NÃO adiantam: o bloqueio tem de ser
  na aplicação ou no Cloudflare. O IP real vem em `X-Forwarded-For` / `CF-Connecting-IP` (no xpto.in, `trust proxy = 1` do Express funcionou).
- Atacantes IPv6 giram dentro do próprio prefixo: bloquear por **/64**, não pelo endereço exato.
- O país vem no header `CF-IPCountry`.

## O que foi feito no XPTO Tools (referência, repositório `~/projects/xpto-tools`)
- `util/security.js`: middleware **antes de tudo** (antes do log). Pontua cada requisição suspeita por IP numa janela de 60 s:
  caminho de alto sinal (`.env`, `.git`, `*.php`, `wp-*`, `phpinfo`, `cgi-bin`, `actuator`, traversal...) = 3 pontos; 404 comum = 1 ponto
  (mesmo caminho repetido não soma; `favicon.ico`/`robots.txt` são ignorados). **10 pontos** => bloqueia o IP por 7 dias (168 h) (resposta 403 vazia, sem log).
  Login de admin: **5 falhas (401) em 10 min** => bloqueio de 1 h e alerta urgente. Login de admin de um **IP nunca visto** => alerta.
- Nunca bloqueia: IP privado/loopback, `SECURITY_ALLOW_IPS`, nem quem está com sessão de admin válida.
- Alerta no celular via **ntfy** (https://ntfy.sh): `POST https://ntfy.sh/<TOPIC>` com headers `Title` (só ASCII), `Priority` (3 scan, 4 login novo, 5 brute force),
  `Tags`, `Click` (link para o painel). Máx. 8 alertas de scan por hora para não lotar o celular. O tópico é um segredo: está só em `SECURITY_NTFY_TOPIC`
  no `.env` do servidor do xpto-tools (`/home/luna/projects/xpto-tools/.env`). **Não copie o valor para o git nem para chat.**
- Bloqueios ficam no Redis com TTL (sobrevivem a restart); incidentes numa lista capada.
- Painel `/admin/security`: IPs bloqueados (com desbloquear e bloquear manual), incidentes, botão "Send test alert".

## O que fazer no Luna (proposta, a decidir com o dono)
1. **Cloudflare WAF (grátis, sem código, maior ganho)**: regra de "Custom rule" para bloquear no edge caminhos que o Luna nunca serve:
   `.env`, `/.git`, `*.php`, `wp-`, `phpinfo`, `cgi-bin`, `xmlrpc`, `/vendor/`. Isso corta o ruído antes de chegar ao servidor.
   (É configuração no painel do Cloudflare, o dono faz; passe o passo a passo.)
2. **Guarda na aplicação**: o ponto de entrada exposto é o **Next.js** (porta 1313). Opções:
   - `middleware.ts` do Next: reconhecer os caminhos de alto sinal (não vê o status da resposta, então só dá para pontuar por caminho),
     manter contagem por IP/64 e bloquear com 403. Estado em memória do processo (suficiente) ou no Redis se o Luna passar a usar um.
   - Alternativa sem tocar no app: um **serviço leve** que lê os logs de acesso e dispara o ntfy e a regra. Só vale se o Next/nginx logar acessos.
   - Não duplicar a lógica no Spring: ele só recebe tráfego já filtrado pelo Next (`/api`).
3. **Alerta**: usar o **mesmo ntfy**, mas pedir ao dono para escolher entre reaproveitar o tópico de segurança do xpto.in ou criar outro
   (tópico novo = alertas separados por sistema). O tópico de backups do Luna (`BACKUP_ALERT_WEBHOOK`) é outro e deve continuar separado.
4. **Login do Luna**: ver se já há limite de tentativas por IP/usuário no login (Spring Security). Se não, adicionar; e alertar em
   "N falhas de login" e "login de superusuário de IP novo" (superusuário: `pilovieira@gmail.com`).
5. **Dono nunca pode ser bloqueado**: manter allowlist por env e exceção para sessão autenticada.

## Restrições do Luna (do `contexto.md`)
- Código só via GitHub (branch `main`), deploy com `ssh luna-deploy` (build do que mudou + backup + restart + health). **Nunca editar código direto no servidor.**
- `.env` do Luna em `/home/luna/projects/luna-gestao/.env` (600, fora do git). Segredos novos vão lá.
- Sem acesso SSH pela internet; o acesso é só na rede local. Reiniciar serviços: `sudo systemctl restart luna-backend luna-frontend`.
- Não mexer na rota `xpto.in -> localhost:1113` (é o XPTO Tools). Qualquer mudança no túnel é no painel do Cloudflare (modo token).
- Migrações Flyway: nunca editar uma aplicada; tabela nova precisa de RLS (`ENABLE` + `FORCE` + política).

## Primeiro passo sugerido
Ler os logs reais do Luna (`journalctl -u luna-frontend --since -7d`) para ver quais caminhos os scanners pedem, confirmar se o Next loga
acessos e o IP real, e só então escolher entre middleware do Next ou regra no Cloudflare (provavelmente os dois).
