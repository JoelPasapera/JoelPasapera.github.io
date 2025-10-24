// script.js - VERSIÓN DEFINITIVA (SIEMPRE PRODUCCIÓN)
const CONFIG = {
    API_BASE_URL: 'https://joelpasapera.pythonanywhere.com',  // ✅ SIEMPRE producción
    CONTACT_ENDPOINT: '/contact',
    TEST_ENDPOINT: '/api/test',
    STRATEGIES_ENDPOINT: '/api/strategies',
    CHAT_ENDPOINT: '/api/chat'
};

console.log('🚀 Script.js CARgado - Versión PRODUCCIÓN');
console.log('🌐 URL Base:', CONFIG.API_BASE_URL);

// ===== FUNCIONALIDADES GENERALES =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando página...');
    console.log('🌐 URL Base configurada:', CONFIG.API_BASE_URL);

    // Probar conexión con el servidor al cargar
    testServerConnection();

    // Menú hamburguesa
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // Scroll suave
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });

    // Navbar scroll
    window.addEventListener('scroll', () => {
        const navbar = document.querySelector('.navbar');
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.1)';
            }
        }
    });

    // Animaciones de habilidades
    const skillLevels = document.querySelectorAll('.skill-level');
    skillLevels.forEach(skill => {
        const width = skill.style.width;
        skill.style.width = '0';
        setTimeout(() => {
            skill.style.width = width;
        }, 500);
    });

    // FORMULARIO DE CONTACTO
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            console.log('📨 Enviando datos de contacto:', formData);
            console.log('🔗 URL de envío:', `${CONFIG.API_BASE_URL}${CONFIG.CONTACT_ENDPOINT}`);

            if (validateForm(formData)) {
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;

                try {
                    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.CONTACT_ENDPOINT}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        mode: 'cors',
                        body: JSON.stringify(formData)
                    });

                    console.log('📨 Respuesta del servidor (status):', response.status);
                    
                    const data = await response.json();
                    console.log('📨 Respuesta del servidor (data):', data);

                    if (data.success) {
                        showNotification(data.message, 'success');
                        contactForm.reset();
                    } else {
                        showNotification(data.message || '❌ Error al enviar el mensaje', 'error');
                    }
                } catch (error) {
                    console.error('❌ Error de conexión:', error);
                    showNotification('❌ Error de conexión. Por favor, intenta más tarde.', 'error');
                } finally {
                    submitBtn.textContent = originalText;
                    submitBtn.disabled = false;
                }
            }
        });
    }

    // Cargar estrategias al iniciar
    loadAndDisplayStrategies();

    // Inicializar estilos
    addAnimationStyles();
});

// ===== COMUNICACIÓN CON EL SERVIDOR =====

// 1. Probar conexión con el servidor - CORREGIDO
async function testServerConnection() {
    try {
        console.log('🔗 Probando conexión con el servidor...');
        console.log('🔗 URL de prueba:', `${CONFIG.API_BASE_URL}${CONFIG.TEST_ENDPOINT}`);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.TEST_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors'
        });
        
        console.log('📡 Estado de la respuesta:', response.status);
        const data = await response.json();

        if (data.success) {
            console.log('✅ Servidor conectado:', data.message);
            // showNotification('✅ Conexión con servidor establecida', 'success');
        } else {
            console.error('❌ Servidor respondió con error:', data);
            showNotification('❌ Error en la respuesta del servidor', 'error');
        }
    } catch (error) {
        console.error('❌ Error conectando al servidor:', error);
        showNotification('❌ No se pudo conectar al servidor. Verifica tu conexión.', 'error');
    }
}

// 2. Cargar estrategias desde el servidor
async function loadAndDisplayStrategies() {
    try {
        console.log('🔗 Cargando estrategias desde:', `${CONFIG.API_BASE_URL}${CONFIG.STRATEGIES_ENDPOINT}`);
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.STRATEGIES_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors'
        });
        
        const data = await response.json();

        if (data.success) {
            console.log('📊 Estrategias cargadas:', data.strategies);
            displayStrategies(data.strategies);
        }
    } catch (error) {
        console.error('❌ Error cargando estrategias:', error);
        // Fallback a datos locales
        const localStrategies = loadStrategyData();
        displayStrategies(localStrategies);
    }
}

// 3. Mostrar estrategias en la página
function displayStrategies(strategies) {
    const strategiesContainer = document.getElementById('strategies-container');
    if (!strategiesContainer) return;

    strategiesContainer.innerHTML = strategies.map(strategy => `
        <div class="strategy-card">
            <h3>${strategy.name}</h3>
            <div class="strategy-stats">
                <div class="stat">
                    <span class="stat-label">Profit:</span>
                    <span class="stat-value profit">${strategy.profit}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Win Rate:</span>
                    <span class="stat-value">${strategy.winRate}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">Profit Factor:</span>
                    <span class="stat-value">${strategy.profitFactor}</span>
                </div>
                <div class="stat">
                    <span class="stat-label">R/R Ratio:</span>
                    <span class="stat-value">${strategy.rrRatio}</span>
                </div>
            </div>
            <p class="strategy-description">${strategy.description}</p>
        </div>
    `).join('');
}

// ===== FUNCIONES AUXILIARES =====

function validateForm(formData) {
    const { name, email, subject, message } = formData;

    if (!name.trim()) {
        showNotification('❌ Por favor ingresa tu nombre', 'error');
        return false;
    }

    if (!email.trim()) {
        showNotification('❌ Por favor ingresa tu email', 'error');
        return false;
    }

    if (!isValidEmail(email)) {
        showNotification('❌ Por favor ingresa un email válido', 'error');
        return false;
    }

    if (!subject.trim()) {
        showNotification('❌ Por favor ingresa un asunto', 'error');
        return false;
    }

    if (!message.trim()) {
        showNotification('❌ Por favor ingresa tu mensaje', 'error');
        return false;
    }

    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function showNotification(message, type) {
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 5px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        display: flex;
        align-items: center;
        justify-content: space-between;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        animation: slideInRight 0.3s ease;
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    }

    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 20px;
        cursor: pointer;
        margin-left: 15px;
    `;

    closeBtn.addEventListener('click', () => {
        notification.remove();
    });

    document.body.appendChild(notification);

    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

function loadStrategyData() {
    return [
        {
            id: 1,
            name: 'XAUUSD Scalping',
            profit: '+15% anual',
            winRate: '72%',
            profitFactor: '1.8',
            rrRatio: '2.1',
            description: 'Estrategia de scalping en oro basada en patrones de velas en temporalidad de 5 minutos.'
        },
        {
            id: 2,
            name: 'WTI Breakout',
            profit: '+22% anual',
            winRate: '65%',
            profitFactor: '2.1',
            rrRatio: '2.8',
            description: 'Estrategia de ruptura en petróleo con confirmación de volumen y análisis de sesiones.'
        }
    ];
}

function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification { animation: slideInRight 0.3s ease; }
        
        .strategy-card {
            background: white;
            border-radius: 10px;
            padding: 20px;
            margin: 15px 0;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            border-left: 4px solid #3b82f6;
        }
        
        .strategy-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
            gap: 15px;
            margin: 15px 0;
        }
        
        .stat {
            text-align: center;
            padding: 10px;
            background: #f8fafc;
            border-radius: 8px;
        }
        
        .stat-label {
            display: block;
            font-size: 0.8rem;
            color: #64748b;
            margin-bottom: 5px;
        }
        
        .stat-value {
            display: block;
            font-size: 1.1rem;
            font-weight: bold;
            color: #1e293b;
        }
        
        .stat-value.profit {
            color: #10b981;
        }
    `;
    document.head.appendChild(style);
}


// ===== OPTIMIZACIONES PARA MÓVILES =====

// Detectar dispositivo móvil
function isMobileDevice() {
    return (typeof window.orientation !== "undefined") || (navigator.userAgent.indexOf('IEMobile') !== -1);
}

// Optimizar para touch
function optimizeForTouch() {
    // Aumentar área de click para elementos táctiles
    const touchElements = document.querySelectorAll('.btn, .nav-link, .course-card, .strategy-card');
    touchElements.forEach(element => {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
        element.style.display = 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
    });
}

// Prevenir zoom en inputs (complementario al CSS)
function preventZoomOnInput() {
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.addEventListener('focus', function() {
            // Forzar tamaño de fuente de 16px para prevenir zoom en iOS
            this.style.fontSize = '16px';
        });
        
        input.addEventListener('blur', function() {
            // Restaurar tamaño original si es necesario
            if (window.innerWidth <= 768) {
                this.style.fontSize = '16px';
            } else {
                this.style.fontSize = '';
            }
        });
    });
}

// Optimizar scroll suave para móviles
function optimizeSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Scroll más rápido en móviles
                const scrollOptions = {
                    behavior: 'smooth',
                    block: 'start'
                };
                
                if (isMobileDevice()) {
                    // En móviles, usar scroll instantáneo o muy rápido
                    target.scrollIntoView({ behavior: 'auto', block: 'start' });
                } else {
                    target.scrollIntoView(scrollOptions);
                }
            }
        });
    });
}

// Inicializar optimizaciones móviles
document.addEventListener('DOMContentLoaded', function() {
    if (isMobileDevice()) {
        console.log('📱 Dispositivo móvil detectado - aplicando optimizaciones');
        optimizeForTouch();
        preventZoomOnInput();
        optimizeSmoothScroll();
        
        // Agregar clase CSS para móviles
        document.body.classList.add('mobile-device');
    }
});
