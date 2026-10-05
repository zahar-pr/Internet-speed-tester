#!/usr/bin/env python3
"""Замер скорости интернета: N последовательных запросов к URL, среднее время и скорость."""

import argparse
import json
import sys
import time
import urllib.request
from pathlib import Path

DEFAULT_URL = "https://zahar-pr.github.io/Internet-speed-tester/test-5mb.bin"
CHUNK = 64 * 1024
LINKS_FILE = Path(__file__).parent / "docs" / "links.json"


def load_links() -> list[dict]:
    """Готовые ссылки на файлы разного размера и формата (общие с веб-версией)."""
    return json.loads(LINKS_FILE.read_text(encoding="utf-8"))


def download(url: str, timeout: float) -> tuple[int, float]:
    """Скачивает url целиком, возвращает (байты, секунды)."""
    sep = "&" if "?" in url else "?"
    req = urllib.request.Request(
        f"{url}{sep}nocache={time.time_ns()}",
        headers={"User-Agent": "speedtest.py", "Cache-Control": "no-cache"},
    )
    start = time.perf_counter()
    size = 0
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        while chunk := resp.read(CHUNK):
            size += len(chunk)
    return size, time.perf_counter() - start


def main() -> int:
    parser = argparse.ArgumentParser(description="Замер скорости скачивания")
    parser.add_argument("url", nargs="?", default=DEFAULT_URL,
                        help="адрес тяжелого файла или номер готовой ссылки (см. --list)")
    parser.add_argument("-n", "--requests", type=int, default=10, help="число запросов (10)")
    parser.add_argument("-t", "--timeout", type=float, default=60, help="таймаут, сек (60)")
    parser.add_argument("-l", "--list", action="store_true", help="показать готовые ссылки")
    args = parser.parse_args()

    if args.list:
        for i, link in enumerate(load_links(), 1):
            print(f"{i:>2}. {link['name']:<22} {link['url']}")
        return 0

    if args.url.isdigit():
        links = load_links()
        index = int(args.url)
        if not 1 <= index <= len(links):
            parser.error(f"номер ссылки должен быть от 1 до {len(links)}")
        args.url = links[index - 1]["url"]

    print(f"URL: {args.url}\nЗапросов: {args.requests}\n")
    sizes, times = [], []
    for i in range(1, args.requests + 1):
        try:
            size, elapsed = download(args.url, args.timeout)
        except Exception as e:
            print(f"#{i:>2}: ошибка - {e}")
            continue
        sizes.append(size)
        times.append(elapsed)
        print(f"#{i:>2}: {size / 1e6:8.2f} МБ за {elapsed:6.3f} с -> {size / elapsed / 1e6:7.2f} МБ/с")

    if not times:
        print("\nНи один запрос не удался.")
        return 1

    total_mb = sum(sizes) / 1e6
    total_s = sum(times)
    speed = total_mb / total_s
    print("\n--- Итог ---")
    print(f"Успешных запросов: {len(times)}/{args.requests}")
    print(f"Среднее время запроса: {total_s / len(times):.3f} с")
    print(f"Скачано всего: {total_mb:.2f} МБ")
    print(f"Скорость: {speed:.2f} МБ/с ({speed * 8:.2f} Мбит/с)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
