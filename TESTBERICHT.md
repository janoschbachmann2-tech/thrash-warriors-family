# Prüfung der alternativen Bereitstellung

18.10.2026

Bestanden: 14 bisherige Server-/Spielregel-Prüfgruppen auf die neue API übertragen, außerdem echte Dateiablage im Projekt-Testordner, gehashte Passwörter und Ablehnung fremder Anfrageursprünge. Syntaxkontrolle des HTTP-Servers bestanden. Die Spiellogik und alle eingebetteten Bilder wurden unverändert übernommen.

Der Datei-Test lief mit temporären Testkonten, nicht mit euren künftigen Passwörtern. Kein Spielstand und kein Einrichtungsschlüssel sind im Paket enthalten.

Nicht bestätigt: HTTP-Ende-zu-Ende-Test. Windows blockiert die lokale Verbindung mit EACCES; der Server ließ sich starten, der Testclient durfte ihn nicht erreichen. Test für eine normale Umgebung ist enthalten (RUN_HTTP_TESTS=1 npm test). Veröffentlichung und Zwei-Geräte-Abgleich sind noch offen. Noch kein öffentlicher Link.

Ausführung: npm test. Keine Paketinstallation erforderlich. Beim Deployment sorgt render.yaml für genau einen Node-Prozess und dauerhafte Speicherung unter /var/data. Der kostenlose Render-Webdienst ohne Disk ist für dieses Paket nicht geeignet, weil er den Spielstand bei Neustart verlieren würde.
