# Oracle VM deployment

The public web app must call a relative `/api` URL. Nginx terminates the public request and proxies it to the API on `127.0.0.1:4000`, so the VM address is never compiled into the client bundle.

## GitHub configuration

Create a production environment and add these Actions secrets:

- `ORACLE_HOST`: VM host or IP.
- `ORACLE_USER`: SSH user.
- `ORACLE_SSH_KEY`: private deployment key.
- `ORACLE_SSH_PORT`: SSH port; use `22` unless changed.
- `ORACLE_DEPLOY_PATH`: absolute release directory, for example `/opt/origin`.

Add repository variable `ORACLE_DEPLOY_ENABLED=false` while provisioning. Change it to `true` only after the VM setup below is complete.

Do not put any of those values in `NEXT_PUBLIC_*`, committed `.env` files, workflow YAML, or client code. A public service address can still be discovered from network traffic; this design prevents accidental source and bundle exposure, not network discovery.

## VM prerequisites

1. From a checkout of this repository on the VM, run `infra/scripts/provision-oracle.sh`.
2. Create `/opt/origin/shared/api.env` with API-only values such as database credentials and allowed origins.
3. Point the domain's `A` record to the Oracle VM and make sure inbound TCP ports `80` and `443` are open in the Oracle Cloud security list.
4. Run `infra/scripts/enable-https.sh DOMAIN EMAIL`. Add more domain arguments when both apex and `www` should be covered.
5. The HTTPS script asks Certbot to update Nginx, redirect HTTP to HTTPS, and performs a renewal dry run.

Certbot is installed from the officially recommended snap package. Its systemd timer renews certificates automatically before expiry.

The workflow uploads the static web output, compiled API, workspace lockfile, and release version. It installs only production API dependencies on the VM and restarts `origin-api`.

The API stores anonymous comments and revision proposals in `PARTICIPATION_DATA_FILE` and daily trend snapshots in `TREND_DATA_FILE` under the shared directory. Keep both files in the same backup scope as memes, categories, and the admin inbox. Set `TREND_INGEST_TOKEN` only in the Oracle environment and the scheduler secret store.

## Static admin deployment

The admin build uses the `/viral` base path and is served as static files on the existing `iftype.store` Nginx server. It does not add another Node process. The `/viral/api/` location proxies only admin API calls to the ViralOrigin API domain.

Required secrets are `ADMIN_ORACLE_HOST`, `ADMIN_ORACLE_USER`, `ADMIN_ORACLE_SSH_KEY`, `ADMIN_ORACLE_SSH_PORT`, and `ADMIN_ORACLE_DEPLOY_PATH`. Enable the job with repository variable `ADMIN_DEPLOY_ENABLED=true`.

## Media storage boundary

The Oracle release directory stores code and JSON metadata only. Do not upload meme images or video files to the VM. The current web build uses unoptimized external image URLs so the browser fetches thumbnails from their HTTPS origin. The planned managed path is object storage plus CDN as defined in `PLAN.md`.
