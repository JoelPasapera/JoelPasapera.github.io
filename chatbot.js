// chat-funcional.js - CHAT COMPLETAMENTE FUNCIONAL SIN RECARGAS
(function () {
    'use strict';

    console.log('🚀 Iniciando chat funcional...');

    // Estado global
    let isChatOpen = false;
    let isProcessingMessage = false;

    // Esperar a que la página esté completamente cargada
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeFunctionalChat, false);
    } else {
        initializeFunctionalChat();
    }

    function initializeFunctionalChat() {
        const CONFIG = {
            API_BASE_URL: window.location.origin.includes('pythonanywhere')
                ? 'https://joelpasapera.pythonanywhere.com'
                : 'http://localhost:5000',
            CHAT_ENDPOINT: '/api/chat'
        };



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

        // Monitorear recargas
        window.addEventListener('beforeunload', function (e) {
            console.log('⚠️ ¡Se está intentando recargar la página!');
            // Evitar de manera forzosa y agresiva la regarga de la página
            e.preventDefault();
            e.stopPropagation();
            e.stopImmediatePropagation();
            return;
        });

        // ✅ SOLUCIÓN DEFINITIVA: Reemplazar completamente el event listener
        function setupChatEvents() {
            console.log('🔧 Configurando eventos del chat...');

            // ✅ NUEVO EVENT LISTENER - MÁS SEGURO
            newChatSend.addEventListener('click', function (e) {
                console.log('🖱️ Botón enviar clickeado');
                e.preventDefault();
                e.stopImmediatePropagation();
                e.stopPropagation();

                // Forzar la prevención
                if (e.cancelable) e.preventDefault();

                handleSendMessage();
                return false;
            });

            // ✅ EVENT LISTENER PARA ENTER
            newChatInput.addEventListener('keydown', function (e) {
                if (e.key === 'Enter' && !e.shiftKey) {
                    console.log('⌨️ Enter presionado');
                    e.preventDefault();
                    e.stopImmediatePropagation();
                    e.stopPropagation();

                    handleSendMessage();
                    return false;
                }
            });

            console.log('✅ Eventos del chat configurados');
        }

        // ✅ FUNCIÓN PARA ABRIR/CERRAR CHAT
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

        function closeChat() {
            isChatOpen = false;
            chatContainer.classList.remove('active');
            console.log('📱 Chat cerrado manualmente');
        }

        // ✅ MANEJADORES DE APERTURA/CIERRE
        chatToggle.addEventListener('click', function (e) {
            console.log('🔘 Click en toggle del chat');
            e.preventDefault();
            e.stopPropagation();
            toggleChat();
        });

        if (chatClose) {
            chatClose.addEventListener('click', function (e) {
                console.log('❌ Click en cerrar chat');
                e.preventDefault();
                e.stopPropagation();
                closeChat();
            });
        }

        // ✅ Cerrar chat al hacer clic fuera
        document.addEventListener('click', function (e) {
            if (isChatOpen &&
                !chatContainer.contains(e.target) &&
                e.target !== chatToggle &&
                !chatToggle.contains(e.target)) {
                console.log('📪 Clic fuera del chat - cerrando');
                closeChat();
            }
        });

        // ✅ MANEJADOR DE ENVÍO CON PROTECCIÓN EXTREMA
        function handleSendClick(e) {
            console.log('🖱️ Click en enviar');
            if (e) {
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
            }
            // funcion para enviar mensaje al hacer click en el boton
            handleSendMessage();
            return;
        }

        function handleEnterKey(e) {
            if (e.key === 'Enter' && !e.shiftKey) {
                console.log('⌨️ Enter presionado');
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                // funcion para enviar mensaje al hacer click en el boton
                handleSendMessage();
                return;
            }
        }

        // ✅ REMOVER CUALQUIER EVENT LISTENER EXISTENTE Y AGREGAR NUEVOS
        function setupEventListeners() {
            // Remover listeners existentes
            chatSend.replaceWith(chatSend.cloneNode(true));
            chatInput.replaceWith(chatInput.cloneNode(true));

            // Obtener nuevas referencias
            const newSend = document.getElementById('chatSend');
            const newInput = document.getElementById('chatInput');

            // Agregar nuevos listeners
            newSend.addEventListener('click', handleSendClick, true);
            newInput.addEventListener('keydown', handleEnterKey, true);


            console.log('✅ Event listeners configurados correctamente');
            return { newSend, newInput };
        }

        // Configurar event listeners
        const { newSend: functionalSend, newInput: functionalInput } = setupEventListeners();

        // ✅ AJUSTAR ALTURA DEL TEXTAREA
        functionalInput.addEventListener('input', function () {
            this.style.height = 'auto';
            this.style.height = (this.scrollHeight) + 'px';
        });

        // ✅ PROTECCIÓN GLOBAL CONTRA FORMULARIOS
        document.addEventListener('button', function (e) {
            const target = e.target;
            if (target && (target.contains(functionalInput) || target.contains(functionalSend) ||
                target.closest('.chat-container'))) {
                console.log('🚫 Previniendo envío de formulario del chat');
                e.preventDefault();
                e.stopImmediatePropagation();
                return false;
            }
        }, true);

        // ✅ FUNCIÓN PRINCIPAL DE ENVÍO
        async function handleSendMessage() {
            if (isProcessingMessage) {
                console.log('⏳ Mensaje en proceso, ignorando...');
                return;
            }

            const message = functionalInput.value.trim();
            if (!message) {
                console.log('⚠️ Mensaje vacío');
                return;
            }

            console.log('📨 Enviando mensaje:', message);
            isProcessingMessage = true;

            // Limpiar y deshabilitar
            functionalInput.value = '';
            functionalInput.style.height = 'auto';
            functionalSend.disabled = true;
            functionalInput.disabled = true;

            // Mostrar mensaje usuario inmediatamente
            addMessage('user', message);

            // Mostrar indicador de typing
            const typingIndicator = showTypingIndicator();

            try {
                console.log('🔴 DEBUG: antes del fetch - ¿llegamos aquí?');
                // Realizar una petición HTTP al servidor usando la API Fetch
                const response = await fetch(
                    // 🔗 URL de destino: combinamos la URL base y el endpoint del chat
                    `${CONFIG.API_BASE_URL}${CONFIG.CHAT_ENDPOINT}`,

                    {
                        // 🚀 MÉTODO HTTP: POST para enviar datos al servidor
                        method: 'POST',

                        // 📋 CABECERAS HTTP: Información adicional sobre la petición
                        headers: {
                            // 🎯 Tipo de contenido - indica que enviamos datos en formato JSON
                            'Content-Type': 'application/json',

                            // ⚠️ NOTA: Evitamos 'X-Requested-With' porque causa problemas de CORS
                            // ❌ NO incluir: 'X-Requested-With': 'XMLHttpRequest'
                        },

                        // 📦 CUERPO DE LA PETICIÓN: Los datos que enviamos al servidor
                        body: JSON.stringify({
                            // 💬 Mensaje del usuario que queremos procesar
                            message: message,

                            // ⏰ Marca de tiempo para tracking y logging
                            timestamp: new Date().toISOString()

                            // 🏷️ Podrías añadir más campos aquí si el servidor los requiere:
                            // - user_id: '12345'
                            // - session_id: 'abc123'
                            // - language: 'es'
                        })
                    }
                );

                console.log('🔴 DEBUG: despues del fetch - ✅ Respuesta HTTP:', response.status);

                if (!response.ok) {
                    throw new Error(`HTTP ${response.status}`);
                }

                const data = await response.json();

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
                console.error('❌ Error:', error);
                if (typingIndicator && typingIndicator.remove) {
                    typingIndicator.remove();
                }
                addMessage('bot', '❌ Error de conexión. Por favor, intenta más tarde.');
            } finally {
                functionalSend.disabled = false;
                functionalInput.disabled = false;
                functionalInput.focus();
                isProcessingMessage = false;
                console.log('🔄 Chat listo para nuevo mensaje');
            }
        }

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
            messageAvatar.innerHTML = sender === 'user' ? '<i class="fas fa-user"></i>' : '<i class="fas fa-robot"></i>';

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

        setupChatEvents();



        console.log('✅ Chat funcional completamente inicializado');
        console.log('🎯 Características:');
        console.log('   - ✅ Apertura/cierre del chat');
        console.log('   - ✅ Envío con botón');
        console.log('   - ✅ Envío con Enter');
        console.log('   - ✅ Sin recargas de página');
        console.log('   - ✅ Indicador de typing');
    }
})();