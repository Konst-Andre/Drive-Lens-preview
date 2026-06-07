export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // =========================================================================
  // 🔑 НАЛАШТУВАННЯ БЕЗПЕКИ: ЗМІНЮЙТЕ ПАРОЛЬ СУТО ТУТ!
  // =========================================================================
  const PASSWORD = "0000"; 
  const APP_VERSION = "v1"; 
  // =========================================================================

  const COOKIE_NAME = `drive_lens_session_${APP_VERSION}`;
  const cookieHeader = request.headers.get("Cookie") || "";
  const isAuthenticated = cookieHeader.includes(`${COOKIE_NAME}=authenticated`);

  if (isAuthenticated && url.pathname === "/login-action") {
    return Response.redirect(`${url.origin}/`, 302);
  }

  if (!isAuthenticated && request.method === "GET" && url.pathname === "/login-action") {
    return Response.redirect(`${url.origin}/`, 302);
  }

  if (isAuthenticated) {
    return await context.next(); 
  }

  if (request.method === "POST" && url.pathname === "/login-action") {
    try {
      const formData = await request.formData();
      const enteredPassword = formData.get("password");

      if (enteredPassword === PASSWORD) {
        return new Response(null, {
          status: 302,
          headers: {
            "Location": `${url.origin}/`,
            "Set-Cookie": `${COOKIE_NAME}=authenticated; Path=/; Max-Age=31536000; Secure; SameSite=Strict; HttpOnly`
          }
        });
      } else {
        return getLoginHTML("Неправильний ключ. Спробуйте ще раз!");
      }
    } catch (e) {
      return getLoginHTML("Помилка обробки даних.");
    }
  }

  return getLoginHTML();
}

function getLoginHTML(errorMessage = "") {
  return new Response(`
  <!DOCTYPE html>
  <html lang="uk">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Авторизація | Drive-Lens</title>
    <style>
      /* 🎨 СВІТЛА ПРЕМІУМ ТЕМА */
      :root {
        --bg-main: #f3f5f4;
        --grid-color: rgba(16, 185, 129, 0.03); 
        --glow-1: rgba(16, 185, 129, 0.12); 
        --glow-2: rgba(45, 212, 191, 0.08); 
        --bg-container: rgba(255, 255, 255, 0.75);
        --bg-input: #edf0ef;
        --text-main: #141a16;
        --text-muted: #5c6e65;
        --accent: #10b981; 
        --accent-hover: #059669;
        --border: rgba(16, 185, 129, 0.12);
        --shadow: 0 30px 60px -15px rgba(20, 26, 22, 0.08), inset 0 1px 0 rgba(255,255,255,0.6);
        --error-bg: rgba(239, 68, 68, 0.06);
        --error-text: #dc2626;
        --input-text: #141a16;
      }

      /* 🌙 ТЕМНА ПРЕМІУМ ТЕМА */
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-main: #0a0d0c;
          --grid-color: rgba(16, 185, 129, 0.02); 
          --glow-1: rgba(16, 185, 129, 0.14); 
          --glow-2: rgba(20, 184, 166, 0.08);
          --bg-container: rgba(22, 30, 26, 0.45); 
          --bg-input: #0f1412;
          --text-main: #f1f5f3;
          --text-muted: #7f9489;
          --accent: #10b981; 
          --accent-hover: #34d399;
          --border: rgba(255, 255, 255, 0.04);
          --shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.7), inset 0 1px 1px rgba(255,255,255,0.05);
          --error-bg: rgba(239, 68, 68, 0.12);
          --error-text: #fca5a5;
          --input-text: #ffffff;
        }
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: var(--bg-main);
        background-image: radial-gradient(var(--grid-color) 1.5px, transparent 1.5px);
        background-size: 24px 24px;
        color: var(--text-main);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        padding: 20px;
        overflow: hidden;
        position: relative;
      }

      .aurora-blur-1 {
        position: absolute;
        width: 500px;
        height: 500px;
        background: var(--glow-1);
        border-radius: 50%;
        filter: blur(100px);
        top: -10%;
        left: -10%;
        z-index: 1;
        pointer-events: none;
      }

      .aurora-blur-2 {
        position: absolute;
        width: 600px;
        height: 600px;
        background: var(--glow-2);
        border-radius: 50%;
        filter: blur(120px);
        bottom: -20%;
        right: -10%;
        z-index: 1;
        pointer-events: none;
      }

      .login-container {
        position: relative;
        z-index: 10;
        background: var(--bg-container);
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
        padding: 3.5rem 2.5rem 2rem 2.5rem; 
        border-radius: 24px;
        box-shadow: var(--shadow);
        width: 100%;
        max-width: 380px;
        text-align: center;
        border: 1px solid var(--border);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .logo-area h2 {
        font-size: 1.85rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 6px; 
      }

      .status-dot {
        width: 7px;
        height: 7px;
        background-color: var(--accent);
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 10px var(--accent);
        margin-top: 4px; 
      }

      p {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-top: 0.4rem;
        margin-bottom: 2.5rem;
      }

      .input-group {
        position: relative;
        margin-bottom: 1.2rem;
      }

      input[type="password"] {
        width: 100%;
        padding: 15px 16px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-input);
        color: var(--input-text);
        font-size: 1.1rem;
        transition: all 0.2s ease;
        text-align: center;
        letter-spacing: 0.1rem;
      }

      input[type="password"]:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.15);
        background: var(--bg-container);
      }

      button {
        width: 100%;
        padding: 15px;
        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 14px;
        font-size: 1rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 20px rgba(16, 185, 129, 0.2);
      }

      button:hover {
        background: var(--accent-hover);
        transform: translateY(-1px);
        box-shadow: 0 6px 24px rgba(16, 185, 129, 0.3);
      }

      button:active {
        transform: translateY(0.5px);
      }

      .error-msg {
        background: var(--error-bg);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: var(--error-text);
        font-size: 0.85rem;
        padding: 12px;
        border-radius: 12px;
        margin-bottom: 1.5rem;
        animation: shake 0.4s ease-in-out;
      }

      /* 📦 ОБ'ЄДНАНИЙ БЛОК АВТОРСТВА ТА СОЦМЕРЕЖ */
      .footer-credits {
        margin-top: 2.8rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 8px;
      }

      .credits {
        font-size: 0.68rem;
        color: var(--text-muted);
        opacity: 0.35;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        font-weight: 500;
      }

      /* ЕЛЕГАНТНЕ КЛІКАБЕЛЬНЕ ПОСИЛАННЯ НА ТЕЛЕГРАМ */
      .tg-link {
        display: flex;
        align-items: center;
        gap: 5px;
        text-decoration: none;
        font-size: 0.72rem;
        color: var(--text-muted);
        opacity: 0.4;
        font-weight: 500;
        transition: all 0.25s ease;
        padding: 4px 10px;
        border-radius: 20px;
        border: 1px solid transparent;
      }
      
      /* Чистий векторний колір іконки */
      .tg-icon {
        width: 13px;
        height: 13px;
        fill: currentColor; /* Іконка автоматично бере колір тексту */
        transition: transform 0.25s ease;
      }

      /* ✨ Ефектний ховер: посилання плавно оживає */
      .tg-link:hover {
        opacity: 1;
        color: var(--accent);
        background: var(--error-bg); /* Легкий напівпрозорий фон при наведенні */
        border-color: rgba(16, 185, 129, 0.1);
      }

      .tg-link:hover .tg-icon {
        transform: scale(1.1) rotate(-8deg); /* Іконка злегка грає при наведенні */
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
    </style>
  </head>
  <body>
    <div class="aurora-blur-1"></div>
    <div class="aurora-blur-2"></div>

    <div class="login-container">
      <div class="logo-area">
        <h2>Drive<span class="status-dot"></span>Lens</h2>
      </div>
      <p>Синхронізація з бортовим комп'ютером</p>
      
      <form action="/login-action" method="POST">
        ${errorMessage ? `<div class="error-msg">⚠️ ${errorMessage}</div>` : ''}
        <div class="input-group">
          <input type="password" name="password" placeholder="••••••••" required autofocus>
        </div>
        <button type="submit">Увійти</button>
      </form>

      <div class="footer-credits">
        <div class="credits">by Konstantinov A.</div>
        
        <a href="https://t.me/Konst_Andre" target="_blank" rel="noopener noreferrer" class="tg-link">
          <svg class="tg-icon" viewBox="0 0 24 24">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-1-.65-.35-1 .22-1.62.15-.15 2.7-2.48 2.75-2.7.01-.03.01-.14-.06-.2-.07-.06-.17-.04-.25-.02-.11.02-1.83 1.16-5.16 3.42-.49.34-.93.51-1.33.5-.44-.01-1.3-.25-1.93-.46-.78-.25-1.4-.39-1.35-.83.03-.23.35-.47.96-.71 3.76-1.64 6.27-2.72 7.54-3.25 3.58-1.48 4.32-1.74 4.81-1.75.11 0 .35.03.5.16.13.11.17.26.19.37z"/>
          </svg>
          <span>Зв'язок</span>
        </a>
      </div>
    </div>
  </body>
  </html>
  `, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
