# revroute-mcp

[English](README.md) · **Русский**

Официальный MCP-сервер (Model Context Protocol) для [revroute.ru](https://revroute.ru).
Даёт любой LLM-модели (Claude, Cursor, Claude Code и т.д.) полный контроль над вашими
короткими ссылками, аналитикой, доменами, клиентами и партнёрской / реферальной программой.

## Что умеет

### 🔗 Короткие ссылки и домены
- Создание, поиск, обновление, архивация и удаление ссылок поштучно или пачками до 100
- Bulk-импорт кампаний, upsert по URL, поиск по id / externalId / domain+key
- Управление собственными доменами, проверка доступности, fallback-URL
- Организация ссылок через **теги** и **папки**

### 📊 Аналитика и трекинг конверсий
- Агрегация кликов, лидов, продаж и выручки за любой период
- Группировка по стране, городу, устройству, браузеру, ОС, реферу, UTM-меткам, top-ссылкам, top-URL
- Поток сырых событий для точного анализа
- Генерация QR-кодов для любой ссылки (возвращается base64 PNG inline)
- Отправка `track_lead` / `track_sale` для атрибуции конверсий к клику

### 🤝 Партнёрская / реферальная / аффилейт программа
- Управление **партнёрами**: приглашение, одобрение, бан, отказ, обновление данных
- Отслеживание **комиссий** по партнёру, клиенту или invoice — смена статуса (одобрить, помечать фрод, refund)
- **Баунти** (одноразовые награды, performance- или submission-based) с датами и суммами
- Список и инициация **выплат** партнёрам, фильтр по партнёру/статусу/invoice
- Просмотр социального профиля партнёра, метрик lifetime-value, conversion rates, earnings-per-click

### 👥 Клиенты
- CRUD клиентских записей, поиск по externalId из вашей CRM или по email

## Быстрый старт

### 1. Получите API-ключ

revroute.ru → настройки workspace → API keys → создайте ключ с нужными scope'ами.

### 2. Установка — на выбор

**Вариант A · Claude Desktop, один клик (рекомендуется)**

1. Скачайте `revroute-mcp-<версия>.dxt` из
   [GitHub Releases](https://github.com/IndiFox/revroute-mcp/releases/latest).
2. Перетащите файл в окно Claude Desktop — или Settings → Extensions →
   *Install Extension* → выбрать `.dxt`.
3. Вставьте свой API-ключ revroute в форму. Поле *Enable partner-program tools* —
   `1` если вы используете партнёрскую/реферальную программу, иначе `0` (10 партнёрских
   тулов останутся скрытыми, чтобы не засорять `tools/list`).
4. Готово. Откройте новый чат: «покажи мои короткие ссылки revroute».

**Вариант B · Claude Code / Cursor / собственные MCP-клиенты через `npx`**

```bash
# Claude Code
claude mcp add revroute \
  --env REVROUTE_API_KEY=<ваш-ключ-revroute> \
  --env REVROUTE_ENABLE_PARTNERS=1 \
  -- npx -y revroute-mcp
```

```json
// Cursor: .cursor/mcp.json (на проект) или ~/.cursor/mcp.json (глобально)
{
  "mcpServers": {
    "revroute": {
      "command": "npx",
      "args": ["-y", "revroute-mcp"],
      "env": {
        "REVROUTE_API_KEY": "<ваш-ключ-revroute>",
        "REVROUTE_ENABLE_PARTNERS": "1"
      }
    }
  }
}
```

В свежих версиях Claude Desktop путь через JSON-конфиг постепенно сворачивается в пользу
`.dxt` Extensions — на десктопе предпочитайте Вариант A.

### 3. Попробуйте

```
Вы:     Создай короткую ссылку на https://example.com с тегом «launch».
Claude: [вызывает revroute_link_create] → https://rev.ru/abc123

Вы:     Какие партнёры принесли больше всего выручки за прошлый месяц?
Claude: [revroute_partner_list, сортировка по netRevenue] → топ-5 партнёров

Вы:     Покажи конверсии по странам за последние 30 дней.
Claude: [revroute_analytics_query groupBy="countries"] → таблица
```

## Переменные окружения

| Переменная                  | Обязательная | По умолчанию                  | Описание                                                  |
| --------------------------- | ------------ | ----------------------------- | --------------------------------------------------------- |
| `REVROUTE_API_KEY`          | да¹          | —                             | API-ключ workspace. ¹Не нужна для HTTP-транспорта.        |
| `REVROUTE_API_BASE_URL`     | нет          | `https://app.revroute.ru/api` | Переопределение для staging / on-premise.                 |
| `REVROUTE_ENABLE_PARTNERS`  | нет          | `0`                           | `1` — включить 10 партнёрских тулов.                      |
| `REVROUTE_DEBUG`            | нет          | `0`                           | Детальное логирование в stderr (заголовки маскируются).   |
| `REVROUTE_HTTP_HOST`        | нет          | `127.0.0.1`                   | Хост HTTP-транспорта.                                     |
| `REVROUTE_HTTP_PORT`        | нет          | `8787`                        | Порт HTTP-транспорта.                                     |
| `REVROUTE_CORS_ORIGIN`      | нет          | `*`                           | CORS-allowlist для HTTP-транспорта (через запятую).       |

## Транспорты

- **stdio** (по умолчанию) — для Claude Desktop / Claude Code / Cursor через `npx`
- **Streamable HTTP** — `revroute-mcp --transport http --port 8787` — для удалённого / hosted-варианта,
  per-request `Authorization: Bearer <api_key>`

## Полный каталог тулов

См. английский [README](README.md#tool-catalog) — там полный список 36 базовых + 10 партнёрских
тулов с подробными описаниями.

## Разработка и contributing

```
pnpm install
pnpm dev       # tsx watch
pnpm typecheck
pnpm test
pnpm build
```

Подробнее — [CONTRIBUTING.md](CONTRIBUTING.md). Уязвимости — [SECURITY.md](SECURITY.md).

## Лицензия

MIT — см. [LICENSE](LICENSE).
