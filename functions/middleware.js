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
        --bg-image: url('https://raw.githubusercontent.com/Konst-Andre/Drive-Lens-preview/main/assets/bg-dark.jpg');
        --overlay-color: rgba(4, 7, 5, 0.42);
        --bg-container: rgba(12, 24, 18, 0.60);
        --bg-input: rgba(4, 12, 8, 0.72);
        --input-border: rgba(17, 168, 119, 0.25);
        --input-border-focus: rgba(17, 168, 119, 0.70);
        --text-main: #eef4f1;
        --text-muted: #6a8075;
        --text-label: rgba(17, 168, 119, 0.55);
        --accent-pine: #11a877;
        --accent-light: #19d496;
        --btn-gradient: linear-gradient(175deg, #18d492 0%, #0e9668 55%, #0a7552 100%);
        --btn-shadow: rgba(17, 168, 119, 0.28);
        --border-glass: rgba(17, 168, 119, 0.18);
        --border-top-glass: rgba(255, 255, 255, 0.12);
        --shadow-card:
          0 0 0 1px rgba(17, 168, 119, 0.10),
          0 40px 80px -20px rgba(0, 0, 0, 0.90),
          0 12px 32px -8px rgba(0, 0, 0, 0.60);
        --tg-brand: #229ED9;
        --error-bg: rgba(239, 68, 68, 0.10);
        --error-border: rgba(239, 68, 68, 0.22);
        --error-text: #fca5a5;
      }

      @media (prefers-color-scheme: light) {
        :root {
          --bg-main: #e8f0ec;
          --bg-image: url('https://raw.githubusercontent.com/Konst-Andre/Drive-Lens-preview/main/assets/bg-light.jpg');
          --overlay-color: rgba(220, 235, 228, 0.20);
          --bg-container: rgba(255, 255, 255, 0.62);
          --bg-input: rgba(235, 248, 242, 0.90);
          --input-border: rgba(17, 168, 119, 0.30);
          --input-border-focus: rgba(17, 168, 119, 0.65);
          --text-main: #0e2219;
          --text-muted: #4a6a58;
          --text-label: rgba(17, 168, 119, 0.60);
          --border-glass: rgba(17, 168, 119, 0.22);
          --border-top-glass: rgba(255, 255, 255, 0.80);
          --shadow-card:
            0 0 0 1px rgba(17, 168, 119, 0.12),
            0 30px 60px -15px rgba(0, 0, 0, 0.14),
            0 10px 24px -6px rgba(10, 40, 25, 0.10);
          --btn-shadow: rgba(17, 168, 119, 0.32);
          --error-bg: rgba(220, 38, 38, 0.08);
          --error-border: rgba(220, 38, 38, 0.20);
          --error-text: #b91c1c;
        }
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
        font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                     "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background-color: var(--bg-main);
        background-image: var(--bg-image);
        background-size: cover;
        background-position: center center;
        background-repeat: no-repeat;
        background-attachment: fixed;
        color: var(--text-main);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        padding: 20px;
        overflow: hidden;
        position: relative;
      }

      body::before {
        content: "";
        position: absolute;
        inset: 0;
        background: var(--overlay-color);
        z-index: 0;
        pointer-events: none;
      }

      /* ── CARD ── */
      .login-container {
        position: relative;
        z-index: 10;
        background: var(--bg-container);
        backdrop-filter: blur(48px) saturate(1.4);
        -webkit-backdrop-filter: blur(48px) saturate(1.4);
        padding: 2.8rem 2.0rem 2.0rem;
        border-radius: 28px;
        box-shadow: var(--shadow-card);
        width: 100%;
        max-width: 352px;
        text-align: center;
        border: 1px solid var(--border-glass);
        animation: cardReveal 0.6s cubic-bezier(0.34, 1.42, 0.64, 1) forwards;
      }

      /* Top edge highlight */
      .login-container::before {
        content: "";
        position: absolute;
        top: 0; left: 10%; right: 10%;
        height: 1px;
        background: linear-gradient(
          90deg,
          transparent,
          var(--border-top-glass) 30%,
          rgba(255,255,255,0.22) 50%,
          var(--border-top-glass) 70%,
          transparent
        );
        border-radius: 50%;
        pointer-events: none;
        z-index: 2;
      }

      /* ── ICON MARK ── */
      .brand-mark {
        display: flex;
        justify-content: center;
        margin-bottom: 1.1rem;
      }

      .brand-mark svg {
        width: 42px;
        height: 42px;
        filter: drop-shadow(0 0 10px rgba(17, 168, 119, 0.40));
      }

      /* ── TITLE ── */
      .logo-area h2 {
        font-size: 1.85rem;
        font-weight: 700;
        letter-spacing: -0.04em;
        color: var(--text-main);
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        line-height: 1;
      }

      .status-dot {
        width: 8px;
        height: 8px;
        background-color: var(--accent-light);
        border-radius: 50%;
        display: inline-block;
        margin-top: 3px;
        animation: dotPulse 2.8s ease-in-out infinite;
      }

      .subtitle {
        color: var(--text-label);
        font-size: 0.68rem;
        font-weight: 600;
        letter-spacing: 0.12em;
        text-transform: uppercase;
        margin-top: 0.55rem;
        margin-bottom: 2.0rem;
      }

      /* ── DIVIDER ── */
      .section-divider {
        width: 100%;
        height: 1px;
        background: linear-gradient(
          90deg, transparent,
          var(--border-glass) 30%,
          var(--border-glass) 70%,
          transparent
        );
        margin-bottom: 1.6rem;
      }

      /* ── INPUT ── */
      .input-wrapper {
        position: relative;
        margin-bottom: 0.9rem;
      }

      .input-label {
        display: block;
        font-size: 0.62rem;
        font-weight: 600;
        letter-spacing: 0.10em;
        text-transform: uppercase;
        color: var(--text-muted);
        text-align: left;
        margin-bottom: 0.45rem;
        padding-left: 2px;
      }

      input[type="password"] {
        width: 100%;
        padding: 14px 16px;
        border-radius: 14px;
        border: 1px solid var(--input-border);
        background: var(--bg-input);
        color: var(--text-main);
        font-size: 20px;
        transition:
          border-color 0.25s ease,
          box-shadow 0.25s ease,
          background 0.25s ease;
        text-align: center;
        letter-spacing: 0.45rem;
        font-weight: 700;
        box-shadow:
          inset 0 2px 8px rgba(0, 0, 0, 0.35),
          inset 0 1px 2px rgba(0, 0, 0, 0.20);
        -webkit-user-select: text;
        user-select: text;
      }

      input[type="password"]::placeholder {
        letter-spacing: 0.25rem;
        opacity: 0.30;
        font-size: 14px;
      }

      input[type="password"]:focus {
        outline: none;
        border-color: var(--input-border-focus);
        background: rgba(4, 14, 9, 0.88);
        box-shadow:
          inset 0 2px 6px rgba(0, 0, 0, 0.40),
          0 0 0 3px rgba(17, 168, 119, 0.14),
          0 0 18px rgba(17, 168, 119, 0.08);
      }

      @media (prefers-color-scheme: light) {
        input[type="password"]:focus {
          background: rgba(255, 255, 255, 0.97);
        }
      }

      /* ── BUTTON ── */
      button[type="submit"] {
        width: 100%;
        padding: 15px;
        background: var(--btn-gradient);
        color: #04140a;
        font-weight: 700;
        border: none;
        border-radius: 14px;
        font-size: 0.92rem;
        letter-spacing: 0.02em;
        cursor: pointer;
        position: relative;
        overflow: hidden;
        transition:
          transform 0.22s cubic-bezier(0.4, 0, 0.2, 1),
          box-shadow 0.22s cubic-bezier(0.4, 0, 0.2, 1),
          filter 0.22s ease;
        box-shadow:
          0 4px 16px var(--btn-shadow),
          inset 0 1px 1px rgba(255, 255, 255, 0.30);
        margin-top: 0.2rem;
      }

      /* Shimmer effect on hover */
      button[type="submit"]::after {
        content: "";
        position: absolute;
        top: 0; left: -110%; bottom: 0;
        width: 60%;
        background: linear-gradient(
          105deg,
          transparent 20%,
          rgba(255, 255, 255, 0.22) 50%,
          transparent 80%
        );
        transform: skewX(-15deg);
        transition: left 0.55s ease;
        pointer-events: none;
      }

      button[type="submit"]:hover {
        transform: translateY(-1px);
        box-shadow:
          0 8px 28px var(--btn-shadow),
          inset 0 1px 1px rgba(255, 255, 255, 0.40);
        filter: brightness(1.06);
      }

      button[type="submit"]:hover::after {
        left: 160%;
      }

      button[type="submit"]:active {
        transform: translateY(1px);
        box-shadow:
          0 2px 8px var(--btn-shadow),
          inset 0 2px 4px rgba(0, 0, 0, 0.15);
        filter: brightness(0.96);
      }

      button[type="submit"]:disabled {
        opacity: 0.6;
        cursor: not-allowed;
      }

      /* ── ERROR ── */
      .error-msg {
        background: var(--error-bg);
        border: 1px solid var(--error-border);
        color: var(--error-text);
        font-size: 0.80rem;
        padding: 10px 12px;
        border-radius: 12px;
        margin-bottom: 1.1rem;
        animation: shake 0.38s ease-in-out;
        line-height: 1.4;
      }

      /* ── FOOTER ── */
      .footer-block {
        margin-top: 1.4rem;
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
      }

      .footer-row {
        width: 100%;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 8px;
      }

      .footer-line {
        flex: 1;
        height: 1px;
        background: linear-gradient(90deg, transparent, var(--border-glass));
      }

      .footer-line.right {
        background: linear-gradient(90deg, var(--border-glass), transparent);
      }

      .dev-badge {
        font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        font-size: 0.60rem;
        color: var(--text-muted);
        letter-spacing: 0.10em;
        padding: 3px 8px 4px;
        border: 1px solid var(--border-glass);
        border-radius: 4px;
        background: rgba(17, 168, 119, 0.03);
        display: inline-block;
        font-weight: 600;
        white-space: nowrap;
      }

      .tg-pill-tag {
        display: flex;
        align-items: center;
        gap: 6px;
        text-decoration: none;
        font-size: 0.74rem;
        color: var(--tg-brand);
        font-weight: 600;
        background: rgba(34, 158, 217, 0.07);
        border: 1px solid rgba(34, 158, 217, 0.20);
        padding: 7px 16px;
        border-radius: 20px;
        transition: all 0.22s cubic-bezier(0.4, 0, 0.2, 1);
      }

      .tg-icon {
        width: 13px;
        height: 13px;
        fill: var(--tg-brand);
        transition: fill 0.22s ease, transform 0.22s ease;
        flex-shrink: 0;
      }

      .tg-pill-tag:hover,
      .tg-pill-tag:active {
        background: var(--tg-brand);
        border-color: var(--tg-brand);
        color: #ffffff;
        box-shadow: 0 4px 16px rgba(34, 158, 217, 0.30);
      }

      .tg-pill-tag:hover .tg-icon,
      .tg-pill-tag:active .tg-icon {
        fill: #ffffff;
        transform: scale(1.08) rotate(-5deg);
      }

      /* ── RESPONSIVE ── */
      @media (max-width: 480px) {
        .login-container {
          padding: 2.2rem 1.5rem 1.8rem;
          max-width: 100%;
          border-radius: 24px;
        }

        .logo-area h2 {
          font-size: 1.65rem;
        }

        .brand-mark svg {
          width: 36px;
          height: 36px;
        }
      }

      /* ── ANIMATIONS ── */
      @keyframes cardReveal {
        from {
          opacity: 0;
          transform: translateY(20px) scale(0.97);
        }
        to {
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }

      @keyframes dotPulse {
        0%, 100% {
          box-shadow: 0 0 6px var(--accent-pine);
          opacity: 1;
        }
        50% {
          box-shadow: 0 0 16px var(--accent-light), 0 0 32px rgba(25, 212, 150, 0.25);
          opacity: 0.85;
        }
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%       { transform: translateX(-5px); }
        40%       { transform: translateX(5px); }
        60%       { transform: translateX(-3px); }
        80%       { transform: translateX(3px); }
      }
    </style>
  </head>
  <body>
    <div class="login-container">

      <!-- Brand icon -->
      <div class="brand-mark">
        <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="21" cy="21" r="19.5" stroke="rgba(17,168,119,0.30)" stroke-width="1"/>
          <circle cx="21" cy="21" r="14.5" stroke="rgba(17,168,119,0.18)" stroke-width="1"/>
          <path d="M10 30 Q15 21 21 21 Q27 21 32 12"
                stroke="#11a877" stroke-width="2"
                stroke-linecap="round" stroke-linejoin="round"/>
          <circle cx="21" cy="21" r="3" fill="#11a877" opacity="0.9"/>
          <circle cx="21" cy="21" r="1.2" fill="#19d496"/>
        </svg>
      </div>

      <!-- Title -->
      <div class="logo-area">
        <h2>Drive<span class="status-dot"></span>Lens</h2>
      </div>
      <div class="subtitle">Вхід за ключем доступу</div>

      <div class="section-divider"></div>

      <!-- Form -->
      <form action="/login-action" method="POST" autocomplete="off">
        ${errorMessage ? `<div class="error-msg">⚠️ ${errorMessage}</div>` : ''}

        <div class="input-wrapper">
          <label class="input-label" for="passwordInput">Ключ доступу</label>
          <input
            id="passwordInput"
            type="password"
            name="password"
            placeholder="· · · ·"
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

      <!-- Footer -->
      <div class="footer-block">
        <div class="footer-row">
          <div class="footer-line"></div>
          <div class="dev-badge">DEV // KONSTANTINOV A.</div>
          <div class="footer-line right"></div>
        </div>

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
