# Deployment instructions for hosting on your server

Quick steps (Docker + Portainer):

- **Prepare env**: copy `.env.example` to `.env` and set real secrets.
- **Start via CLI** (recommended):

```bash
cp .env.example .env
# edit .env then
cd devops
docker-compose -f docker-compose-fullstack.yml up -d
```

- **Start via Portainer**: In Portainer -> Stacks -> Add stack -> paste the contents of `devops/docker-compose-fullstack.yml`. Add environment variables using the web editor or upload an `.env` file. Deploy the stack.

Ports exposed (host -> container):

- **Postgres**: `5433` -> `5432`
- **pgAdmin**: `5050` -> `80`
- **Backend (Django)**: `8000` -> `8000`
- **Frontend**: `3000` -> `3000`

Tailscale notes:

- Use your server's Tailscale IP (run `tailscale ip -4`) and connect to services at `http://<tailscale-ip>:3000` for frontend, or `http://<tailscale-ip>:8000` for backend.
- If you need a custom domain, run a reverse proxy and expose the proxy port via Tailscale or an external DNS.

Tailscale details for this host:

- Hostname: `agham-cloud`
- Tailscale IP (IPv4): `100.93.255.84`

Example URLs using your Tailscale IP:

- Frontend: `http://100.93.255.84:3000`
- Backend: `http://100.93.255.84:8000`
- pgAdmin: `http://100.93.255.84:5050`

Important Django note:

- Make sure `DJANGO_ALLOWED_HOSTS` in your `.env` includes your Tailscale IP and hostname, e.g.:

	`DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1,100.93.255.84,agham-cloud`

- For external testing from other devices, set `DJANGO_DEBUG=False` in production and ensure your firewall allows the exposed ports (3000, 8000, 5050, 5433).

Verification & common tasks:

- Check running containers: `docker compose -f devops/docker-compose-fullstack.yml ps`
- View logs: `docker compose -f devops/docker-compose-fullstack.yml logs -f`
- Enter backend shell: `docker compose -f devops/docker-compose-fullstack.yml exec backend /bin/sh`

If any service fails to build, check the build contexts in `devops/docker-compose-fullstack.yml` (they point to `../backend` and `../frontend` relative to the `devops` folder).
