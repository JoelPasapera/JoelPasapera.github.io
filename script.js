// script.js - Trading Algorítmico Joel Pasapera

// ===== CONFIGURACIÓN =====
const CONFIG = {
    API_BASE_URL: window.location.origin, // Usa el mismo dominio
    CONTACT_ENDPOINT: '/contact'
};

// ===== FUNCIONALIDADES GENERALES =====

// Menú hamburguesa para dispositivos móviles
document.addEventListener('DOMContentLoaded', function () {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');

    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Cerrar menú al hacer clic en un enlace
        document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        }));
    }

    // Scroll suave para enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });

    // Cambiar estilo de navbar al hacer scroll
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

    // Inicializar animaciones de barras de habilidades
    const skillLevels = document.querySelectorAll('.skill-level');
    skillLevels.forEach(skill => {
        const width = skill.style.width;
        skill.style.width = '0';
        setTimeout(() => {
            skill.style.width = width;
        }, 500);
    });

    // Observador de intersección para animaciones
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
            }
        });
    }, observerOptions);

    // Observar elementos para animación
    document.querySelectorAll('.course-card, .strategy-card, .resource-card').forEach(el => {
        el.classList.add('animate-on-scroll');
        observer.observe(el);
    });

    // Añadir estilos para animaciones
    addAnimationStyles();
});

// ===== FORMULARIO DE CONTACTO =====

document.addEventListener('DOMContentLoaded', function () {
    const contactForm = document.getElementById('contactForm');

    if (contactForm) {
        contactForm.addEventListener('submit', function (e) {
            e.preventDefault();

            // Obtener datos del formulario
            const formData = {
                name: document.getElementById('name').value,
                email: document.getElementById('email').value,
                subject: document.getElementById('subject').value,
                message: document.getElementById('message').value
            };

            // Validar formulario
            if (validateForm(formData)) {
                // Mostrar indicador de carga
                const submitBtn = this.querySelector('button[type="submit"]');
                const originalText = submitBtn.textContent;
                submitBtn.textContent = 'Enviando...';
                submitBtn.disabled = true;

                // Enviar datos al servidor
                sendContactForm(formData)
                    .then(data => {
                        if (data.success) {
                            showNotification('Mensaje enviado correctamente. Te contactaremos pronto.', 'success');
                            contactForm.reset();
                        } else {
                            showNotification(data.message || 'Error al enviar el mensaje', 'error');
                        }
                    })
                    .catch(error => {
                        console.error('Error:', error);
                        showNotification('Error de conexión. Por favor, intenta más tarde.', 'error');
                    })
                    .finally(() => {
                        // Restaurar botón
                        submitBtn.textContent = originalText;
                        submitBtn.disabled = false;
                    });
            }
        });
    }
});

// Función para enviar formulario de contacto
async function sendContactForm(formData) {
    const response = await fetch(CONFIG.CONTACT_ENDPOINT, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
    });

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
}

// Validación del formulario
function validateForm(formData) {
    const { name, email, subject, message } = formData;

    if (!name.trim()) {
        showNotification('Por favor ingresa tu nombre', 'error');
        return false;
    }

    if (!email.trim()) {
        showNotification('Por favor ingresa tu email', 'error');
        return false;
    }

    if (!isValidEmail(email)) {
        showNotification('Por favor ingresa un email válido', 'error');
        return false;
    }

    if (!subject.trim()) {
        showNotification('Por favor ingresa un asunto', 'error');
        return false;
    }

    if (!message.trim()) {
        showNotification('Por favor ingresa tu mensaje', 'error');
        return false;
    }

    return true;
}

// Validar formato de email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Mostrar notificaciones
function showNotification(message, type) {
    // Crear elemento de notificación
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;

    // Estilos para la notificación
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
        transform: translateX(0);
    `;

    if (type === 'success') {
        notification.style.backgroundColor = '#10b981';
    } else if (type === 'error') {
        notification.style.backgroundColor = '#ef4444';
    }

    // Botón para cerrar
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
        notification.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    });

    // Auto-eliminar después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);

    document.body.appendChild(notification);
}

// ===== FUNCIONALIDADES ADICIONALES =====

// Cargar datos de estrategias (simulación)
function loadStrategyData() {
    const strategies = [
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
        },
        {
            id: 3,
            name: 'EURUSD Mean Reversion',
            profit: '+12% anual',
            winRate: '58%',
            profitFactor: '1.5',
            rrRatio: '1.8',
            description: 'Sistema de reversión a la media con bandas de Bollinger y RSI en temporalidad horaria.'
        }
    ];

    return strategies;
}

// Añadir estilos de animación
function addAnimationStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
        
        @keyframes slideOutRight {
            from {
                transform: translateX(0);
                opacity: 1;
            }
            to {
                transform: translateX(100%);
                opacity: 0;
            }
        }
        
        .animate-on-scroll {
            opacity: 0;
            transform: translateY(30px);
            transition: opacity 0.6s ease, transform 0.6s ease;
        }
        
        .animate-on-scroll.animate-in {
            opacity: 1;
            transform: translateY(0);
        }
        
        .hamburger.active .bar:nth-child(1) {
            transform: rotate(-45deg) translate(-5px, 6px);
        }
        
        .hamburger.active .bar:nth-child(2) {
            opacity: 0;
        }
        
        .hamburger.active .bar:nth-child(3) {
            transform: rotate(45deg) translate(-5px, -6px);
        }
        
        .skill-level {
            transition: width 1.5s ease-in-out;
        }
        
        @media (max-width: 768px) {
            .notification {
                right: 10px;
                left: 10px;
                min-width: auto;
            }
        }
    `;
    document.head.appendChild(style);
}

// Prevenir envío de formularios vacíos en enlaces "#"
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('a[href="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            showNotification('Esta funcionalidad estará disponible pronto', 'success');
        });
    });
});