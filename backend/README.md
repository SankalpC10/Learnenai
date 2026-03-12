
# LernenAI — AI Blog Generation Platform (Backend)

FastAPI backend for automated SEO blog generation. Crawls a domain, profiles the brand via Gemini AI, suggests keywords, generates full blog drafts, and publishes to WordPress.

## Quick Start

```bash
# 1. Activate venv & install deps
.\venv\Scripts\activate
pip install -r requirements.txt

# 2. Set your Gemini API key in .env
echo GEMINI_API_KEY=your_key_here > .env

# 3. Start the server
uvicorn main:app --reload --port 8000
```

Server runs at `http://localhost:8000` — Swagger docs at `/docs`

---

## API Validation (curl)

### Health Check

```bash
curl http://localhost:8000/health
```

Expected: `{"status":"ok"}`

---

### 1. Submit a Domain for Crawling

```bash
curl -X POST http://localhost:8000/api/v1/domains \
  -H "Content-Type: application/json" \
  -d '{"url": "https://thehappycustomers.com"}'
```

Expected: Returns domain object with `"crawl_status": "pending"`. Background crawl + AI brand analysis starts automatically.

---

### 2. Check Domain Crawl Status

```bash
curl http://localhost:8000/api/v1/domains/1
```

Expected: Once complete, returns full brand profile:
```json
{
  "id": 1,
  "url": "https://thehappycustomers.com",
  "company_name": "The Happy Customers",
  "industry": "BPO / Customer Support Outsourcing",
  "target_audience": "German SMEs and Mittelstand companies...",
  "brand_voice": "professional",
  "key_topics": ["multilingual support", "GDPR compliance", ...],
  "crawl_status": "completed",
  "pages_crawled": 13
}
```

---

### 3. List All Domains

```bash
curl http://localhost:8000/api/v1/domains
```

---

### 4. Generate Keyword Suggestions

```bash
curl -X POST http://localhost:8000/api/v1/keywords/suggest \
  -H "Content-Type: application/json" \
  -d '{"domain_id": 1, "count": 10}'
```

Expected: Returns array of keyword objects with `keyword`, `search_volume`, `difficulty`, and `suggested_title`.

> **Note:** Requires domain crawl to be `"completed"` first.

---

### 5. List Keywords for a Domain

```bash
curl "http://localhost:8000/api/v1/keywords?domain_id=1"
```

---

### 6. Generate a Blog Post

Using a keyword ID from step 4:

```bash
curl -X POST http://localhost:8000/api/v1/blogs/generate \
  -H "Content-Type: application/json" \
  -d '{"domain_id": 1, "keyword_id": 1}'
```

Or with a custom keyword:

```bash
curl -X POST http://localhost:8000/api/v1/blogs/generate \
  -H "Content-Type: application/json" \
  -d '{"domain_id": 1, "custom_keyword": "GDPR compliant customer support outsourcing", "word_count": 1500}'
```

Expected: Returns full blog post with `title`, `slug`, `meta_description`, `body_html`, `word_count`.

> **Note:** Generation takes 15-30 seconds depending on word count.

---

### 7. List All Blog Posts

```bash
curl http://localhost:8000/api/v1/blogs

# Filter by domain
curl "http://localhost:8000/api/v1/blogs?domain_id=1"
```

---

### 8. Get a Single Blog Post

```bash
curl http://localhost:8000/api/v1/blogs/1
```

---

### 9. Edit a Blog Post

```bash
curl -X PUT http://localhost:8000/api/v1/blogs/1 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title", "meta_description": "Updated meta description"}'
```

---

### 10. Publish to WordPress

```bash
curl -X POST http://localhost:8000/api/v1/blogs/1/publish \
  -H "Content-Type: application/json" \
  -d '{
    "wp_url": "https://your-wordpress-site.com",
    "wp_username": "admin",
    "wp_password": "your-app-password",
    "publish_status": "draft"
  }'
```

Expected: Returns updated blog with `wp_post_id` and `wp_url`.

> **Requires:** WordPress Application Password (Settings → Users → Application Passwords).

---

## Full E2E Test (PowerShell)

```powershell
# Submit domain
.\venv\Scripts\python.exe -c "import httpx; r = httpx.post('http://localhost:8000/api/v1/domains', json={'url': 'https://thehappycustomers.com'}); print(r.json())"

# Wait for crawl (~20s), then check
.\venv\Scripts\python.exe -c "import httpx, json; r = httpx.get('http://localhost:8000/api/v1/domains/1'); print(json.dumps(r.json(), indent=2))"

# Generate keywords
.\venv\Scripts\python.exe -c "import httpx, json; r = httpx.post('http://localhost:8000/api/v1/keywords/suggest', json={'domain_id': 1, 'count': 5}, timeout=60); print(json.dumps(r.json(), indent=2))"

# Generate blog post
.\venv\Scripts\python.exe -c "import httpx, json; r = httpx.post('http://localhost:8000/api/v1/blogs/generate', json={'domain_id': 1, 'keyword_id': 1}, timeout=120); print(json.dumps(r.json(), indent=2))"
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | ✅ | Google Gemini API key |
| `DATABASE_URL` | ❌ | Default: `sqlite+aiosqlite:///./lernenai.db` |
| `DATAFORSEO_LOGIN` | ❌ | DataForSEO API login (for real keyword data) |
| `DATAFORSEO_PASSWORD` | ❌ | DataForSEO API password |
| `WP_SITE_URL` | ❌ | WordPress site URL for publishing |
| `WP_USERNAME` | ❌ | WordPress username |
| `WP_APP_PASSWORD` | ❌ | WordPress application password |

---

## Tech Stack

- **Framework:** FastAPI + Uvicorn
- **Database:** SQLite (dev) / PostgreSQL (prod) via SQLAlchemy async
- **AI:** Google Gemini 3 Flash Preview with Pydantic structured outputs
- **Crawling:** httpx + BeautifulSoup4
