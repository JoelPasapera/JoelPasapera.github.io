// script.js - VERSIÓN MEJORADA Y PROFESIONAL
const CONFIG = {
    API_BASE_URL: 'https://joelpasapera.pythonanywhere.com',
    CONTACT_ENDPOINT: '/contact',
    TEST_ENDPOINT: '/api/test',
    STRATEGIES_ENDPOINT: '/api/strategies',
    CHAT_ENDPOINT: '/api/chat'
};

console.log('🚀 Script.js Profesional cargado');
console.log('🌐 URL Base:', CONFIG.API_BASE_URL);

// ===== INICIALIZACIÓN PRINCIPAL =====
document.addEventListener('DOMContentLoaded', function () {
    console.log('🚀 Inicializando aplicación profesional...');
    
    // Inicializar todas las funcionalidades
    initNavigation();
    initScrollEffects();
    initAnimations();
    initCounters();
    initFormHandling();
    initSkillBars();
    
    // Cargar datos dinámicos
    testServerConnection();
    loadAndDisplayStrategies();
    
    // Optimizaciones
    if (isMobileDevice()) {
        initMobileOptimizations();
    }
    
    console.log('✅ Aplicación inicializada correctamente');
});

// ===== NAVEGACIÓN =====
function initNavigation() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const navLinks = document.querySelectorAll('.nav-link');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
    
    // Smooth scroll para todos los enlaces internos
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                const offsetTop = target.offsetTop - 80;
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    console.log('✅ Navegación inicializada');
}

// ===== EFECTOS DE SCROLL =====
function initScrollEffects() {
    const navbar = document.querySelector('.navbar');
    
    window.addEventListener('scroll', () => {
        // Navbar background on scroll
        if (navbar) {
            if (window.scrollY > 50) {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.98)';
                navbar.style.boxShadow = '0 4px 20px rgba(0, 0, 0, 0.1)';
            } else {
                navbar.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
                navbar.style.boxShadow = '0 2px 10px rgba(0, 0, 0, 0.05)';
            }
        }
        
        // Animaciones de elementos al hacer scroll
        animateOnScroll();
    });
    
    // Trigger inicial
    animateOnScroll();
    
    console.log('✅ Efectos de scroll inicializados');
}

// ===== ANIMACIONES =====
function initAnimations() {
    // Observer para animar elementos cuando entran en viewport
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -100px 0px'
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animated');
                
                // Si es una tarjeta, agregar delay incremental
                const cards = entry.target.parentElement?.querySelectorAll('.bot-card, .script-card, .course-card, .strategy-card, .testimonial-card, .resource-card');
                if (cards) {
                    cards.forEach((card, index) => {
                        setTimeout(() => {
                            card.style.animation = 'fadeInUp 0.6s ease-out forwards';
                        }, index * 100);
                    });
                }
            }
        });
    }, observerOptions);
    
    // Observar todos los elementos que queremos animar
    const elementsToAnimate = document.querySelectorAll(`
        .bot-card, .script-card, .course-card, .strategy-card,
        .testimonial-card, .resource-card, .stat-card,
        .expertise-block, .benefit-item
    `);
    
    elementsToAnimate.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        observer.observe(el);
    });
    
    console.log('✅ Animaciones inicializadas');
}

function animateOnScroll() {
    const elements = document.querySelectorAll('.animated');
    
    elements.forEach(element => {
        const elementTop = element.getBoundingClientRect().top;
        const elementBottom = element.getBoundingClientRect().bottom;
        const isVisible = elementTop < window.innerHeight && elementBottom > 0;
        
        if (isVisible) {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
            element.style.transition = 'all 0.6s ease-out';
        }
    });
}

// ===== CONTADORES ANIMADOS =====
function initCounters() {
    const counters = document.querySelectorAll('.stat-number[data-target]');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const counter = entry.target;
                const target = +counter.getAttribute('data-target');
                const duration = 2000; // 2 segundos
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    
                    if (current < target) {
                        counter.textContent = Math.floor(current).toLocaleString();
                        requestAnimationFrame(updateCounter);
                    } else {
                        counter.textContent = target.toLocaleString();
                    }
                };
                
                updateCounter();
                observer.unobserve(counter);
            }
        });
    }, observerOptions);
    
    counters.forEach(counter => observer.observe(counter));
    
    console.log('✅ Contadores inicializados');
}

// ===== BARRAS DE HABILIDADES =====
function initSkillBars() {
    const skillBars = document.querySelectorAll('.skill-level');
    
    const observerOptions = {
        threshold: 0.5
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const bar = entry.target;
                const width = bar.style.width;
                bar.style.width = '0';
                
                setTimeout(() => {
                    bar.style.transition = 'width 1.5s ease-out';
                    bar.style.width = width;
                }, 200);
                
                observer.unobserve(bar);
            }
        });
    }, observerOptions);
    
    skillBars.forEach(bar => observer.observe(bar));
    
    console.log('✅ Barras de habilidades inicializadas');
}

// ===== MANEJO DE FORMULARIOS =====
function initFormHandling() {
    const contactForm = document.getElementById('contactForm');
    
    if (contactForm) {
        contactForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            
            const formData = {
                name: document.getElementById('name').value.trim(),
                email: document.getElementById('email').value.trim(),
                subject: document.getElementById('subject').value.trim(),
                message: document.getElementById('message').value.trim()
            };
            
            console.log('📨 Enviando formulario:', formData);
            
            if (!validateForm(formData)) {
                return;
            }
            
            const submitBtn = this.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Enviando...';
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
                
                console.log('📨 Respuesta recibida:', response.status);
                
                const data = await response.json();
                
                if (data.success) {
                    showNotification('✅ ' + data.message, 'success');
                    contactForm.reset();
                } else {
                    showNotification('❌ ' + (data.message || 'Error al enviar el mensaje'), 'error');
                }
            } catch (error) {
                console.error('❌ Error:', error);
                showNotification('❌ Error de conexión. Por favor, intenta más tarde.', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    console.log('✅ Manejo de formularios inicializado');
}

// ===== VALIDACIÓN DE FORMULARIO =====
function validateForm(formData) {
    const { name, email, subject, message } = formData;
    
    if (!name) {
        showNotification('❌ Por favor ingresa tu nombre', 'error');
        return false;
    }
    
    if (!email) {
        showNotification('❌ Por favor ingresa tu email', 'error');
        return false;
    }
    
    if (!isValidEmail(email)) {
        showNotification('❌ Por favor ingresa un email válido', 'error');
        return false;
    }
    
    if (!subject) {
        showNotification('❌ Por favor ingresa un asunto', 'error');
        return false;
    }
    
    if (!message) {
        showNotification('❌ Por favor ingresa tu mensaje', 'error');
        return false;
    }
    
    if (message.length < 10) {
        showNotification('❌ El mensaje debe tener al menos 10 caracteres', 'error');
        return false;
    }
    
    return true;
}

function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// ===== NOTIFICACIONES =====
function showNotification(message, type) {
    // Remover notificaciones existentes
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    
    notification.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
        <button class="notification-close">&times;</button>
    `;
    
    // Estilos
    const bgColor = type === 'success' ? '#10b981' : '#ef4444';
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        padding: 16px 24px;
        border-radius: 12px;
        background: ${bgColor};
        color: white;
        font-weight: 600;
        z-index: 10000;
        display: flex;
        align-items: center;
        gap: 12px;
        min-width: 300px;
        max-width: 500px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        animation: slideInRight 0.3s ease-out;
    `;
    
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.style.cssText = `
        background: none;
        border: none;
        color: white;
        font-size: 24px;
        cursor: pointer;
        margin-left: auto;
        padding: 0;
        width: 24px;
        height: 24px;
        display: flex;
        align-items: center;
        justify-content: center;
        opacity: 0.8;
        transition: opacity 0.2s ease;
    `;
    
    closeBtn.addEventListener('mouseenter', () => closeBtn.style.opacity = '1');
    closeBtn.addEventListener('mouseleave', () => closeBtn.style.opacity = '0.8');
    closeBtn.addEventListener('click', () => notification.remove());
    
    document.body.appendChild(notification);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
}

// ===== COMUNICACIÓN CON SERVIDOR =====
async function testServerConnection() {
    try {
        console.log('🔗 Probando conexión con servidor...');
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.TEST_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors'
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Servidor conectado:', data.message);
        } else {
            console.warn('⚠️ Servidor respondió con error:', data);
        }
    } catch (error) {
        console.warn('⚠️ No se pudo conectar al servidor:', error.message);
        // No mostrar notificación para no molestar al usuario en la carga inicial
    }
}

async function loadAndDisplayStrategies() {
    try {
        console.log('🔗 Cargando estrategias...');
        
        const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.STRATEGIES_ENDPOINT}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
            mode: 'cors',
            signal: AbortSignal.timeout(5000) // Timeout de 5 segundos
        });
        
        const data = await response.json();
        
        if (data.success && data.strategies) {
            console.log('📊 Estrategias cargadas:', data.strategies.length);
            displayStrategies(data.strategies);
        } else {
            console.log('📊 Usando estrategias locales');
            displayStrategies(getLocalStrategies());
        }
    } catch (error) {
        console.log('📊 Usando estrategias locales (fallback)');
        displayStrategies(getLocalStrategies());
    }
}

function displayStrategies(strategies) {
    const container = document.getElementById('strategies-container');
    if (!container) return;
    
    // Mantener las estrategias existentes en el HTML si no hay datos del servidor
    if (strategies.length === 0) return;
    
    container.innerHTML = strategies.map(strategy => `
        <div class="strategy-card">
            <div class="strategy-header">
                <h3>
                    <i class="fas ${strategy.icon || 'fa-chart-line'}"></i>
                    ${strategy.name}
                </h3>
                <span class="strategy-badge">${strategy.status || 'Activa'}</span>
            </div>
            <p class="strategy-description">${strategy.description}</p>
            <div class="strategy-metrics">
                <div class="metric">
                    <span class="metric-label">Profit Anual</span>
                    <span class="metric-value profit">${strategy.profit}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Win Rate</span>
                    <span class="metric-value">${strategy.winRate}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Profit Factor</span>
                    <span class="metric-value">${strategy.profitFactor}</span>
                </div>
                <div class="metric">
                    <span class="metric-label">Max Drawdown</span>
                    <span class="metric-value">${strategy.maxDrawdown}</span>
                </div>
            </div>
            <div class="strategy-tags">
                ${strategy.tags?.map(tag => `<span class="tag">${tag}</span>`).join('') || ''}
            </div>
        </div>
    `).join('');
    
    console.log('✅ Estrategias mostradas');
}

function getLocalStrategies() {
    return [
        {
            name: 'XAUUSD Scalping Strategy',
            icon: 'fa-coins',
            description: 'Estrategia de scalping en oro optimizada para temporalidad de 5 minutos. Utiliza patrones de velas japonesas y análisis de volatilidad.',
            profit: '+18.5%',
            winRate: '78%',
            profitFactor: '2.4',
            maxDrawdown: '-8.2%',
            status: 'Activa',
            tags: ['<i class="fas fa-clock"></i> M5', '<i class="fas fa-chart-line"></i> Scalping', '<i class="fas fa-coins"></i> XAUUSD']
        },
        {
            name: 'WTI Breakout Strategy',
            icon: 'fa-oil-can',
            description: 'Estrategia de ruptura en petróleo WTI con confirmación de volumen y análisis de sesiones de trading para maximizar rendimiento.',
            profit: '+24.8%',
            winRate: '72%',
            profitFactor: '2.1',
            maxDrawdown: '-12.5%',
            status: 'Activa',
            tags: ['<i class="fas fa-clock"></i> H1', '<i class="fas fa-rocket"></i> Breakout', '<i class="fas fa-oil-can"></i> WTI']
        }
    ];
}

// ===== OPTIMIZACIONES MÓVILES =====
function isMobileDevice() {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
           (typeof window.orientation !== "undefined") ||
           (navigator.userAgent.indexOf('IEMobile') !== -1);
}

function initMobileOptimizations() {
    console.log('📱 Aplicando optimizaciones móviles');
    
    // Prevenir zoom en inputs
    const inputs = document.querySelectorAll('input, textarea, select');
    inputs.forEach(input => {
        input.style.fontSize = '16px'; // Previene zoom en iOS
    });
    
    // Agregar clase al body
    document.body.classList.add('mobile-device');
    
    // Optimizar smooth scroll para móviles
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                // Scroll instantáneo en móviles para mejor performance
                target.scrollIntoView({ behavior: 'auto', block: 'start' });
            }
        });
    });
    
    // Optimizar áreas táctiles
    const touchElements = document.querySelectorAll('.btn, .nav-link, .bot-card, .script-card');
    touchElements.forEach(element => {
        element.style.minHeight = '44px';
        element.style.minWidth = '44px';
    });
    
    console.log('✅ Optimizaciones móviles aplicadas');
}

// ===== ESTILOS DINÁMICOS =====
function addDynamicStyles() {
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
        
        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }
        
        /* Efecto hover suave para tarjetas */
        .bot-card, .script-card, .course-card, .strategy-card,
        .testimonial-card, .resource-card {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }
        
        /* Scroll suave en toda la página */
        html {
            scroll-behavior: smooth;
        }
        
        /* Loading state para botones */
        button:disabled {
            opacity: 0.7;
            cursor: not-allowed;
        }
        
        /* Mejoras de accesibilidad */
        *:focus-visible {
            outline: 2px solid #3b82f6;
            outline-offset: 2px;
        }
        
        /* Responsive images */
        img {
            max-width: 100%;
            height: auto;
        }
    `;
    document.head.appendChild(style);
}

// Agregar estilos dinámicos al cargar
addDynamicStyles();

// ===== UTILIDADES =====

// Debounce para eventos que se disparan frecuentemente
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle para scroll events
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    };
}

// Lazy loading de imágenes (si se agregan más adelante)
function lazyLoadImages() {
    const images = document.querySelectorAll('img[data-src]');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => imageObserver.observe(img));
}

// Copiar texto al portapapeles
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text);
    } else {
        // Fallback para navegadores antiguos
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            textArea.remove();
            return Promise.resolve();
        } catch (error) {
            textArea.remove();
            return Promise.reject(error);
        }
    }
}

// ===== EASTER EGGS Y DETALLES PROFESIONALES =====

// Mensaje de bienvenida en consola
console.log('%c👨‍💻 Joel Pasapera - Trading Algorítmico', 'color: #3b82f6; font-size: 20px; font-weight: bold;');
console.log('%c🚀 Bienvenido a mi sitio web profesional', 'color: #10b981; font-size: 14px;');
console.log('%c💼 ¿Interesado en trabajar juntos? Contáctame en: https://www.linkedin.com/in/joel-pasapera-pinto-69089b23a/', 'color: #64748b; font-size: 12px;');

// Detectar modo oscuro del sistema
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
    console.log('🌙 Modo oscuro detectado');
    // Aquí se podría implementar un tema oscuro si se desea
}

// Performance monitoring (solo en desarrollo)
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    window.addEventListener('load', () => {
        setTimeout(() => {
            const perfData = window.performance.timing;
            const loadTime = perfData.loadEventEnd - perfData.navigationStart;
            console.log(`⚡ Tiempo de carga: ${loadTime}ms`);
        }, 0);
    });
}

// Exportar funciones útiles para uso global
window.tradingAlgo = {
    showNotification,
    copyToClipboard,
    testServerConnection
};

console.log('✅ Script profesional completamente cargado');
