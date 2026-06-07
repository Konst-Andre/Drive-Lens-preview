export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // =========================================================================
  // 🔑 НАЛАШТУВАННЯ БЕЗПЕКИ: ЗМІНЮЙТЕ ПАРОЛЬ СУТО ТУТ!
  // =========================================================================
  const PASSWORD = "0000";
  const APP_VERSION = "v4";
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
      :root {
        --bg-main: #040705;
        --grid-color: rgba(17, 168, 119, 0.015);
        --glow-core: rgba(17, 168, 119, 0.28);
        --glow-wide: rgba(17, 168, 119, 0.12);
        --bg-container: rgba(15, 27, 21, 0.42);
        --bg-input: rgba(2, 4, 3, 0.75);
        --input-border: rgba(17, 168, 119, 0.28);
        --text-main: #f0f5f2;
        --text-muted: #788c80;
        --accent-pine: #11a877;
        --btn-gradient: linear-gradient(180deg, #15c38b 0%, #0b7552 100%);
        --border-glass: rgba(17, 168, 119, 0.22);
        --border-top-glass: rgba(255, 255, 255, 0.14);
        --shadow-card:
          0 50px 100px -25px rgba(0, 0, 0, 0.85),
          0 16px 40px -15px rgba(4, 7, 5, 0.7);
        --tg-brand: #229ED9;
        --error-bg: rgba(239, 68, 68, 0.12);
        --error-text: #fca5a5;
      }

      * {
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        -webkit-user-select: none;
        -moz-user-select: none;
        user-select: none;
        -webkit-touch-callout: none;
        touch-action: manipulation;
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

      .aurora-center-core {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 45vw;
        height: 45vw;
        min-width: 400px;
        background: var(--glow-core);
        border-radius: 50%;
        filter: blur(90px);
        z-index: 1;
        pointer-events: none;
      }

      .aurora-center-wide {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        width: 85vw;
        height: 85vw;
        min-width: 750px;
        background: var(--glow-wide);
        border-radius: 50%;
        filter: blur(140px);
        z-index: 1;
        pointer-events: none;
      }

      .login-container {
        position: relative;
        z-index: 10;
        background: var(--bg-container);
        backdrop-filter: blur(42px);
        -webkit-backdrop-filter: blur(42px);
        padding: 3.2rem 2.2rem 2.2rem 2.2rem;
        border-radius: 26px;
        box-shadow: var(--shadow-card);
        width: 100%;
        max-width: 360px;
        text-align: center;
        border: 1px solid var(--border-glass);
        position: relative;
      }

      .login-container::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        border-radius: 25px;
        border: 1px solid transparent;
        border-top: 1px solid var(--border-top-glass);
        pointer-events: none;
        z-index: 2;
      }

      .logo-area h2 {
        font-size: 1.95rem;
        font-weight: 700;
        letter-spacing: -0.03em;
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 7px;
      }

      .status-dot {
        width: 7px;
        height: 7px;
        background-color: var(--accent-pine);
        border-radius: 50%;
        display: inline-block;
        box-shadow: 0 0 14px var(--accent-pine);
        margin-top: 5px;
      }

      .subtitle {
        color: var(--text-muted);
        font-size: 0.72rem;
        font-weight: 600;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-top: 0.6rem;
        margin-bottom: 2.2rem;
        opacity: 0.9;
      }

      .input-group {
        position: relative;
        margin-bottom: 1.1rem;
      }

      input[type="password"] {
        width: 100%;
        padding: 15px 16px;
        border-radius: 14px;
        border: 1px solid var(--input-border);
        background: var(--bg-input);
        color: var(--text-main);
        font-size: 16px;
        transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        text-align: center;
        letter-spacing: 0.3rem;
        font-weight: bold;
        box-shadow:
          inset 0 3px 6px rgba(0, 0, 0, 0.4),
          0 1px 0px rgba(255, 255, 255, 0.05);
        -webkit-user-select: text;
        user-select: text;
      }

      input[type="password"]:focus {
        outline: none;
        border-color: var(--accent-pine);
        box-shadow:
          inset 0 2px 4px rgba(0, 0, 0, 0.5),
          0 0 0 4px rgba(17, 168, 119, 0.18);
        background: rgba(0, 0, 0, 0.9);
      }

      button {
        width: 100%;
        padding: 15px;
        background: var(--btn-gradient);
        color: #020503;
        font-weight: 700;
        border: none;
        border-radius: 14px;
        font-size: 0.95rem;
        cursor: pointer;
        position: relative;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
        box-shadow:
          0 5px 20px rgba(17, 168, 119, 0.22),
          inset 0 1px 1px rgba(255, 255, 255, 0.35);
      }

      button:hover {
        transform: translateY(-0.5px);
        box-shadow:
          0 7px 25px rgba(17, 168, 119, 0.35),
          inset 0 1px 1px rgba(255, 255, 255, 0.5);
        filter: brightness(1.04);
      }

      button:active {
        transform: translateY(0.5px);
        box-shadow:
          0 2px 10px rgba(17, 168, 119, 0.2),
          inset 0 1px 2px rgba(0, 0, 0, 0.2);
        filter: brightness(0.96);
      }

      button:disabled {
        opacity: 0.7;
        cursor: not-allowed;
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

      .footer-block {
        margin-top: 1.2rem;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .tech-line {
        width: 100%;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border-glass), transparent);
        margin-top: 0.1rem;
        margin-bottom: 1.2rem;
      }

      .dev-badge {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.65rem;
        color: var(--text-muted);
        letter-spacing: 0.12em;
        padding: 4px 9px 5px 10px;
        border: 1px solid var(--border-glass);
        border-radius: 5px;
        background: rgba(17, 168, 119, 0.03);
        display: inline-block;
        margin-bottom: 1.1rem;
        font-weight: 600;
      }

      .tg-pill-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        font-size: 0.75rem;
        color: var(--tg-brand);
        font-weight: 600;
        background: rgba(34, 158, 217, 0.08);
        border: 1px solid rgba(34, 158, 217, 0.22);
        padding: 6px 14px;
        border-radius: 20px;
        transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .tg-icon {
        width: 13px;
        height: 13px;
        fill: var(--tg-brand);
        transition: fill 0.25s ease, transform 0.25s ease;
      }

      .tg-pill-tag:hover,
      .tg-pill-tag:active {
        background: var(--tg-brand);
        border-color: var(--tg-brand);
        color: #ffffff;
        box-shadow: 0 4px 15px rgba(34, 158, 217, 0.3);
      }

      .tg-pill-tag:hover .tg-icon,
      .tg-pill-tag:active .tg-icon {
        fill: #ffffff;
        transform: scale(1.05) rotate(-4deg);
      }

      @media (max-width: 480px) {
        .login-container {
          padding: 2.2rem 1.4rem 1.8rem 1.4rem;
          max-width: 100%;
        }

        .logo-area h2 {
          font-size: 1.7rem;
        }

        .aurora-center-core {
          width: 72vw;
          height: 72vw;
          min-width: 0;
        }

        .aurora-center-wide {
          width: 110vw;
          height: 110vw;
          min-width: 0;
        }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
    </style>
  </head>
  <body>
    <div class="aurora-center-core"></div>
    <div class="aurora-center-wide"></div>

    <div class="login-container">
      <div class="logo-area">
        <h2>Drive<span class="status-dot"></span>Lens</h2>
      </div>
      <div class="subtitle">Вхід за ключем доступу</div>

      <form action="/login-action" method="POST" autocomplete="off">
        ${errorMessage ? `<div class="error-msg">⚠️ ${errorMessage}</div>` : ''}
        <div class="input-group">
          <input
            id="passwordInput"
            type="password"
            name="password"
            placeholder="••••"
            required
            autofocus
            maxlength="16"
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
