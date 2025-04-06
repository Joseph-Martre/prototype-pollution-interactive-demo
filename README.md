# 🧪 Prototype Pollution XSS Demo

This project is an **interactive demonstration** of a client-side **Prototype Pollution** vulnerability, resulting in a bypass of a sanitized HTML allowlist and triggering **Cross-Site Scripting (XSS)**.

🔗 **Live Demo**: https://prototype-pollution-interactive-demo.netlify.app/  
📜 Licensed under [ISC](./LICENSE)

---

## 🚨 What It Shows

Prototype pollution is a vulnerability unique to JavaScript that allows attackers to tamper with the default object prototype. This can lead to unexpected behavior and security flaws—such as:

- Bypassing \`Object.freeze\`-based allowlists  
- Triggering arbitrary script execution (\`XSS\`)  
- Causing application crashes (DoS)  

This demo walks through:

- The vulnerability basics  
- Code examples of the pollution exploit  
- Real-time, fake chat messages simulating an XSS attack  
- HTML sanitization flaws stemming from polluted prototypes  

---

## 💡 Key Features

- Fully interactive and intentionally vulnerable  
- Highlighted code snippets using [highlight.js](https://highlightjs.org/)  
- Realistic message board with tag-based HTML validation  
- Custom \`TAG_ALLOWLIST\` that gets bypassed via pollution  
- Modal dialog warning for unsafe markup  

---

## 🧱 Tech Stack

- HTML / CSS / JS (Vanilla)  
- Modern, responsive layout  

---

## ⚠️ Disclaimer

This project is **intentionally vulnerable** and is for **educational purposes only**.  
Do not reuse this code in production environments.

---

## 🧠 Learn More

- https://portswigger.net/web-security/prototype-pollution  
- https://learn.snyk.io/lesson/prototype-pollution/?ecosystem=javascript  
- https://research.securitum.com/prototype-pollution-and-bypassing-client-side-html-sanitizers/  

---

Built with ❤️ to help devs recognize sneaky JS security pitfalls.
