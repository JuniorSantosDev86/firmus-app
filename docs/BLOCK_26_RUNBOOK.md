# Block 26 — Observability and Stability Runbook (MVP)

Este runbook cobre apenas o baseline mínimo de operação introduzido no Block 26.

## Endpoints internos

- `GET /api/internal/observability/health`
  - objetivo: mostrar sinais de saúde em formato legível
  - retorno principal: `health.status`, `health.summary`, `health.signals`

- `GET /api/internal/observability/backup`
  - objetivo: gerar envelope de backup da store protegida
  - retorno principal: `backup` (schema v1) e `summary`

- `POST /api/internal/observability/restore`
  - objetivo: validar/aplicar restore da store protegida
  - payload:
    - `backup`: envelope retornado por `/backup`
    - `dryRun` (opcional): `true` para validação sem gravar
  - retorno principal: `dryRun`, `restored`, `summary`

## Resposta de falha controlada

Falhas retornam payload seguro:

- `ok: false`
- `failure.code`
- `failure.message`
- `failure.recoverable`
- `failure.status`

Exemplo de código esperado para payload inválido:
- `OBS_INVALID_BACKUP_PAYLOAD`

## Verificação manual recomendada

1. Autenticar e chamar `GET /api/internal/observability/health`.
2. Confirmar distinção de estado (`healthy` vs `degraded`) e leitura dos sinais.
3. Gerar backup com `GET /api/internal/observability/backup`.
4. Executar `POST /api/internal/observability/restore` com `dryRun: true`.
5. Executar `POST /api/internal/observability/restore` com o mesmo backup (`dryRun` ausente/false).
6. Confirmar que `summary` pós-restore bate com o backup de origem.
