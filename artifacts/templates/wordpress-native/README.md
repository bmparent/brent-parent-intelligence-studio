# Native WordPress acceptance — 2026-10-11

The native API gate passed for the four exact WordPress 1.0.2 buyer ZIPs on
WordPress **6.6**, PHP **8.1.34 NTS x64**, and MariaDB **10.11.19** on Windows.
There were four independent document roots and databases on one machine, one
MariaDB process, and four PHP built-in development servers bound to separate
127.0.0.1 ports. This is conventional native PHP/MariaDB evidence, with a
development HTTP server; it is not Apache/nginx, managed hosting, WordPress.com,
or production proof.

The authority is `../wordpress-install-external/native-php-receipt.json`.
The `browser-ui-receipt.json` compatibility alias contains the same current
native API receipt and explicitly identifies its method. The original browser
receipt is preserved as `browser-ui-receipt-wp1.0.1-historical.json`.

## What ran

Each site began with Twenty Twenty-Four 1.2, two default pages, one default post,
zero media, and zero active plugins. Native `Theme_Upgrader` installed the pinned
buyer ZIP; `switch_theme` activated it and `wp_get_theme` verified Version 1.0.2
and its Eidos Update URI. No theme or importer plugin was preinstalled.

The PHP helper followed the buyer guide's manual page route through core APIs:
five Pages, matching native page-template assignments, static Home, a saved
native Navigation post/header part, edited site/business heading, PNG attachment
through `media_handle_sideload`, and saved native front-page/contact templates.
It parsed/resolved/serialized ordinary core blocks. It did not edit bundled
theme files. The contact replacement is an explicit `example.test` fixture.

All 20 designed pages and 21 distinct HTML-referenced local assets returned HTTP
200 per complete pass. The home primary link was followed over HTTP to its
offering page, then Contact and the edited mailto href. No email app opened,
message was sent, or booking/payment/form delivery was asserted. An external
runtime hook suppresses `wp_mail`; core automatic updates and cron are disabled.

`wp_generate_block_templates_export_file` produced a customized theme ZIP for
each site containing its saved heading and media URL. Those exports remain
outside Git. They reference media URLs and navigation IDs and are not complete
portable site backups. A private SQL dump, media files, credentials, and all
runtime data are preserved separately; export reimport was not tested.

All four PHP processes then stopped with Windows Ctrl-C, after verifying the
executable, PID, and that the console contained only the target and stop helper.
MariaDB stopped through authenticated `mariadb-admin shutdown`. The existing
data directory was restarted without recreating any database. Native inspection
and HTTP checks confirmed the saved text/image/navigation/contact and five
pages persisted. Root independently inspected all four public frontends with
CUA after restart; this was frontend review, not authenticated editor UI.

The test servers were finally stopped normally at the timestamp in
`final-shutdown-receipt.json`. No files or databases were deleted. Current
runtime PIDs in older receipts are historical; the servers are not left running.

## Reproduce from the repository root

Requirements: 64-bit Windows, Python with the already configured `certifi`
module, the Microsoft Visual C++ x64 runtime required by official PHP VS16,
network access to official package hosts, and an ample task-owned external disk
directory. No administrator privileges, Windows service, account, or purchase
is needed. The helpers require explicit path arguments. Use a new runtime
directory; they refuse an existing initialization rather than overwrite it.

```powershell
$runtimeRoot = '<new task-owned external runtime directory>'
$siteRoot = (Get-Location).Path
New-Item -ItemType Directory -Path $runtimeRoot -ErrorAction Stop | Out-Null
$env:TEMP = $runtimeRoot
$env:TMP = $runtimeRoot
python artifacts/templates/wordpress-native/prepare-native-inputs.py --runtime-root $runtimeRoot
python artifacts/templates/wordpress-native/bootstrap-native.py --runtime-root $runtimeRoot
python artifacts/templates/wordpress-native/run-native-acceptance.py --runtime-root $runtimeRoot --site-root $siteRoot install-configure
python artifacts/templates/wordpress-native/restart-native.py --runtime-root $runtimeRoot
python artifacts/templates/wordpress-native/run-native-acceptance.py --runtime-root $runtimeRoot --site-root $siteRoot after-restart
python artifacts/templates/wordpress-native/manage-native.py --runtime-root $runtimeRoot stop
```

The input preparation pins official PHP/WordPress/MariaDB archives and verifies
their published checksums before extraction. The clean bootstrap checks ports
33071 and 8971–8974 before starting anything. Database/admin passwords are
generated, stored only in `private/credentials.json`, and never printed.
Private ACL inheritance is removed; access is granted only to the current user
and SYSTEM. Per-site wp-config files also have restricted ACLs. Logs, SQL dumps,
and configurations holding secrets stay in the external private folder.

For the preserved stopped runtime, the exact restart command is:

```powershell
python artifacts/templates/wordpress-native/manage-native.py --runtime-root $runtimeRoot start
```

The complete `restart-native.py` workflow and `manage-native.py stop` were
exercised. The convenience `manage-native.py start` branch was syntax checked,
but was not run after final shutdown; it uses the same hidden launch routine.
Neither command deletes data. Stop only through the helper while the runtime
receipt still identifies the owned PIDs. Do not use any helper against unrelated
servers or change the saved credentials to production credentials.

## Inputs and limits

- PHP: official Windows 8.1.34 NTS x64 ZIP, SHA256 in `runtime-environment.json`;
  https://www.php.net/downloads.php?os=windows&version=8.1
- WordPress: official 6.6 ZIP; verified SHA1
  `4db7f3f95508fdb5b75c6985869efb0e53ed42a1`; independently calculated SHA256
  is recorded, not described as a published WordPress checksum.
- MariaDB: official 10.11.19 Windows ZIP, 93,557,290 bytes; SHA256
  `398ea30e5036010bbebe01d2b1804280424dcc2626e36d8e95155c04d25a0490`;
  `mariadb-download-receipt.json` records the official metadata URL. Detached
  signatures were not independently verified.
- PHP's built-in server is for development/testing:
  https://www.php.net/manual/en/features.commandline.webserver.php
- Official MariaDB ZIP instructions:
  https://mariadb.com/docs/server/server-management/install-and-upgrade-mariadb/installing-mariadb/binary-packages/installing-mariadb-windows-zip-packages

Current native installation, block edits, manual setup, export, and restart were
performed through PHP APIs. Four fresh visual admin/editor workflows, optional
importer UI, WordPress.com plan eligibility, Apache/nginx/managed hosting,
physical phones, machine reboot/disaster recovery, export reimport, and connected
delivery remain unproven. PHP 8.1.34 proves that tested patch in the declared
8.1 line, not every 8.1 patch. Overall WordPress acceptance stays partial and
commercial availability stays disabled.
