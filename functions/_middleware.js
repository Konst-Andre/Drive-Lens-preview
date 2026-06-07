export async function onRequest(context) {
  const { request } = context;
  
  // ==========================================
  // НАЛАШТУВАННЯ ЛОГІНУ ТА ПАРОЛЮ (Змініть на свої)
  // ==========================================
  const USERNAME = "EastTeam"; 
  const PASSWORD = "000111"; 
  // ==========================================

  const authHeader = request.headers.get('Authorization');

  if (authHeader) {
    const [scheme, encoded] = authHeader.split(' ');
    if (scheme.toLowerCase() === 'basic') {
      try {
        const decoded = atob(encoded);
        const [username, password] = decoded.split(':');
        
        // Перевірка відповідності
        if (username === USERNAME && password === PASSWORD) {
          return await context.next(); // Пропускаємо на сайт
        }
      } catch (e) {
        // Помилка декодування
      }
    }
  }

  // Якщо логін/пароль невірні або відсутні — показуємо вікно авторизації
  return new Response('Потрібна авторизація для доступу до Drive Lens', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Drive Lens Area"',
    },
  });
}
