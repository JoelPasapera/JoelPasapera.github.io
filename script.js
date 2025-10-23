// script.js - CORREGIDO para comunicación real
const CONFIG = {
    API_BASE_URL: window.location.origin.includes('pythonanywhere')
        ? 'https://joelpasapera.pythonanywhere.com'  // ✅ Para producción
        : 'http://localhost:5000',                   // ✅ Para desarrollo
    CONTACT_ENDPOINT: '/contact',
    TEST_ENDPOINT: '/api/test',
    STRATEGIES_ENDPOINT: '/api/strategies'
};

const API_URL = 'https://joelpasapera.pythonanywhere.com';

// ===== FUNCIONALIDADES GENERALES =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando página...');
    console.log('🌐 URL Base:', API_URL); // CONFIG.API_BASE_URL

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

    // ✅ CORREGIDO: Formulario de contacto con evento 'submit' (no 'button')
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();

            // Obtener datos del formulario
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            console.log('📨 Enviando datos de contacto:', formData);

            // Validar formulario
            if (validateForm(formData)) {
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;

                try {
                    // ✅ ENVÍO REAL AL SERVIDOR
                    const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.CONTACT_ENDPOINT}`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(formData)
                    });

                    const data = await response.json();

                    if (data.success) {
                        showNotification(data.message, 'success');
                        console.log('✅ Respuesta del servidor:', data);
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

    // Inicializar estilos
    addAnimationStyles();
});

// ===== COMUNICACIÓN CON EL SERVIDOR =====

// 1. Probar conexión con el servidor
async function testServerConnection() {
    try {
        console.log('🔗 Probando conexión con el servidor...');
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.TEST_ENDPOINT}`);
        const data = await response.json();

        if (data.success) {
            console.log('✅ Servidor conectado:', data.message);
            showNotification('✅ Conexión con servidor establecida', 'success');
        }
    } catch (error) {
        console.error('❌ Error conectando al servidor:', error);
        // showNotification('⚠️ Modo offline - Algunas funciones no están disponibles', 'error');  
    }
}

// 2. Cargar estrategias desde el servidor
async function loadStrategiesFromServer() {
    try {
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.STRATEGIES_ENDPOINT}`);
        const data = await response.json();

        if (data.success) {
            console.log('📊 Estrategias cargadas:', data.strategies);
            return data.strategies;
        }
    } catch (error) {
        console.error('❌ Error cargando estrategias:', error);
        // Retornar datos locales como fallback
        return loadStrategyData();
    }
}

// ===== FUNCIONES AUXILIARES =====

// Validación del formulario
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

// Validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Sistema de notificaciones
function showNotification(message, type) {
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

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.remove();
        }
    }, 5000);
}

// Función existente para datos locales (fallback)
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
        }
    ];
}

// Añadir estilos de animación
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0; }
            to { transform: translateX(0); opacity: 1; }
        }
        .notification { animation: slideInRight 0.3s ease; }
    `;
    document.head.appendChild(style);

}
