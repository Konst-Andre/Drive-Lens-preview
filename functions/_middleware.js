export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // =========================================================================
  // 🔑 НАЛАШТУВАННЯ БЕЗПЕКИ: ЗМІНЮЙТЕ ПАРОЛЬ СУТО ТУТ!
  // =========================================================================
  const PASSWORD = "0000"; 
  const APP_VERSION = "v3"; 
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
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
    <title>Авторизація | Drive-Lens</title>
    <style>
      /* 🎨 СВІТЛА ПРЕМІУМ ТЕМА */
      :root {
        --bg-main: #f3f5f4;
        --grid-color: rgba(16, 185, 129, 0.04); 
        --glow-1: rgba(16, 185, 129, 0.12); 
        --glow-2: rgba(45, 212, 191, 0.08); 
        --bg-container: rgba(255, 255, 255, 0.92); /* Більш щільний фон, щоб не провалювався */
        --bg-input: #edf0ef;
        --text-main: #141a16;
        --text-muted: #4a5750; /* Вища контрастність для світлої теми */
        --accent: #10b981; 
        --accent-hover: #059669;
        --border: rgba(16, 185, 129, 0.22); /* Чіткіші контури */
        --shadow: 0 30px 60px -15px rgba(20, 26, 22, 0.12), 0 0 30px rgba(16, 185, 129, 0.06);
        --error-bg: rgba(239, 68, 68, 0.06);
        --error-text: #dc2626;
        --input-text: #141a16;
      }

      /* 🌙 ТЕМНА ПРЕМІУМ ТЕМА */
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-main: #070a09;
          --grid-color: rgba(16, 185, 129, 0.02); 
          --glow-1: rgba(16, 185, 129, 0.16); 
          --glow-2: rgba(20, 184, 166, 0.08);
          --bg-container: rgba(18, 24, 21, 0.85); /* Щільне матове скло, без провалів на iOS */
          --bg-input: #0b0f0d;
          --text-main: #f1f5f3;
          --text-muted: #8fa398; /* Висока читабельність на темному */
          --accent: #10b981; 
          --accent-hover: #34d399;
          --border: rgba(16, 185, 129, 0.28); /* Смарагдова тонка рамка */
          --shadow: 0 40px 80px -20px rgba(0, 0, 0, 0.8), 0 0 35px rgba(16, 185, 129, 0.08); /* Ефект паріння (Glow) */
          --error-bg: rgba(239, 68, 68, 0.12);
          --error-text: #fca5a5;
          --input-text: #ffffff;
        }
      }

      /* 🛡️ ЗАБОРОНА ВИДІЛЕННЯ ТЕКСТУ НА ВСІЙ СТОРІНЦІ */
      * { 
        box-sizing: border-box; 
        margin: 0; 
        padding: 0; 
        -webkit-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
      }
      
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
        backdrop-filter: blur(25px);
        -webkit-backdrop-filter: blur(25px);
        padding: 3rem 2.2rem 2.2rem 2.2rem; 
        border-radius: 24px;
        box-shadow: var(--shadow);
        width: 100%;
        max-width: 360px;
        text-align: center;
        border: 1px solid var(--border);
        /* 🛡️ Захист від подвійного тапу (масштабування картки на iOS) */
        touch-action: manipulation; 
      }

      .logo-area h2 {
        font-size: 1.9rem;
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
        box-shadow: 0 0 12px var(--accent);
        margin-top: 4px; 
      }

      /* Лаконічний підзаголовок з вивіреними відступами */
      .subtitle {
        color: var(--text-muted);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-top: 0.6rem;
        margin-bottom: 2rem; /* Оптимізоване "повітря" перед полем */
        opacity: 0.85;
      }

      .input-group {
        position: relative;
        margin-bottom: 1rem;
      }

      /* 🛡️ ФІКС АВТОЗУМУ ТА КЛАВІАТУРИ ДЛЯ СМАРТФОНІВ */
      input[type="password"] {
        width: 100%;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--border);
        background: var(--bg-input);
        color: var(--input-text);
        /* 16px строго блокує системний зум Safari в iOS */
        font-size: 16px; 
        transition: all 0.25s ease;
        text-align: center;
        letter-spacing: 0.25rem;
        font-weight: bold;
        -webkit-user-select: text; /* Дозволяємо системі фокусуватись */
        user-select: text;
      }

      input[type="password"]:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 4px rgba(16, 185, 129, 0.18);
        background: var(--bg-input);
      }

      button {
        width: 100%;
        padding: 14px;
        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 14px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 18px rgba(16, 185, 129, 0.2);
        touch-action: manipulation;
      }

      button:hover {
        background: var(--accent-hover);
        transform: translateY(-0.5px);
        box-shadow: 0 6px 22px rgba(16, 185, 129, 0.28);
      }

      button:active {
        transform: translateY(0.5px);
      }

      .error-msg {
        background: var(--error-bg);
        border: 1px solid rgba(239, 68, 68, 0.25);
        color: var(--error-text);
        font-size: 0.82rem;
        padding: 11px;
        border-radius: 12px;
        margin-bottom: 1.2rem;
        animation: shake 0.4s ease-in-out;
      }

      /* 📦 ТЕХНОЛОГІЧНИЙ ПОДВАЛ */
      .footer-block {
        margin-top: 2.2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      /* Тонка інженерна лінія-роздільник */
      .tech-line {
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border), transparent);
        margin-bottom: 1.4rem;
      }

      /* 🔲 СУВОРИЙ ПРЯМОКУТНИЙ МІКРО-БЕЙДЖ АВТОРА */
      .dev-badge {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
        font-size: 0.65rem;
        color: var(--text-muted);
        letter-spacing: 0.12em;
        padding: 3px 8px 4px 9px;
        border: 1px solid var(--border);
        border-radius: 4px; /* Гострі інженерні кути */
        background: rgba(16, 185, 129, 0.02);
        display: inline-block;
        margin-bottom: 1.2rem;
        font-weight: 500;
      }

      /* 💊 М'ЯКА КЛІКАБЕЛЬНА КАПСУЛА ДЛЯ ТЕЛЕГРАМУ */
      .tg-pill-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        font-size: 0.75rem;
        color: var(--text-main);
        font-weight: 600;
        background: rgba(16, 185, 129, 0.06); /* Легкий нативний тон */
        border: 1px solid var(--border);
        padding: 7px 14px;
        border-radius: 20px; /* Кругла капсула під палець */
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        touch-action: manipulation;
      }
      
      .tg-icon {
        width: 13px;
        height: 13px;
        fill: var(--accent); /* Стабільна смарагдова іконка */
        transition: transform 0.25s ease;
      }

      /* Поведінка капсули на ПК та при тапі на мобільних */
      .tg-pill-tag:hover, .tg-pill-tag:active {
        background: var(--accent);
        color: #ffffff;
        border-color: var(--accent);
        box-shadow: 0 4px 12px rgba(16, 185, 129, 0.2);
      }

      .tg-pill-tag:hover .tg-icon, .tg-pill-tag:active .tg-icon {
        fill: #ffffff; /* Фарбуємо в білий при взаємодії */
        transform: scale(1.08) rotate(-6deg);
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
      <div class="subtitle">Вхід за ключем доступу</div>
      
      <form action="/login-action" method="POST" autocomplete="off">
        ${errorMessage ? `<div class="error-msg">⚠️ ${errorMessage}</div>` : ''}
        <div class="input-group">
          <input 
            type="password" 
            name="password" 
            placeholder="••••" 
            required 
            autofocus
            inputmode="numeric"
            pattern="[0-9]*"
            autocomplete="new-password"
            autocorrect="off"
            autocapitalize="off"
            spellcheck="false"
          >
        </div>
        <button type="submit">Увійти</button>
      </form>

      <div class="footer-block">
        <div class="tech-line"></div>
        
        <div class="dev-badge">DEV // KONSTANTINOV A.</div>
        
        <a href="https://t.me/Konst_Andre" target="_blank" rel="noopener noreferrer" class="tg-pill-tag">
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
