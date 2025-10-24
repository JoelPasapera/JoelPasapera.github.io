// chatbot.js - VERSIÓN CORREGIDA DEL CHAT
(function () {
    'use strict';

    console.log('🚀 Iniciando chat funcional...');

    // Estado global
    let isChatOpen = false;
    let isProcessingMessage = false;

    // ✅ CONFIGURACIÓN SIMPLIFICADA
    const CONFIG = {
        API_BASE_URL: 'https://joelpasapera.pythonanywhere.com',
        CHAT_ENDPOINT: '/api/chat'
    };

    console.log('🌐 URL Base del Chat:', CONFIG.API_BASE_URL);

    // Esperar a que la página esté completamente cargada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFunctionalChat, false);
    } else {
        initializeFunctionalChat();
    }

    function initializeFunctionalChat() {
        // Obtener elementos
        const chatToggle = document.getElementById('chatToggle');
        const chatContainer = document.getElementById('chatContainer');
        const chatClose = document.getElementById('chatClose');
        const chatMessages = document.getElementById('chatMessages');
        const chatSend = document.getElementById('chatSend');
        const chatInput = document.getElementById('chatInput');

        if (!chatToggle || !chatContainer || !chatSend || !chatInput) {
            console.error('❌ Elementos del chat no encontrados');
            return;
        }

        console.log('✅ Todos los elementos del chat encontrados');

        // Mostrar mensaje de bienvenida al abrir el chat
        function showWelcomeMessage() {
            // El mensaje de bienvenida ya está en el HTML, así que no necesitamos agregarlo
            console.log('💬 Chat iniciado - Mensaje de bienvenida mostrado');
        }
        
        // ✅ FUNCIÓN SIMPLIFICADA PARA ABRIR/CERRAR CHAT
        function toggleChat() {
            isChatOpen = !isChatOpen;
            if (isChatOpen) {
                chatContainer.classList.add('active');
                chatInput.focus();
                console.log('📱 Chat abierto');
                // Enfocar en el input después de una pequeña demora para asegurar la transición
                setTimeout(() => {
                    chatInput.focus();
                }, 300);
                
            } else {
                chatContainer.classList.remove('active');
                console.log('📱 Chat cerrado');
            }
        }

        function closeChat() {
            isChatOpen = false;
            chatContainer.classList.remove('active');
            console.log('📱 Chat cerrado manualmente');
        }

        // ✅ CONFIGURAR EVENT LISTENERS SIMPLIFICADOS
        function setupEventListeners() {
            console.log('🔧 Configurando event listeners del chat...');

            // Evento para abrir/cerrar chat
            chatToggle.addEventListener('click', function (e) {
                console.log('🔘 Click en toggle del chat');
                e.preventDefault();
                e.stopPropagation();
                toggleChat();
            });

            // Evento para cerrar chat
            if (chatClose) {
                chatClose.addEventListener('click', function (e) {
                    console.log('❌ Click en cerrar chat');
                    e.preventDefault();
                    e.stopPropagation();
                    closeChat();
                });
            }

            // Evento para enviar mensaje con botón
            chatSend.addEventListener('click', function (e) {
                console.log('🖱️ Botón enviar clickeado');
                e.preventDefault();
                handleSendMessage();
            });

            // Evento para enviar mensaje con Enter
            chatInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('⌨️ Enter presionado');
                    e.preventDefault();
                    handleSendMessage();
                }
            });

            // Ajustar altura del textarea automáticamente
            chatInput.addEventListener('input', function () {
                this.style.height = 'auto';
                this.style.height = (this.scrollHeight) + 'px';
            });

            // Cerrar chat al hacer clic fuera
            document.addEventListener('click', function (e) {
                if (isChatOpen &&
                    !chatContainer.contains(e.target) &&
                    e.target !== chatToggle &&
                    !chatToggle.contains(e.target)) {
                    console.log('📪 Clic fuera del chat - cerrando');
                    closeChat();
                }
            });

            console.log('✅ Event listeners del chat configurados correctamente');
        }

        // ✅ FUNCIÓN PRINCIPAL DE ENVÍO - SIMPLIFICADA
        async function handleSendMessage() {
            if (isProcessingMessage) {
                console.log('⏳ Mensaje en proceso, ignorando...');
                return;
            }

            const message = chatInput.value.trim();
            if (!message) {
                console.log('⚠️ Mensaje vacío');
                return;
            }

            console.log('📨 Enviando mensaje:', message);
            isProcessingMessage = true;

            // Limpiar y deshabilitar controles
            chatInput.value = '';
            chatInput.style.height = 'auto';
            chatSend.disabled = true;
            chatInput.disabled = true;

            // Mostrar mensaje del usuario inmediatamente
            addMessage('user', message);

            // Mostrar indicador de typing
            const typingIndicator = showTypingIndicator();

            try {
                console.log('🔗 URL de envío:', `${CONFIG.API_BASE_URL}${CONFIG.CHAT_ENDPOINT}`);
                
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
                
                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
                }

                const data = await response.json();
                console.log('🤖 Respuesta del servidor:', data);

                // Quitar indicador de typing
                if (typingIndicator && typingIndicator.remove) {
                    typingIndicator.remove();
                }

                if (data.success) {
                    console.log('🤖 Respuesta del bot:', data.bot_response);
                    addMessage('bot', data.bot_response);
                } else {
                    console.error('❌ Error del servidor:', data.message);
                    addMessage('bot', '❌ Error: ' + (data.message || 'No se pudo procesar el mensaje'));
                }

            } catch (error) {
                console.error('❌ Error en la petición:', error);
                if (typingIndicator && typingIndicator.remove) {
                    typingIndicator.remove();
                }
                addMessage('bot', '❌ Error de conexión. Por favor, intenta más tarde.');
            } finally {
                chatSend.disabled = false;
                chatInput.disabled = false;
                chatInput.focus();
                isProcessingMessage = false;
                console.log('🔄 Chat listo para nuevo mensaje');
            }
        }

        // ✅ FUNCIÓN PARA AÑADIR MENSAJES AL CHAT
        function addMessage(sender, text) {
            if (!chatMessages) return;

            const messageDiv = document.createElement('div');
            messageDiv.className = `message ${sender}-message`;

            const messageContent = document.createElement('div');
            messageContent.className = 'message-content';

            const messageText = document.createElement('p');
            messageText.textContent = text;

            const messageTime = document.createElement('span');
            messageTime.className = 'message-time';
            messageTime.textContent = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            messageContent.appendChild(messageText);
            messageContent.appendChild(messageTime);

            const messageAvatar = document.createElement('div');
            messageAvatar.className = 'message-avatar';
            messageAvatar.innerHTML = sender === 'user' ? 
                '<i class="fas fa-user"></i>' : 
                '<i class="fas fa-robot"></i>';

            if (sender === 'user') {
                messageDiv.appendChild(messageContent);
                messageDiv.appendChild(messageAvatar);
            } else {
                messageDiv.appendChild(messageAvatar);
                messageDiv.appendChild(messageContent);
            }

            chatMessages.appendChild(messageDiv);
            chatMessages.scrollTop = chatMessages.scrollHeight;

            console.log(`💬 Mensaje añadido: ${sender} - "${text.substring(0, 30)}..."`);
        }

        // ✅ FUNCIÓN PARA MOSTRAR INDICADOR DE TYPING
        function showTypingIndicator() {
            if (!chatMessages) return null;

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

        // ✅ INICIALIZAR EVENT LISTENERS
        setupEventListeners();

        console.log('✅ Chat funcional completamente inicializado');
        console.log('🎯 Características activas:');
        console.log('   - ✅ Burbuja de chat clickeable');
        console.log('   - ✅ Apertura/cierre del chat');
        console.log('   - ✅ Envío con botón y Enter');
        console.log('   - ✅ Área de texto para escribir');
        console.log('   - ✅ Indicador de typing');
    }
})();

