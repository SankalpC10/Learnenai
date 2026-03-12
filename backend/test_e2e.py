"""Quick E2E test: keyword suggestion + blog generation."""
import httpx
import json

BASE = "http://localhost:8000"

# Step 1: Suggest keywords
print("=== KEYWORD SUGGESTIONS ===")
r = httpx.post(f"{BASE}/api/v1/keywords/suggest", json={"domain_id": 1, "count": 5}, timeout=60)
print(f"Status: {r.status_code}")
keywords = r.json()
for kw in keywords:
    print(f"  [{kw['id']}] {kw['keyword']}  (Vol: {kw['search_volume']}, Diff: {kw['difficulty']})")
    print(f"       Title: {kw['suggested_title']}")

if not keywords:
    print("No keywords returned!")
    exit(1)

# Step 2: Generate a blog post from the first keyword
first_kw_id = keywords[0]["id"]
print(f"\n=== GENERATING BLOG POST (keyword_id={first_kw_id}) ===")
r = httpx.post(f"{BASE}/api/v1/blogs/generate", json={"domain_id": 1, "keyword_id": first_kw_id}, timeout=120)
print(f"Status: {r.status_code}")
blog = r.json()
print(f"  Title: {blog.get('title', 'N/A')}")
print(f"  Slug: {blog.get('slug', 'N/A')}")
print(f"  Meta: {blog.get('meta_description', 'N/A')}")
print(f"  Words: {blog.get('word_count', 0)}")
print(f"  Body preview: {(blog.get('body_html', '') or '')[:200]}...")
