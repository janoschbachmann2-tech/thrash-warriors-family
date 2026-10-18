# Trash Warriors – im Browser bereitstellen

Dieses Paket ist für Render vorbereitet. Es enthält das fertige Spiel, vier Spielerzugänge und die gemeinsame dauerhafte Speicherung. Noch nicht veröffentlicht. Die lokale HTML-Datei bleibt erhalten.

## 1. Dateien vorbereiten
ZIP entpacken (Windows: Rechtsklick → Alle extrahieren). Nicht die ZIP selbst hochladen.

## 2. Privates GitHub-Projekt anlegen
https://github.com/new
Name: trash-warriors-family
Sichtbarkeit: Private. README beim Anlegen einschalten, dann Create repository.
Im Projekt Add file → Upload files öffnen. Den INHALT dieses entpackten Ordners hochladen, einschließlich des Ordners public. render.yaml und server.mjs müssen direkt auf oberster Ebene liegen. Änderungen speichern (Commit changes).
Keine Passwörter oder Einrichtungsschlüssel dort ablegen.

## 3. Bei Render bereitstellen
https://dashboard.render.com
Mit GitHub anmelden. New → Blueprint. Das private Projekt verbinden (GitHub-Zugriff auf dieses Projekt erlauben). Render liest render.yaml.
Vor Deploy Blueprint die angezeigten laufenden Kosten prüfen. Dieses Paket nutzt einen kostenpflichtigen Starter-Webdienst und 1 GB dauerhaften Speicher. Aktuelle Preise: https://render.com/pricing
Noch kein kostenpflichtiger Dienst wurde durch Codex angelegt.
Wenn die Kosten passen: Deploy Blueprint. Warten, bis der Webdienst Live meldet. Seine öffentliche https-Adresse ist euer späterer Familienlink.

## 4. Vier Zugänge einrichten
Beim Webdienst unter Environment den automatisch erzeugten Wert SETUP_KEY anzeigen/kopieren. Nicht im Chat teilen.
Die öffentliche Spieladresse mit /setup am Ende öffnen. Einrichtungsschlüssel einfügen und vier verschiedene Passwörter festlegen (je mindestens 8 Zeichen). Familie einrichten anklicken.
Danach die normale Spieladresse öffnen. Person auswählen und mit dem neuen Passwort anmelden. Die alten vierstelligen lokalen PINs gelten online nicht.

## 5. Gemeinsamen Spielstand testen
Janosch auf Gerät A, Mio auf Gerät B anmelden. Eine erlaubte Aufgabe erledigen. Innerhalb von etwa 10 Sekunden müssen beide denselben neuen Stand sehen. Anschließend neu laden und erneut prüfen.
Tanja prüft das Anlegen/Löschen einer Sonderaufgabe. Auch nach einem Neustart des Render-Dienstes müssen die Punkte erhalten bleiben.
Erst nach diesen Prüfungen den Link an alle weitergeben. Der eigentliche Zwei-Geräte-Test und der Betrieb bei Render sind noch offen.

## Vorhandenen lokalen Spielstand übernehmen
Online beginnt zunächst eine neue Familie. Soll der bisherige lokale Spielstand übernommen werden: zuerst lokal eine Sicherung exportieren. Danach online als Tanja unter Einstellungen importieren. Der Import ersetzt den gemeinsamen Online-Spielstand. Nicht vor einer Sicherung ausführen.

## Sicherung und Betrieb
Regelmäßig den Spielstand über Einstellungen exportieren und separat aufbewahren. Nur Dateien unter /var/data bleiben bei Render dauerhaft erhalten. Der Server nutzt genau einen Dienstprozess und eine Instanz; keine weiteren Instanzen oder Parallelprozesse starten. Kennwörter sind gesalzen gehasht, Sitzungen laufen nach sieben Tagen ab. Das Spiel ist für eure vierköpfige Familie ausgelegt.

## Technische Kontrolle
Node.js ab 22.13, keine zusätzlichen Pakete erforderlich. Start: npm start. Tests: npm test. Lokal SETUP_KEY (mindestens 32 zufällige Zeichen) und DATA_DIR setzen. Online setzt render.yaml diese Werte. Unter Node 22 ist Web Crypto verfügbar.

Offizielle Anleitungen:
https://docs.github.com/en/repositories/working-with-files/managing-files/adding-a-file-to-a-repository
https://render.com/docs/infrastructure-as-code
https://render.com/docs/disks
