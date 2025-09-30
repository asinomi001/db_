
README — Сборка одного .exe через GitHub Actions (не требует установки ПО у конечных пользователей)

Идея: вы пушите этот репозиторий на GitHub. GitHub Actions автоматически соберёт один .exe (включая Node.js runtime) с помощью pkg, и вы сможете скачать exe как артефакт сборки. Конечному пользователю достаточно скачать exe — ничего не устанавливать.

Шаги:
1) Создайте новый репозиторий на GitHub и запушьте файлы (account_system.js, package.json, README.md, .github/workflows/build.yml).
2) GitHub Actions автоматически запустит workflow и через несколько минут в разделе "Actions" → workflow → "Artifacts" будет доступен account_system-win.exe.
