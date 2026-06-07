export async function onRequest(context) {
  const { request } = context;
  const url = new URL(request.url);

  // =========================================================================
  // 🔑 НАЛАШТУВАННЯ БЕЗПЕКИ: ЗМІНЮЙТЕ ПАРОЛЬ СУТО ТУТ!
  // =========================================================================
  const PASSWORD = "0000"; 
  
  // Якщо захочете примусово скинути авторизацію у всіх — змініть "v1" на "v2"
  const APP_VERSION = "v1"; 
  // =========================================================================

  const COOKIE_NAME = `drive_lens_session_${APP_VERSION}`;

  // 1. Перевірка кукі-перепустки
  const cookieHeader = request.headers.get("Cookie") || "";
  if (cookieHeader.includes(`${COOKIE_NAME}=authenticated`)) {
    return await context.next(); 
  }

  // 2. Обробка введення пароля
  if (request.method === "POST" && url.pathname === "/login-action") {
    try {
      const formData = await request.formData();
      const enteredPassword = formData.get("password");

      if (enteredPassword === PASSWORD) {
        // Якщо пароль підійшов — записуємо кукі на 1 рік
        return new Response(null, {
          status: 302,
          headers: {
            "Location": "/",
            "Set-Cookie": `${COOKIE_NAME}=authenticated; Path=/; Max-Age=31536000; Secure; SameSite=Strict; HttpOnly`
          }
        });
      } else {
        return getLoginHTML("Неправильний пароль. Спробуйте ще раз!");
      }
    } catch (e) {
      return getLoginHTML("Помилка обробки даних.");
    }
  }

  // 3. Якщо кукі немає — показуємо форму
  return getLoginHTML();
}

// Повністю готовий інтерфейс з одним полем пароля
function getLoginHTML(errorMessage = "") {
  const BACKGROUND_IMAGE_URL = "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=1920&auto=format&fit=crop";

  return new Response(`
  <!DOCTYPE html>
  <html lang="uk">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Авторизація | Drive Lens</title>
    <style>
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
        background: radial-gradient(circle at center, #1e293b 0%, #0f172a 100%);
        background-image: linear-gradient(rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.95)), url('${BACKGROUND_IMAGE_URL}');
        background-size: cover;
        background-position: center;
        background-attachment: fixed;
        color: #f8fafc;
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        padding: 20px;
      }
      .login-container {
        background: rgba(30, 41, 59, 0.7);
        backdrop-filter: blur(16px);
        -webkit-backdrop-filter: blur(16px);
        padding: 3rem 2.5rem;
        border-radius: 24px;
        box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
        width: 100%;
        max-width: 380px;
        text-align: center;
        border: 1px solid rgba(255, 255, 255, 0.08);
      }
      h2 {
        color: #2dd4bf;
        font-size: 2rem;
        font-weight: 800;
        letter-spacing: -0.03em;
        margin-bottom: 0.5rem;
      }
      p {
        color: #94a3b8;
        font-size: 0.95rem;
        margin-bottom: 2.5rem;
      }
      .input-group {
        position: relative;
        margin-bottom: 1.2rem;
      }
      input[type="password"] {
        width: 100%;
        padding: 14px 20px;
        border-radius: 12px;
        border: 1px solid rgba(255, 255, 255, 0.1);
        background: rgba(15, 23, 42, 0.6);
        color: #ffffff;
        font-size: 1rem;
        transition: all 0.2s ease;
        text-align: center;
      }
      input[type="password"]:focus {
        outline: none;
        border-color: #2dd4bf;
        background: rgba(15, 23, 42, 0.8);
        box-shadow: 0 0 0 3px rgba(45, 212, 191, 0.15);
      }
      button {
        width: 100%;
        padding: 14px;
        background: #2dd4bf;
        color: #0f172a;
        border: none;
        border-radius: 12px;
        font-size: 1rem;
        font-weight: 700;
        cursor: pointer;
        transition: all 0.2s ease;
        box-shadow: 0 4px 12px rgba(45, 212, 191, 0.25);
      }
      button:hover {
        background: #14b8a6;
        transform: translateY(-1px);
      }
      .error-msg {
        background: rgba(239, 68, 68, 0.1);
        border: 1px solid rgba(239, 68, 68, 0.2);
        color: #fca5a5;
        font-size: 0.85rem;
        padding: 10px;
        border-radius: 10px;
        margin-bottom: 1.2rem;
        animation: shake 0.4s ease-in-out;
      }
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        25% { transform: translateX(-6px); }
        75% { transform: translateX(6px); }
      }
    </style>
  </head>
  <body>
    <div class="login-container">
      <h2>Drive Lens</h2>
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
