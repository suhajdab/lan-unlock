## lan unlock

A simple nodejs server allowing user to unlock mac or start screensaver from mobile device via lan.

**Instructions:**

1. Open `config-BLANK.json` and change default pin, possibly port and save as `config.json`.
2. Generate ssl certificates ( ex: [http://www.selfsignedcertificate.com](http://www.selfsignedcertificate.com) ) and place `local.cert` & `local.key` in root folder.
3. `npm start` ( note: if you don't have `forever` installed, just use `node server.js`. )
4. Hit https://your-macs-name.local:8080 (using mdns or alternatively your mac's ip). Remember to modify port if you changed it in step 1.


**Disclaimer:**

**Use at your own risk!** Although I tried to make this relatively secure, I take no responsibility for any harm caused by the use of this software.  
License: [WTFPL](http://www.wtfpl.net/)

  
**Icons:**

Lock icon: "Twemoji 1f512" by Twitter. Licensed under CC BY 4.0 via Wikimedia Commons - http://commons.wikimedia.org/wiki/File:Twemoji_1f513.svg#mediaviewer/File:Twemoji_1f512.svg  
Unlock icon: "Twemoji 1f513" by Twitter. Licensed under CC BY 4.0 via Wikimedia Commons - http://commons.wikimedia.org/wiki/File:Twemoji_1f513.svg#mediaviewer/File:Twemoji_1f513.svg  
Delete icon: Font Awesome by Dave Gandy - http://fortawesome.github.com/Font-Awesome
Licensed under the Creative Commons Attribution-Share Alike 3.0 Unported license.
http://commons.wikimedia.org/wiki/File:Remove_sign_font_awesome.svg