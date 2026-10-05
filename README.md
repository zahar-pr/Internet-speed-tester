# Internet Speed Tester

Замер скорости интернета: N последовательных запросов (по умолчанию 10) к «тяжелому» файлу, подсчет среднего времени запроса, объема скачанных данных и скорости в МБ/с.

Две версии:
- **`speedtest.py`** - консольный скрипт на Python (только стандартная библиотека).
- **`docs/`** - веб-версия на чистом HTML/CSS/JS, развернута на GitHub Pages.

## Онлайн-версия

https://zahar-pr.github.io/Internet-speed-tester/

Открыть, при желании вписать свой адрес файла, нажать «Старт».
Внешний адрес должен отдавать заголовок CORS (`Access-Control-Allow-Origin`), иначе браузер не даст прочитать ответ. По умолчанию используется файл `test-5mb.bin` (5 МБ) с того же сервера.

## Консольный скрипт

Требуется Python 3.8+. Зависимости не нужны.

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

Параметры:

| Параметр | Описание | По умолчанию |
|---|---|---|
| `url` | адрес тяжелого файла | `test-5mb.bin` на GitHub Pages |
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
