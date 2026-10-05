# Internet Speed Tester

Замер скорости интернета: N последовательных запросов (по умолчанию 10) к «тяжелому» файлу, подсчет среднего времени запроса, объема скачанных данных и скорости в МБ/с.

Две версии:
- **`speedtest.py`** - консольный скрипт на Python (только стандартная библиотека).
- **`docs/`** - веб-версия на чистом HTML/CSS/JS, развернута на GitHub Pages.

## Онлайн-версия

https://zahar-pr.github.io/Internet-speed-tester/

Открыть, выбрать готовый файл из списка или вписать свой адрес, нажать «Старт».

### CORS

Работает с любым адресом:
- сервер отдает `Access-Control-Allow-Origin` - тело ответа читается, байты считаются точно;
- сервер CORS не разрешает - файл качается в режиме `no-cors`, время берется из Resource Timing API, а размер из списка готовых файлов или из поля «Размер, МБ». В логе такие запросы помечены `[без CORS]`.

Наш собственный файл `test-5mb.bin` на GitHub Pages отдается с `Access-Control-Allow-Origin: *`.

## Консольный скрипт

Требуется Python 3.9+. Зависимости не нужны.

```bash
git clone https://github.com/zahar-pr/Internet-speed-tester.git
cd Internet-speed-tester

# файл по умолчанию (5 МБ с GitHub Pages), 10 запросов
python3 speedtest.py

# свой адрес
python3 speedtest.py https://example.com/big-image.jpg

# другое число запросов и таймаут
python3 speedtest.py https://example.com/big-image.jpg -n 5 -t 30
```

## Готовые ссылки

Список хранится в `docs/links.json` и общий для скрипта и сайта. Все отдают `Access-Control-Allow-Origin: *`.

| № | Формат | Размер | Источник |
|---|---|---|---|
| 1 | OGG аудио | 0.1 МБ | upload.wikimedia.org |
| 2 | PNG картинка | 0.2 МБ | upload.wikimedia.org |
| 3 | MP4 видео | 0.8 МБ | raw.githubusercontent.com |
| 4 | GIF анимация | 1 МБ | upload.wikimedia.org |
| 5 | PDF документ | 1 МБ | cdn.jsdelivr.net |
| 6 | JSON данные | 1.3 МБ | cdn.jsdelivr.net |
| 7 | JPG фото | 2.1 МБ | upload.wikimedia.org |
| 8 | JS скрипт | 9.1 МБ | cdn.jsdelivr.net |
| 9 | BIN бинарник | 25 МБ | speed.cloudflare.com |
| 10 | WEBM видео | 97 МБ | upload.wikimedia.org |

```bash
python3 speedtest.py --list   # показать ссылки
python3 speedtest.py 9        # замер по ссылке №9 (25 МБ)
```

Параметры:

| Параметр | Описание | По умолчанию |
|---|---|---|
| `url` | адрес тяжелого файла или номер готовой ссылки 1-10 | `test-5mb.bin` на GitHub Pages |
| `-l`, `--list` | показать готовые ссылки | - |
| `-n`, `--requests` | число запросов | 10 |
| `-t`, `--timeout` | таймаут одного запроса, сек | 60 |

Пример вывода:

```
URL: https://zahar-pr.github.io/Internet-speed-tester/test-5mb.bin
Запросов: 10

# 1:     5.24 МБ за  0.612 с ->    8.57 МБ/с
...
--- Итог ---
Успешных запросов: 10/10
Среднее время запроса: 0.598 с
Скачано всего: 52.43 МБ
Скорость: 8.77 МБ/с (70.15 Мбит/с)
```

Скорость = весь скачанный объем / суммарное время всех запросов. К каждому запросу добавляется параметр `nocache`, чтобы не попадать в кэш.

## Деплой

Сайт собирается из папки `docs/` GitHub Actions-воркфлоу `.github/workflows/pages.yml`.
Один раз включить: **Settings → Pages → Source: GitHub Actions**, затем перезапустить воркфлоу (Actions → Deploy to GitHub Pages → Run workflow).
