// Загрузка данных из localStorage
let score = parseInt(localStorage.getItem('astroClickerScore')) || 0;
let clickPower = parseInt(localStorage.getItem('astroClickerPower')) || 1; // Сколько астронов за клик
let autoClickers = parseInt(localStorage.getItem('astroAutoClickers')) || 0; // Автокликеры
let telegramData = null; // Данные от Telegram WebApp
let clicksSinceLastSync = 0; // Количество кликов с последней синхронизации

const scoreElement = document.getElementById('score');
const clickPowerElement = document.getElementById('click-power');
const autoCountElement = document.getElementById('auto-count');
const planetElement = document.getElementById('planet');
const particlesContainer = document.getElementById('particles');
const astroInfoElement = document.querySelector('.astro-info p');

// Проверяем, доступен ли Telegram WebApp
if (window.Telegram && window.Telegram.WebApp) {
    const webApp = window.Telegram.WebApp;

    // Устанавливаем цвет фона
    webApp.setBackgroundColor('#1a1a2e');

    // Получаем initData
    const initData = webApp.initData;
    const initDataUnsafe = webApp.initDataUnsafe;

    // Аутентифицируемся с ботом
    authenticateWithBot(initData);

    // Отправляем событие начала сессии
    sendSessionStart();

    // При закрытии WebApp отправляем событие окончания сессии
    window.addEventListener('beforeunload', () => {
        sendSessionEnd();
    });
} else {
    console.log("Telegram WebApp недоступен");
}

// Функция аутентификации с ботом
async function authenticateWithBot(initData) {
    try {
        const response = await fetch('http://127.0.0.1:8000/webapp/auth', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ initData })
        });

        const data = await response.json();

        if (data.status === 'ok') {
            telegramData = data.user;
            console.log('Аутентификация успешна:', telegramData);

            // Загружаем данные пользователя из бота
            score = telegramData.astral_coins * 100000; // 1 астрокоин = 100000 астронов
            clickPower = telegramData.webapp_click_power || 1; // Сила клика из бота
            autoClickers = telegramData.webapp_auto_clickers || 0; // Автокликеры из бота

            scoreElement.textContent = score;
            clickPowerElement.textContent = clickPower;
            autoCountElement.textContent = autoClickers;

            localStorage.setItem('astroClickerScore', score);
            localStorage.setItem('astroClickerPower', clickPower);
            localStorage.setItem('astroAutoClickers', autoClickers);
        } else {
            console.error('Ошибка аутентификации:', data.error);
        }
    } catch (error) {
        console.error('Ошибка при аутентификации:', error);
    }
}

// Функция отправки начала сессии
async function sendSessionStart() {
    if (telegramData) {
        try {
            await fetch('http://127.0.0.1:8000/webapp/session_start', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: telegramData.user_id
                })
            });
        } catch (error) {
            console.error('Ошибка при отправке начала сессии:', error);
        }
    }
}

// Функция отправки окончания сессии
async function sendSessionEnd() {
    if (telegramData) {
        try {
            const sessionDuration = Math.floor((Date.now() - startTime) / 1000); // в секундах
            await fetch('http://127.0.0.1:8000/webapp/session_end', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    user_id: telegramData.user_id,
                    session_duration: sessionDuration
                })
            });
        } catch (error) {
            console.error('Ошибка при отправке окончания сессии:', error);
        }
    }
}

// Отслеживаем время начала сессии
const startTime = Date.now();

scoreElement.textContent = score;
clickPowerElement.textContent = clickPower;
autoCountElement.textContent = autoClickers;

// Астрологические сообщения
const astroMessages = [
  "Меркурий в ретрограде - идеальное время для внутреннего роста!",
  "Венера приближается к Юпитеру - ожидайте приятных сюрпризов!",
  "Марс в квадрате с Нептуном - будьте осторожны с важными решениями.",
  "Сатурн благословляет ваш путь - терпение принесет плоды!",
  "Луна в новолунии усиливает интуицию - доверьтесь внутреннему голосу.",
  "Плутон в Тельце призывает к пересмотру ценностей.",
  "Уран в Водолее дарит неожиданные идеи - будьте открыты новому!",
  "Нептун усиливает вашу интуицию - прислушайтесь к сновидениям.",
  "Юпитер в Стрельце расширяет горизонты - время для путешествий!",
  "Луна в Рыбах усиливает эмпатию - забота о других принесет радость."
];

planetElement.addEventListener('click', () => {
  score += clickPower;
  clicksSinceLastSync += 1; // Увеличиваем счетчик кликов с последней синхронизации
  scoreElement.textContent = score;
  localStorage.setItem('astroClickerScore', score);

  // Анимация
  createParticle();

  // Кратковременная визуальная обратная связь
  planetElement.style.transform = 'scale(0.9)';
  setTimeout(() => {
    planetElement.style.transform = 'scale(1)';
  }, 100);

  // Случайное астрологическое сообщение каждые 5 кликов
  if (score % 5 === 0) {
    showAstroMessage();
  }
});

// Автокликеры
setInterval(() => {
  if (autoClickers > 0) {
    score += autoClickers;
    scoreElement.textContent = score;
    localStorage.setItem('astroClickerScore', score);

    // Создаем частицу для автокликера
    if (autoClickers > 0) {
      createAutoParticle();
    }
  }
}, 1000);

// Функция для создания частицы автокликера
function createAutoParticle() {
  // Ограничиваем количество частиц автокликеров на мобильных устройствах
  if (isMobileDevice() && autoClickers > 5) {
    // Если слишком много автокликеров на мобильном, создаем частицу реже
    if (Math.random() > 0.3) { // Только 30% частиц
      return;
    }
  }

  const particle = document.createElement('div');
  particle.classList.add('particle');

  particle.textContent = '+1/sec';
  particle.style.position = 'absolute';
  particle.style.left = `${Math.random() * window.innerWidth}px`;
  particle.style.top = `${Math.random() * window.innerHeight}px`;
  particle.style.color = '#00ccff';
  particle.style.fontSize = '14px'; // Уменьшенный размер для мобильных
  particle.style.fontWeight = 'bold';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '20';
  particle.style.opacity = '0.8';
  particle.style.transition = 'all 2s ease-out';
  particle.style.userSelect = 'none';
  particle.style.willChange = 'transform, opacity'; // Оптимизация производительности

  particlesContainer.appendChild(particle);

  // Анимация исчезновения
  setTimeout(() => {
    particle.style.opacity = '0';
    particle.style.transform = 'translateY(-30px)';
  }, 10);

  // Удалить элемент после анимации
  setTimeout(() => {
    particle.remove();
  }, 2000);
}

// Функция для определения мобильного устройства
function isMobileDevice() {
  return window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
}

function createParticle() {
  const particle = document.createElement('div');
  particle.classList.add('particle');

  // Случайный выбор символа для частицы
  const symbols = ['+1', '✨', '🌟', '⭐', '💫', '🌙', '⭐'];
  const randomSymbol = symbols[Math.floor(Math.random() * symbols.length)];
  particle.textContent = `+${clickPower}`; // Показываем силу клика

  // Случайное позиционирование относительно планеты
  const rect = planetElement.getBoundingClientRect();
  const centerX = rect.left + rect.width / 2;
  const centerY = rect.top + rect.height / 2;

  particle.style.position = 'absolute';
  particle.style.left = `${centerX}px`;
  particle.style.top = `${centerY}px`;
  particle.style.color = getRandomColor();
  particle.style.fontSize = '20px'; // Уменьшенный размер для лучшей производительности
  particle.style.fontWeight = 'bold';
  particle.style.pointerEvents = 'none';
  particle.style.zIndex = '20';
  particle.style.opacity = '1';
  particle.style.transition = 'all 1s ease-out';
  particle.style.userSelect = 'none';
  particle.style.willChange = 'transform, opacity'; // Оптимизация производительности

  particlesContainer.appendChild(particle);

  // Анимация разлета в случайном направлении
  const angle = Math.random() * Math.PI * 2; // Случайный угол
  const distance = 60 + Math.random() * 50; // Уменьшенное расстояние для мобильных
  const endX = Math.cos(angle) * distance;
  const endY = Math.sin(angle) * distance - 80; // Движение вверх с дополнительным смещением

  setTimeout(() => {
    particle.style.transform = `translate(${endX}px, ${endY}px)`;
    particle.style.opacity = '0';
  }, 10);

  // Удалить элемент после анимации
  setTimeout(() => {
    particle.remove();
  }, 1000);
}

// Функция для получения случайного цвета
function getRandomColor() {
  const colors = [
    '#ffcc00', // Желтый
    '#00ccff', // Голубой
    '#ff66cc', // Розовый
    '#66ff66', // Зеленый
    '#ff9966', // Оранжевый
    '#cc66ff'  // Фиолетовый
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Функция для отображения астрологического сообщения
function showAstroMessage() {
  // Добавляем сообщения, связанные с прогрессом в игре
  let progressMessages = [];

  if (clickPower > 1) {
    progressMessages.push(`Ваша сила клика: ${clickPower}! Планета становится ярче!`);
  }

  if (autoClickers > 0) {
    progressMessages.push(`У вас ${autoClickers} автокликер(ов)! Космос работает на вас!`);
  }

  if (score > 100) {
    progressMessages.push("Вы накопили более 100 астронов! Звезды горят ярче!");
  }

  if (score > 500) {
    progressMessages.push("Вы достигли 500 астронов! Сила космоса с вами!");
  }

  // Смешиваем астрологические и прогресс-сообщения
  const allMessages = [...astroMessages, ...progressMessages];
  const randomMessage = allMessages[Math.floor(Math.random() * allMessages.length)];

  astroInfoElement.textContent = randomMessage;

  // Анимация для текста
  astroInfoElement.style.animation = 'none';
  setTimeout(() => {
    astroInfoElement.style.animation = 'pulse 0.5s';
  }, 10);
}

// Добавляем CSS для анимации пульсации
const style = document.createElement('style');
style.textContent = `
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); }
  }
`;
document.head.appendChild(style);

// Обновляем отображение улучшений
function updateUpgradeDisplay() {
  document.getElementById('power-level').textContent = clickPower;
  document.getElementById('auto-clicker-count').textContent = autoClickers;
  clickPowerElement.textContent = clickPower;
  autoCountElement.textContent = autoClickers;

  // Рассчитываем стоимость улучшений
  const powerCost = 10 * Math.pow(2, clickPower - 1); // Увеличивается экспоненциально
  const autoClickerCost = 50 * Math.pow(1.5, autoClickers); // Увеличивается экспоненциально

  document.getElementById('power-cost').textContent = Math.floor(powerCost);
  document.getElementById('auto-clicker-cost').textContent = Math.floor(autoClickerCost);

  // Проверяем, можно ли купить улучшения
  document.getElementById('power-btn').disabled = score < powerCost;
  document.getElementById('auto-clicker-btn').disabled = score < autoClickerCost;

  // Обновляем текст кнопок для мобильных устройств
  if (isMobileDevice()) {
    document.getElementById('power-btn').textContent = `Сила: ${clickPower} (${Math.floor(powerCost)})`;
    document.getElementById('auto-clicker-btn').textContent = `Авто: ${autoClickers} (${Math.floor(autoClickerCost)})`;
  } else {
    document.getElementById('power-btn').textContent = `Улучшить силу клика (Уровень: ${clickPower})`;
    document.getElementById('auto-clicker-btn').textContent = `Купить автокликер (Кол-во: ${autoClickers})`;
  }
}

// Инициализация отображения улучшений
updateUpgradeDisplay();

// Обработчики для кнопок улучшений
document.getElementById('power-btn').addEventListener('click', async () => {
  const powerCost = 10 * Math.pow(2, clickPower - 1);

  if (score >= powerCost) {
    // Проверяем, есть ли подключение к Telegram WebApp
    if (telegramData) {
      // Покупаем улучшение через бота
      const purchaseResult = await purchaseUpgrade('click_power', powerCost);

      if (purchaseResult.success) {
        // Обновляем локальные данные
        score -= powerCost;
        clickPower += 1;

        scoreElement.textContent = score;
        localStorage.setItem('astroClickerScore', score);
        localStorage.setItem('astroClickerPower', clickPower);

        updateUpgradeDisplay();
      } else {
        alert('Ошибка покупки: ' + purchaseResult.message);
      }
    } else {
      // Если нет подключения к боту, обновляем локально
      score -= powerCost;
      clickPower += 1;

      scoreElement.textContent = score;
      localStorage.setItem('astroClickerScore', score);
      localStorage.setItem('astroClickerPower', clickPower);

      updateUpgradeDisplay();
    }
  }
});

document.getElementById('auto-clicker-btn').addEventListener('click', async () => {
  const autoClickerCost = 50 * Math.pow(1.5, autoClickers);

  if (score >= autoClickerCost) {
    // Проверяем, есть ли подключение к Telegram WebApp
    if (telegramData) {
      // Покупаем улучшение через бота
      const purchaseResult = await purchaseUpgrade('auto_clicker', autoClickerCost);

      if (purchaseResult.success) {
        // Обновляем локальные данные
        score -= autoClickerCost;
        autoClickers += 1;

        scoreElement.textContent = score;
        localStorage.setItem('astroClickerScore', score);
        localStorage.setItem('astroAutoClickers', autoClickers);

        updateUpgradeDisplay();
      } else {
        alert('Ошибка покупки: ' + purchaseResult.message);
      }
    } else {
      // Если нет подключения к боту, обновляем локально
      score -= autoClickerCost;
      autoClickers += 1;

      scoreElement.textContent = score;
      localStorage.setItem('astroClickerScore', score);
      localStorage.setItem('astroAutoClickers', autoClickers);

      updateUpgradeDisplay();
    }
  }
});

// Функция покупки улучшения через бота
async function purchaseUpgrade(itemType, itemCost) {
  if (!telegramData) {
    return { success: false, message: "Нет подключения к боту" };
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/webapp/purchase', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: telegramData.user_id,
        item_type: itemType,
        item_cost: itemCost
      })
    });

    const data = await response.json();

    if (data.status === 'ok') {
      return { success: true, message: data.message };
    } else {
      return { success: false, message: data.error };
    }
  } catch (error) {
    console.error('Ошибка при покупке улучшения:', error);
    return { success: false, message: "Ошибка сети" };
  }
}

// Функция синхронизации прогресса с ботом
async function syncProgressWithBot() {
  if (!telegramData) {
    console.log("Нет подключения к боту для синхронизации");
    return;
  }

  // Проверяем, есть ли что синхронизировать
  if (clicksSinceLastSync === 0 && score === telegramData.astral_coins * 100000 &&
      clickPower === telegramData.webapp_click_power && autoClickers === telegramData.webapp_auto_clickers) {
    console.log("Нет изменений для синхронизации");
    return;
  }

  try {
    const response = await fetch('http://127.0.0.1:8000/webapp/sync_progress', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_id: telegramData.user_id,
        score: score,
        click_power: clickPower,
        auto_clickers: autoClickers,
        clicks_since_last_sync: clicksSinceLastSync
      })
    });

    const data = await response.json();

    if (data.status === 'ok') {
      console.log('Прогресс синхронизирован:', data);

      // Обновляем количество астроконов у пользователя
      if (data.astral_coins_added > 0) {
        // Показываем уведомление о начислении астроконов
        showNotification(`Получено ${data.astral_coins_added} астроконов!`);
      }

      // Сбрасываем счетчик кликов после успешной синхронизации
      clicksSinceLastSync = 0;
    } else {
      console.error('Ошибка синхронизации:', data.error);
    }
  } catch (error) {
    console.error('Ошибка при синхронизации прогресса:', error);
  }
}

// Функция получения обновленных данных пользователя из бота
async function fetchUserDataFromBot() {
  if (!telegramData) {
    console.log("Нет подключения к боту для получения данных");
    return;
  }

  try {
    const response = await fetch(`http://127.0.0.1:8000/webapp/user_data?user_id=${telegramData.user_id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (data.status === 'ok') {
      const userData = data.user;

      // Обновляем локальные переменные из данных бота
      score = userData.astral_coins * 100000; // 1 астрокоин = 100000 астронов
      clickPower = userData.click_power || 1;
      autoClickers = userData.auto_clickers || 0;

      // Обновляем отображение
      scoreElement.textContent = score;
      clickPowerElement.textContent = clickPower;
      autoCountElement.textContent = autoClickers;

      // Сохраняем в localStorage
      localStorage.setItem('astroClickerScore', score);
      localStorage.setItem('astroClickerPower', clickPower);
      localStorage.setItem('astroAutoClickers', autoClickers);

      console.log('Данные пользователя обновлены из бота:', userData);
    } else {
      console.error('Ошибка получения данных пользователя:', data.error);
    }
  } catch (error) {
    console.error('Ошибка при получении данных пользователя:', error);
  }
}

// Функция показа уведомления
function showNotification(message) {
  const notification = document.createElement('div');
  notification.textContent = message;
  notification.style.position = 'fixed';
  notification.style.top = '20px';
  notification.style.left = '50%';
  notification.style.transform = 'translateX(-50%)';
  notification.style.backgroundColor = '#ffcc00';
  notification.style.color = '#000';
  notification.style.padding = '10px 20px';
  notification.style.borderRadius = '5px';
  notification.style.zIndex = '1000';
  notification.style.fontWeight = 'bold';
  notification.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';

  document.body.appendChild(notification);

  // Удаляем уведомление через 3 секунды
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Синхронизируем прогресс каждые 30 секунд
setInterval(syncProgressWithBot, 30000);

// Получаем обновленные данные пользователя из бота каждые 60 секунд
setInterval(fetchUserDataFromBot, 60000);

// Обновляем отображение каждые 500мс
setInterval(updateUpgradeDisplay, 500);