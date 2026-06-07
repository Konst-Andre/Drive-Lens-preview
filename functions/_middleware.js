export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // =========================================================================
  // 🔑 НАЛАШТУВАННЯ БЕЗПЕКИ: ЗМІНЮЙТЕ ПАРОЛЬ СУТО ТУТ!
  // =========================================================================
  const PASSWORD = "0000"; 
  const APP_VERSION = "v2"; 
  // =========================================================================

  const COOKIE_NAME = `drive_lens_session_${APP_VERSION}`;
  const cookieHeader = request.headers.get("Cookie") || "";
  const isAuthenticated = cookieHeader.includes(`${COOKIE_NAME}=authenticated`);

  // ЗАХИСТ ВІД АВТОЗАПОВНЕННЯ ТА ЗАСТРЯГАННЯ БРАУЗЕРА:
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

// Інтерфейс, який повністю повторює дизайн-токени та кольори Drive-Lens
function getLoginHTML(errorMessage = "") {
  return new Response(`
  <!DOCTYPE html>
  <html lang="uk">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Авторизація | Drive-Lens</title>
    <style>
      /* 🎨 СВІТЛА ТЕМА (За замовчуванням, як на твоїх скріншотах) */
      :root {
        --bg-main: radial-gradient(circle at center, #f4f6f5 0%, #eaeceb 100%);
        --bg-container: #ffffff;
        --bg-input: #edf0ef;
        --text-main: #1a201c;
        --text-muted: #667770;
        --accent: #10b981; 
        --accent-hover: #059669;
        --border: rgba(0, 0, 0, 0.06);
        --shadow: 0 20px 40px -15px rgba(26, 32, 28, 0.08);
        --error-bg: rgba(239, 68, 68, 0.08);
        --error-text: #dc2626;
        --input-text: #1a201c;
      }

      /* 🌙 ТЕМНА ТЕМА (Автоматично вмикається системою PC/iOS/Android) */
      @media (prefers-color-scheme: dark) {
        :root {
          --bg-main: radial-gradient(circle at center, #141a17 0%, #0d1210 100%);
          --bg-container: #1b2320;
          --bg-input: #111614;
          --text-main: #f3f4f6;
          --text-muted: #889a90;
          --accent: #10b981; /* Точний фірмовий зелений колір з твого додатка */
          --accent-hover: #34d399;
          --border: rgba(255, 255, 255, 0.05);
          --shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          --error-bg: rgba(239, 68, 68, 0.15);
          --error-text: #fca5a5;
          --input-text: #ffffff;
        }
      }

      * { box-sizing: border-box; margin: 0; padding: 0; }
      
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: var(--bg-main);
        color: var(--text-main);
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        padding: 20px;
        transition: background 0.3s ease;
      }

      .login-container {
        background: var(--bg-container);
        padding: 3rem 2rem;
        border-radius: 20px;
        box-shadow: var(--shadow);
        width: 100%;
        max-width: 360px;
        text-align: center;
        border: 1px solid var(--border);
        transition: background 0.3s ease, border 0.3s ease, box-shadow 0.3s ease;
      }

      /* Стилізація логотипу точнісінько як у шапці твого сайту */
      .logo-area {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8px;
        margin-bottom: 0.6rem;
      }

      /* Маленька зелена точка-індикатор авторизації з оригінального UI */
      .status-dot {
        width: 8px;
        height: 8px;
        background-color: var(--accent);
        border-radius: 50%;
        display: inline-block;
      }

      h2 {
        font-size: 1.6rem;
        font-weight: 700;
        letter-spacing: -0.02em;
        color: var(--text-main);
      }

      p {
        color: var(--text-muted);
        font-size: 0.9rem;
        margin-bottom: 2.2rem;
      }

      .input-group {
        position: relative;
        margin-bottom: 1.2rem;
      }

      input[type="password"] {
        width: 100%;
        padding: 14px 16px;
        border-radius: 12px;
        border: 1px solid var(--border);
        background: var(--bg-input);
        color: var(--input-text);
        font-size: 1rem;
        transition: all 0.2s ease;
        text-align: center;
      }

      input[type="password"]:focus {
        outline: none;
        border-color: var(--accent);
        box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.15);
      }

      button {
        width: 100%;
        padding: 14px;
        background: var(--accent);
        color: #ffffff;
        border: none;
        border-radius: 12px;
        font-size: 0.95rem;
        font-weight: 600;
        cursor: pointer;
        transition: all 0.2s ease;
      }

      button:hover {
        background: var(--accent-hover);
        transform: translateY(-0.5px);
      }

      button:active {
        transform: translateY(0.5px);
      }

      .error-msg {
        background: var(--error-bg);
        border: 1px solid rgba(239, 68, 68, 0.15);
        color: var(--error-text);
        font-size: 0.85rem;
        padding: 12px;
        border-radius: 10px;
        margin-bottom: 1.2rem;
        animation: shake 0.4s ease-in-out;
      }

      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-4px); }
        75% { transform: translateX(4px); }
      }
    </style>
  </head>
  <body>
    <div class="login-container">
      <div class="logo-area">
        <h2>Drive-Lens</h2>
        <span class="status-dot"></span>
      </div>
      <p>Введіть ключ доступу для запуску панелі</p>
      
      <form action="/login-action" method="POST">
        ${errorMessage ? `<div class="error-msg">⚠️ ${errorMessage}</div>` : ''}
        <div class="input-group">
          <input type="password" name="password" placeholder="••••••••" required autofocus>
        </div>
        <button type="submit">Увійти</button>
      </form>
    </div>
  </body>
  </html>
  `, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
