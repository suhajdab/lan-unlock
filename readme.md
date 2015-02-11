## lan unlock

A simple nodejs server allowing user to unlock mac or start screensaver from mobile device via lan.

**Instructions:**

1. Copy `config.json` and change default pin, possibly port.
2. Generate ssl certificates ( ex: [http://www.selfsignedcertificate.com] ) and place `local.cert` & `local.key` in root folder.
3. `npm start`
4. Hit https://your-macs-name.local:8080 (modify port if you changed in step 1).
