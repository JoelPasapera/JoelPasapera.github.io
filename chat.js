// chat.js - VERSIÓN CORREGIDA CON PROTECCIÓN DE EVENTOS
document.addEventListener('DOMContentLoaded', function () {
    // Configuración
    const CONFIG = {
        API_BASE_URL: window.location.origin.includes('pythonanywhere')
            ? 'https://joelpasapera.pythonanywhere.com'
            : 'http://localhost:5000',
        CHAT_ENDPOINT: '/api/chat'
    };

    // Elementos del DOM
    const chatToggle = document.getElementById('chatToggle');
    const chatContainer = document.getElementById('chatContainer');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const chatSend = document.getElementById('chatSend');

    // Estado del chat
    let isChatOpen = false;
    let isProcessingMessage = false;

    // Inicializar chat
    function initChat() {
        console.log('💬 Inicializando chat widget...');

        // ✅ CORREGIDO: Event listeners con mejor manejo
        chatToggle.addEventListener('click', handleToggleChat);
        chatClose.addEventListener('click', handleCloseChat);

        // Botón de enviar
        chatSend.addEventListener('click', function (e) {
            console.log('🖱️ Click en botón enviar');
            e.preventDefault();
            e.stopImmediatePropagation(); // ✅ Detiene TODA la propagación
            sendMessage();
        });

        // Enter para enviar
        chatInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                console.log('⌨️ Enter presionado');
                e.preventDefault();
                e.stopImmediatePropagation(); // ✅ Detiene TODA la propagación
                sendMessage();
            }
        });

        // Ajustar altura del textarea
        chatInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // ✅ PREVENIR PROPAGACIÓN DE EVENTOS EN TODO EL CHAT
        chatContainer.addEventListener('click', function (e) {
            console.log('🛡️ Evento capturado en chat container');
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        // ✅ PREVENIR que clics en el input/texto cierren el chat
        chatInput.addEventListener('click', function (e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        chatMessages.addEventListener('click', function (e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
        });

        // ✅ PREVENIR cierre del chat al hacer clic en cualquier parte del widget
        const chatHeader = document.querySelector('.chat-header');
        if (chatHeader) {
            chatHeader.addEventListener('click', function (e) {
                e.stopPropagation();
                e.stopImmediatePropagation();
            });
        }

        // ✅ AGREGAR event listener al documento para cerrar solo con clics externos
        document.addEventListener('click', function (e) {
            // Solo cerrar si el clic NO fue en el chat y el chat está abierto
            if (isChatOpen && !chatContainer.contains(e.target) && !chatToggle.contains(e.target)) {
                console.log('📪 Clic externo - cerrando chat');
                closeChat();
            }
        });

        console.log('✅ Chat inicializado con protección de eventos');
    }

    // Manejar toggle del chat
    function handleToggleChat(e) {
        console.log('🔘 Toggle chat clickeado');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        toggleChat();
    }

    // Manejar cierre del chat
    function handleCloseChat(e) {
        console.log('❌ Botón cerrar clickeado');
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        closeChat();
    }

    // Alternar visibilidad del chat
    function toggleChat() {
        isChatOpen = !isChatOpen;
        if (isChatOpen) {
            chatContainer.classList.add('active');
            chatInput.focus();
            console.log('📱 Chat abierto');
        } else {
            chatContainer.classList.remove('active');
            console.log('📱 Chat cerrado');
        }
    }

    // Cerrar chat
    function closeChat() {
        isChatOpen = false;
        chatContainer.classList.remove('active');
        console.log('📱 Chat cerrado manualmente');
    }

    // Enviar mensaje al servidor
    async function sendMessage() {
        // ✅ Prevenir múltiples envíos simultáneos
        if (isProcessingMessage) {
            console.log('⏳ Mensaje en proceso, ignorando envío duplicado');
            return;
        }

        const message = chatInput.value.trim();

        if (!message) {
            console.log('⚠️ Mensaje vacío, ignorando');
            return;
        }

        console.log('📨 Iniciando envío de mensaje:', message);

        // Marcar como procesando
        isProcessingMessage = true;

        // Limpiar input
        chatInput.value = '';
        chatInput.style.height = 'auto';

        // Añadir mensaje del usuario al chat
        addMessageToChat('user', message);

        // Deshabilitar entrada temporalmente
        chatInput.disabled = true;
        chatSend.disabled = true;

        // Mostrar indicador de typing
        const typingIndicator = showTypingIndicator();

        try {
            console.log('🌐 Enviando petición al servidor...');

            const response = await fetch(`${CONFIG.API_BASE_URL}${CONFIG.CHAT_ENDPOINT}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: message,
                    timestamp: new Date().toISOString()
                })
            });

            console.log('✅ Respuesta HTTP recibida:', response.status);

            const data = await response.json();

            // Quitar indicador de typing
            typingIndicator.remove();

            if (data.success) {
                console.log('🤖 Respuesta del bot:', data.bot_response);

                // Añadir respuesta del bot al chat
                addMessageToChat('bot', data.bot_response);
            } else {
                console.error('❌ Error del servidor:', data.message);
                addMessageToChat('bot', '❌ Error: ' + (data.message || 'No se pudo procesar el mensaje'));
            }

        } catch (error) {
            console.error('❌ Error en el chat:', error);
            typingIndicator.remove();
            addMessageToChat('bot', '❌ Error de conexión. Por favor, intenta más tarde.');
        } finally {
            // Rehabilitar entrada
            chatInput.disabled = false;
            chatSend.disabled = false;
            chatInput.focus();
            isProcessingMessage = false;
            console.log('🔄 Chat listo para nuevo mensaje');
        }
    }

    // Añadir mensaje al chat
    function addMessageToChat(sender, text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const messageText = document.createElement('p');
        messageText.textContent = text;

        const messageTime = document.createElement('span');
        messageTime.className = 'message-time';
        messageTime.textContent = getCurrentTime();

        messageContent.appendChild(messageText);
        messageContent.appendChild(messageTime);

        // Avatar diferente para usuario y bot
        const messageAvatar = document.createElement('div');
        messageAvatar.className = 'message-avatar';

        if (sender === 'user') {
            messageAvatar.innerHTML = '<i class="fas fa-user"></i>';
            messageDiv.appendChild(messageContent);
            messageDiv.appendChild(messageAvatar);
        } else {
            messageAvatar.innerHTML = '<i class="fas fa-robot"></i>';
            messageDiv.appendChild(messageAvatar);
            messageDiv.appendChild(messageContent);
        }

        chatMessages.appendChild(messageDiv);

        // Scroll to bottom
        chatMessages.scrollTop = chatMessages.scrollHeight;

        console.log(`💬 Mensaje añadido al DOM: ${sender} - "${text.substring(0, 30)}..."`);
    }

    // Mostrar indicador de "escribiendo"
    function showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.innerHTML = '<i class="fas fa-robot"></i>';

        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';

        const typingText = document.createElement('p');
        typingText.innerHTML = 'Joel está escribiendo<span class="typing-dots"><span>.</span><span>.</span><span>.</span></span>';

        messageContent.appendChild(typingText);
        typingDiv.appendChild(avatar);
        typingDiv.appendChild(messageContent);

        chatMessages.appendChild(typingDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;

        console.log('⌨️ Mostrando indicador de typing...');
        return typingDiv;
    }

    // Obtener hora actual formateada
    function getCurrentTime() {
        const now = new Date();
        return now.getHours().toString().padStart(2, '0') + ':' +
            now.getMinutes().toString().padStart(2, '0');
    }

    // Inicializar cuando el DOM esté listo
    initChat();
});