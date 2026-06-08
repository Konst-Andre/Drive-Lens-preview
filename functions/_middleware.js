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
  const errBlock = errorMessage
    ? `<div class="error-msg">&#9888;&#65039; ${errorMessage}</div>`
    : "";

  return new Response(`<!DOCTYPE html>
<html lang="uk">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
  <title>Авторизація | Drive-Lens</title>
  <style>

    /* ══════════════════════════════════════
       DESIGN TOKENS
    ══════════════════════════════════════ */
    :root {
      --bg-main:        #040705;
      --bg-image:       url('https://raw.githubusercontent.com/Konst-Andre/Drive-Lens-preview/main/assets/bg-dark.PNG');
      --overlay:        rgba(4, 7, 5, 0.42);
      --bg-card:        rgba(12, 24, 18, 0.60);
      --bg-input:       rgba(4, 12, 8, 0.72);
      --input-border:   rgba(17, 168, 119, 0.25);
      --input-border-f: rgba(17, 168, 119, 0.72);
      --text-main:      #eef4f1;
      --text-muted:     #6a8075;
      --text-label:     rgba(17, 168, 119, 0.55);
      --accent:         #11a877;
      --accent-hi:      #19d496;
      --btn-grad:       linear-gradient(175deg, #18d492 0%, #0e9668 55%, #0a7552 100%);
      --btn-shadow:     rgba(17, 168, 119, 0.28);
      --border-card:    rgba(17, 168, 119, 0.18);
      --border-top:     rgba(255, 255, 255, 0.12);
      --shadow-card:
        0 0 0 1px rgba(17, 168, 119, 0.10),
        0 40px 80px -20px rgba(0, 0, 0, 0.90),
        0 12px 32px -8px rgba(0, 0, 0, 0.60);
      --tg:             #229ED9;
      --tg-bg:          rgba(34, 158, 217, 0.08);
      --tg-border:      rgba(34, 158, 217, 0.22);
      --err-bg:         rgba(239, 68, 68, 0.10);
      --err-border:     rgba(239, 68, 68, 0.22);
      --err-text:       #fca5a5;
      --icon-filter:    drop-shadow(0 0 10px rgba(17, 168, 119, 0.40));

      /* Dark input: inner light top-highlight + depth */
      --input-shadow:
        inset 0 1px 0   rgba(255, 255, 255, 0.07),
        inset 0 3px 8px rgba(0, 0, 0, 0.65),
        inset 0 -1px 3px rgba(0, 0, 0, 0.40);
    }

    @media (prefers-color-scheme: light) {
      :root {
        --bg-main:        #e8f0ec;
        --bg-image:       url('https://raw.githubusercontent.com/Konst-Andre/Drive-Lens-preview/main/assets/bg-light.PNG');
        --overlay:        rgba(220, 235, 228, 0.20);
        --bg-card:        rgba(248, 252, 250, 0.72);
        --bg-input:       rgba(235, 248, 242, 0.92);
        --input-border:   rgba(17, 168, 119, 0.44);
        --input-border-f: rgba(17, 168, 119, 0.72);
        --text-main:      #0e2219;
        --text-muted:     #4a6a58;
        --text-label:     rgba(90, 120, 105, 0.85);
        --border-card:    rgba(17, 168, 119, 0.22);
        --border-top:     rgba(255, 255, 255, 0.82);
        --shadow-card:
          0 0 0 1px rgba(17, 168, 119, 0.12),
          0 30px 60px -15px rgba(0, 0, 0, 0.14),
          0 10px 24px -6px rgba(10, 40, 25, 0.10);
        --btn-shadow:     rgba(17, 168, 119, 0.32);
        --tg-bg:          rgba(34, 158, 217, 0.10);
        --tg-border:      rgba(34, 158, 217, 0.35);
        --err-bg:         rgba(220, 38, 38, 0.08);
        --err-border:     rgba(220, 38, 38, 0.20);
        --err-text:       #b91c1c;
        --icon-filter:    drop-shadow(0 2px 5px rgba(17, 168, 119, 0.22));

        /* Light input: classic inset depth */
        --input-shadow:
          inset 0 2px 6px  rgba(0, 0, 0, 0.10),
          inset 0 1px 2px  rgba(0, 0, 0, 0.08),
          0    1px 0       rgba(255, 255, 255, 0.80);
      }
    }

    /* ══════════════════════════════════════
       RESET
    ══════════════════════════════════════ */
    *, *::before, *::after {
      box-sizing: border-box;
      margin: 0; padding: 0;
      -webkit-user-select: none;
      user-select: none;
      -webkit-touch-callout: none;
      touch-action: manipulation;
    }

    /* ══════════════════════════════════════
       BODY + BACKGROUND
    ══════════════════════════════════════ */
    body {
      font-family: -apple-system, BlinkMacSystemFont, "SF Pro Display",
                   "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: var(--bg-main);
      background-image: var(--bg-image);
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
      background-attachment: fixed;
      color: var(--text-main);
      min-height: 100vh;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 20px;
      overflow: hidden;
      position: relative;
    }

    body::before {
      content: "";
      position: absolute;
      inset: 0;
      background: var(--overlay);
      pointer-events: none;
      z-index: 0;
    }

    /* ══════════════════════════════════════
       CARD
    ══════════════════════════════════════ */
    .card {
      position: relative;
      z-index: 10;
      width: 100%;
      max-width: 352px;
      background: var(--bg-card);
      backdrop-filter: blur(48px);
      -webkit-backdrop-filter: blur(48px);
      border: 1px solid var(--border-card);
      border-radius: 28px;
      box-shadow: var(--shadow-card);
      padding: 2.8rem 2.0rem 2.0rem;
      text-align: center;
      animation: cardReveal 0.60s cubic-bezier(0.34, 1.42, 0.64, 1) both;
    }

    /* Top-edge shimmer */
    .card::before {
      content: "";
      position: absolute;
      top: 0; left: 10%; right: 10%;
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent,
        var(--border-top) 35%,
        rgba(255,255,255,0.24) 50%,
        var(--border-top) 65%,
        transparent
      );
      pointer-events: none;
      z-index: 1;
    }

    /* ══════════════════════════════════════
       BRAND ICON — Speedometer/Lens hybrid
    ══════════════════════════════════════ */
    .brand-icon {
      display: flex;
      justify-content: center;
      margin-bottom: 1.0rem;
    }

    .brand-icon svg {
      width: 40px;
      height: 40px;
      filter: var(--icon-filter);
    }

    /* ══════════════════════════════════════
       TITLE
    ══════════════════════════════════════ */
    .title {
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

    /* SONAR DOT — visible on both themes */
    .dot {
      width: 7px;
      height: 7px;
      background: var(--accent-hi);
      border-radius: 50%;
      margin-top: 3px;
      flex-shrink: 0;
      animation: dotSonar 2.6s ease-out infinite;
    }

    .subtitle {
      margin-top: 0.5rem;
      margin-bottom: 1.8rem;
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--text-label);
    }

    /* ══════════════════════════════════════
       DIVIDER
    ══════════════════════════════════════ */
    .divider {
      height: 1px;
      background: linear-gradient(
        90deg,
        transparent 0%,
        var(--border-card) 20%,
        var(--border-card) 80%,
        transparent 100%
      );
      margin-bottom: 1.6rem;
      opacity: 0.9;
    }

    /* ══════════════════════════════════════
       INPUT
    ══════════════════════════════════════ */
    .field { margin-bottom: 0.9rem; }

    .field-label {
      display: block;
      font-size: 0.68rem;
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
      font-weight: 700;
      text-align: center;
      letter-spacing: 0.45rem;
      box-shadow: var(--input-shadow);
      transition: border-color 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
      -webkit-user-select: text;
      user-select: text;
    }

    input[type="password"]::placeholder {
      font-size: 14px;
      font-weight: 400;
      letter-spacing: 0.28rem;
      opacity: 0.28;
    }

    /* Breathing border in dark theme when empty */
    @media not (prefers-color-scheme: light) {
      input[type="password"]:placeholder-shown:not(:focus) {
        animation: inputBreath 3.2s ease-in-out infinite;
      }
    }

    input[type="password"]:focus {
      outline: none;
      border-color: var(--input-border-f);
      animation: none;
      box-shadow:
        var(--input-shadow),
        0 0 0 3px rgba(17, 168, 119, 0.14),
        0 0 18px rgba(17, 168, 119, 0.07);
    }

    @media (prefers-color-scheme: light) {
      input[type="password"]:focus {
        background: rgba(255, 255, 255, 0.97);
      }
    }

    /* ══════════════════════════════════════
       BUTTON — Full pill, intentional contrast with input
    ══════════════════════════════════════ */
    .btn-submit {
      width: 100%;
      padding: 15px;
      margin-top: 0.2rem;
      background: var(--btn-grad);
      color: #04140a;
      font-weight: 700;
      font-size: 0.92rem;
      letter-spacing: 0.02em;
      border: none;
      border-radius: 50px;
      cursor: pointer;
      position: relative;
      overflow: hidden;
      box-shadow:
        0 4px 16px var(--btn-shadow),
        inset 0 1px 1px rgba(255, 255, 255, 0.30);
      transition: transform 0.22s ease, box-shadow 0.22s ease, filter 0.22s ease;
    }

    /* Shimmer sweep on hover */
    .btn-submit::after {
      content: "";
      position: absolute;
      top: 0; bottom: 0; left: -110%;
      width: 60%;
      background: linear-gradient(
        105deg,
        transparent 20%,
        rgba(255,255,255,0.22) 50%,
        transparent 80%
      );
      transform: skewX(-15deg);
      transition: left 0.55s ease;
      pointer-events: none;
    }

    .btn-submit:hover {
      transform: translateY(-1px);
      filter: brightness(1.06);
      box-shadow: 0 8px 28px var(--btn-shadow), inset 0 1px 1px rgba(255,255,255,0.40);
    }
    .btn-submit:hover::after { left: 160%; }
    .btn-submit:active {
      transform: translateY(1px);
      filter: brightness(0.96);
      box-shadow: 0 2px 8px var(--btn-shadow), inset 0 2px 4px rgba(0,0,0,0.15);
    }
    .btn-submit:disabled { opacity: 0.60; cursor: not-allowed; }

    /* ══════════════════════════════════════
       ERROR
    ══════════════════════════════════════ */
    .error-msg {
      background: var(--err-bg);
      border: 1px solid var(--err-border);
      color: var(--err-text);
      font-size: 0.80rem;
      line-height: 1.4;
      padding: 10px 12px;
      border-radius: 12px;
      margin-bottom: 1.1rem;
      animation: shake 0.38s ease-in-out;
    }

    /* ══════════════════════════════════════
       FOOTER
    ══════════════════════════════════════ */
    .footer {
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
      gap: 8px;
    }

    .hline {
      flex: 1;
      min-width: 20px;
      height: 1px;
      flex-shrink: 1;
    }
    .hline-l { background: linear-gradient(90deg, transparent, var(--border-card)); }
    .hline-r { background: linear-gradient(90deg, var(--border-card), transparent); }

    .dev-badge {
      flex-shrink: 0;
      font-family: ui-monospace, "SF Mono", SFMono-Regular, Menlo, Consolas, monospace;
      font-size: 0.60rem;
      font-weight: 600;
      letter-spacing: 0.10em;
      color: var(--text-muted);
      padding: 3px 8px 4px;
      border: 1px solid var(--border-card);
      border-radius: 4px;
      background: rgba(17, 168, 119, 0.03);
      white-space: nowrap;
    }

    .tg-link {
      display: flex;
      align-items: center;
      gap: 6px;
      text-decoration: none;
      font-size: 0.74rem;
      font-weight: 600;
      color: var(--tg);
      background: var(--tg-bg);
      border: 1px solid var(--tg-border);
      padding: 7px 16px;
      border-radius: 20px;
      transition: all 0.22s ease;
    }

    .tg-link svg {
      width: 13px; height: 13px;
      fill: var(--tg);
      flex-shrink: 0;
      transition: fill 0.22s ease, transform 0.22s ease;
    }

    .tg-link:hover, .tg-link:active {
      background: var(--tg);
      border-color: var(--tg);
      color: #fff;
      box-shadow: 0 4px 16px rgba(34,158,217,0.30);
    }
    .tg-link:hover svg, .tg-link:active svg {
      fill: #fff;
      transform: scale(1.08) rotate(-5deg);
    }

    /* ══════════════════════════════════════
       RESPONSIVE
    ══════════════════════════════════════ */
    @media (max-width: 400px) {
      .card { padding: 2.2rem 1.4rem 1.8rem; border-radius: 24px; }
      .title { font-size: 1.65rem; }
      .brand-icon svg { width: 36px; height: 36px; }
    }

    /* ══════════════════════════════════════
       KEYFRAMES
    ══════════════════════════════════════ */
    @keyframes cardReveal {
      from { opacity: 0; transform: translateY(22px) scale(0.97); }
      to   { opacity: 1; transform: translateY(0)    scale(1);    }
    }

    /* Sonar/radar ripple — visible on both dark and light */
    @keyframes dotSonar {
      0% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(25, 212, 150, 0.75);
      }
      55% {
        transform: scale(1.15);
        box-shadow: 0 0 0 8px rgba(25, 212, 150, 0);
      }
      100% {
        transform: scale(1);
        box-shadow: 0 0 0 0 rgba(25, 212, 150, 0);
      }
    }

    /* Breathing border — dark theme empty input */
    @keyframes inputBreath {
      0%, 100% { border-color: rgba(17, 168, 119, 0.25); }
      50%       { border-color: rgba(17, 168, 119, 0.52); }
    }

    @keyframes shake {
      0%,100% { transform: translateX(0);   }
      20%     { transform: translateX(-5px); }
      40%     { transform: translateX( 5px); }
      60%     { transform: translateX(-3px); }
      80%     { transform: translateX( 3px); }
    }

  </style>
</head>
<body>

<div class="card">

  <!--
    ICON: Speedometer + Lens hybrid
    Arc = speedometer dial (Drive)
    Outer ring + center aperture = lens (Lens)
    Needle at ~65% = active / in motion
  -->
  <div class="brand-icon">
    <svg viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
      <!-- Outer ring (lens barrel) -->
      <circle cx="21" cy="21" r="19"
              stroke="rgba(17,168,119,0.28)"
              stroke-width="1.5"/>

      <!-- Speedometer arc: 240° from 8-o'clock to 4-o'clock over 12-o'clock
           r=13, circumference≈81.68, arc=54.5, gap=27.2
           rotate(150) moves start from 3-o'clock to 8-o'clock -->
      <circle cx="21" cy="21" r="13"
              stroke="#11a877"
              stroke-width="2"
              stroke-dasharray="54.5 27.2"
              stroke-linecap="round"
              transform="rotate(150 21 21)"
              opacity="0.72"/>

      <!-- Tick marks at 8, 10, 12, 2, 4 o'clock positions -->
      <line x1="11.5" y1="26.5" x2="8.9"  y2="28.0" stroke="#11a877" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>
      <line x1="11.5" y1="15.5" x2="8.9"  y2="14.0" stroke="#11a877" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>
      <line x1="21"   y1="10"   x2="21"   y2="7"    stroke="#11a877" stroke-width="1.5" stroke-linecap="round" opacity="0.72"/>
      <line x1="30.5" y1="15.5" x2="33.1" y2="14.0" stroke="#11a877" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>
      <line x1="30.5" y1="26.5" x2="33.1" y2="28.0" stroke="#11a877" stroke-width="1.2" stroke-linecap="round" opacity="0.55"/>

      <!-- Needle pointing at ~65% of arc (1-2 o'clock area = active/moving) -->
      <line x1="21" y1="21" x2="27.5" y2="12.1"
            stroke="#19d496"
            stroke-width="2.2"
            stroke-linecap="round"/>

      <!-- Center pivot cap -->
      <circle cx="21" cy="21" r="2.6"
              fill="rgba(17,168,119,0.20)"
              stroke="#11a877"
              stroke-width="1.5"/>
      <circle cx="21" cy="21" r="1.2" fill="#19d496"/>
    </svg>
  </div>

  <!-- Title -->
  <h1 class="title">Drive<span class="dot"></span>Lens</h1>
  <p class="subtitle">Вхід за ключем доступу</p>

  <div class="divider"></div>

  <!-- Form -->
  <form action="/login-action" method="POST" autocomplete="off">
    ${errBlock}

    <div class="field">
      <label class="field-label" for="pin">Ключ доступу</label>
      <input
        id="pin"
        type="password"
        name="password"
        placeholder="&middot; &middot; &middot; &middot;"
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

    <button type="submit" class="btn-submit">Увійти</button>
  </form>

  <!-- Footer -->
  <div class="footer">
    <div class="footer-row">
      <div class="hline hline-l"></div>
      <div class="dev-badge">DEV&nbsp;//&nbsp;KONSTANTINOV&nbsp;A.</div>
      <div class="hline hline-r"></div>
    </div>

    <a href="https://t.me/Konst_Andre"
       target="_blank"
       rel="noopener noreferrer"
       class="tg-link">
      <svg viewBox="0 0 24 24">
        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10
                 10-4.48 10-10S17.52 2 12 2zm4.64 6.8
                 c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03
                 -.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5
                 -1-.65-.35-1 .22-1.62.15-.15 2.7-2.48 2.75-2.7
                 .01-.03.01-.14-.06-.2-.07-.06-.17-.04-.25-.02
                 -.11.02-1.83 1.16-5.16 3.42-.49.34-.93.51-1.33.5
                 -.44-.01-1.3-.25-1.93-.46-.78-.25-1.4-.39-1.35-.83
                 .03-.23.35-.47.96-.71 3.76-1.64 6.27-2.72 7.54-3.25
                 3.58-1.48 4.32-1.74 4.81-1.75.11 0 .35.03.5.16
                 .13.11.17.26.19.37z"/>
      </svg>
      <span>Зв'язок</span>
    </a>
  </div>

</div>

</body>
</html>`, {
    headers: { "Content-Type": "text/html; charset=utf-8" }
  });
}
