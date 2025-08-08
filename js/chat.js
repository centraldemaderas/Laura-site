// Chat Widget Implementation
class ChatWidget {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createChatInterface();
        this.bindEvents();
        this.loadFAQ();
    }

    createChatInterface() {
        const chatHTML = `
            <div id="chat-widget" class="chat-widget">
                <div class="chat-header">
                    <h4>Chat con Laura</h4>
                    <button class="chat-close" aria-label="Cerrar chat">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="chat-messages" id="chat-messages">
                    <div class="message bot-message">
                        <div class="message-content">
                            <p>¡Hola! Soy Laura Giraldo. ¿En qué puedo ayudarte hoy?</p>
                        </div>
                    </div>
                </div>
                <div class="chat-input">
                    <input type="text" id="chat-input-field" placeholder="Escribe tu mensaje..." />
                    <button id="chat-send" aria-label="Enviar mensaje">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', chatHTML);
        this.chatWidget = document.getElementById('chat-widget');
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input-field');
        this.chatSend = document.getElementById('chat-send');
    }

    bindEvents() {
        // Chat bubble click
        const chatBubble = document.getElementById('chat-bubble');
        if (chatBubble) {
            chatBubble.addEventListener('click', () => this.toggleChat());
        }

        // Close button
        const closeBtn = this.chatWidget.querySelector('.chat-close');
        closeBtn.addEventListener('click', () => this.closeChat());

        // Send button
        this.chatSend.addEventListener('click', () => this.sendMessage());

        // Enter key
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendMessage();
            }
        });

        // Click outside to close
        document.addEventListener('click', (e) => {
            if (!this.chatWidget.contains(e.target) && 
                !chatBubble.contains(e.target) && 
                this.isOpen) {
                this.closeChat();
            }
        });
    }

    toggleChat() {
        if (this.isOpen) {
            this.closeChat();
        } else {
            this.openChat();
        }
    }

    openChat() {
        this.chatWidget.style.display = 'block';
        this.chatWidget.style.transform = 'translateY(0)';
        this.chatWidget.style.opacity = '1';
        this.isOpen = true;
        this.chatInput.focus();
    }

    closeChat() {
        this.chatWidget.style.transform = 'translateY(20px)';
        this.chatWidget.style.opacity = '0';
        setTimeout(() => {
            this.chatWidget.style.display = 'none';
        }, 300);
        this.isOpen = false;
    }

    async sendMessage() {
        const message = this.chatInput.value.trim();
        if (!message) return;

        // Add user message
        this.addMessage(message, 'user');
        this.chatInput.value = '';

        // Show typing indicator
        this.showTypingIndicator();

        try {
            // Send to API
            const response = await this.sendToAPI(message);
            this.hideTypingIndicator();
            this.addMessage(response, 'bot');
        } catch (error) {
            console.error('Chat error:', error);
            this.hideTypingIndicator();
            this.addMessage('Lo siento, estoy teniendo problemas técnicos. Por favor, contáctame directamente por email o teléfono.', 'bot');
        }
    }

    addMessage(content, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}-message`;
        messageDiv.innerHTML = `
            <div class="message-content">
                <p>${this.formatMessage(content)}</p>
            </div>
        `;

        this.chatMessages.appendChild(messageDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;

        // Store message
        this.messages.push({ content, sender, timestamp: new Date() });
    }

    formatMessage(content) {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/\n/g, '<br>');
    }

    showTypingIndicator() {
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot-message typing-indicator';
        typingDiv.id = 'typing-indicator';
        typingDiv.innerHTML = `
            <div class="message-content">
                <div class="typing-dots">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        this.chatMessages.appendChild(typingDiv);
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }

    hideTypingIndicator() {
        const typingIndicator = document.getElementById('typing-indicator');
        if (typingIndicator) {
            typingIndicator.remove();
        }
    }

    async sendToAPI(userMessage) {
        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: userMessage,
                    context: this.getContext()
                })
            });

            if (!response.ok) {
                throw new Error('API response not ok');
            }

            const data = await response.json();
            return data.response || 'Gracias por tu mensaje. Te responderé pronto.';
        } catch (error) {
            // Fallback to FAQ responses
            return this.getFAQResponse(userMessage);
        }
    }

    getContext() {
        return {
            currentPage: window.location.pathname,
            previousMessages: this.messages.slice(-5), // Last 5 messages
            userAgent: navigator.userAgent
        };
    }

    loadFAQ() {
        this.faq = [
            {
                question: '¿Cuánto cuesta una sesión?',
                answer: 'Los precios varían según el tipo de servicio. La terapia individual cuesta $80.000 COP, terapia de pareja $120.000 COP, y terapia online $70.000 COP. Puedes ver todos los precios en la página de servicios.'
            },
            {
                question: '¿Cómo agendo una cita?',
                answer: 'Puedes agendar tu cita directamente desde la página de reservas. Solo necesitas seleccionar el horario que prefieras y completar el proceso de pago.'
            },
            {
                question: '¿Ofreces terapia online?',
                answer: 'Sí, ofrezco terapia online a través de videollamada. Es igual de efectiva que la terapia presencial y te permite mayor flexibilidad de horarios.'
            },
            {
                question: '¿Cuánto dura una sesión?',
                answer: 'Las sesiones individuales y online duran 50 minutos, mientras que las sesiones de pareja duran 80 minutos. La primera sesión puede ser un poco más larga para conocernos.'
            },
            {
                question: '¿Qué debo esperar de la primera sesión?',
                answer: 'La primera sesión es un espacio para conocernos, hablar sobre lo que te trae a terapia y establecer los objetivos de tu proceso. Es normal sentir nervios, pero mi compromiso es crear un espacio seguro y acogedor.'
            }
        ];
    }

    getFAQResponse(userMessage) {
        const message = userMessage.toLowerCase();
        
        for (const faq of this.faq) {
            const question = faq.question.toLowerCase();
            const keywords = question.split(' ').filter(word => word.length > 3);
            
            for (const keyword of keywords) {
                if (message.includes(keyword)) {
                    return faq.answer;
                }
            }
        }
        
        return 'Gracias por tu mensaje. Te responderé personalmente lo antes posible. También puedes contactarme directamente por email a laura@lauragiraldo.com o por teléfono al +57 300 123 4567.';
    }
}

// Initialize chat widget when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    new ChatWidget();
});

// Add chat widget styles
const chatStyles = `
    .chat-widget {
        position: fixed;
        bottom: 100px;
        right: 20px;
        width: 350px;
        height: 500px;
        background: #0D1625;
        border-radius: 15px;
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
        border: 1px solid rgba(255, 216, 115, 0.2);
        display: none;
        flex-direction: column;
        z-index: 1000;
        transform: translateY(20px);
        opacity: 0;
        transition: all 0.3s ease;
    }

    .chat-header {
        background: #FFD873;
        color: #0D1625;
        padding: 1rem;
        border-radius: 15px 15px 0 0;
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .chat-header h4 {
        margin: 0;
        font-weight: 600;
    }

    .chat-close {
        background: none;
        border: none;
        color: #0D1625;
        cursor: pointer;
        font-size: 1.2rem;
    }

    .chat-messages {
        flex: 1;
        padding: 1rem;
        overflow-y: auto;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .message {
        max-width: 80%;
        padding: 0.5rem 1rem;
        border-radius: 15px;
        word-wrap: break-word;
    }

    .user-message {
        align-self: flex-end;
        background: #FFD873;
        color: #0D1625;
    }

    .bot-message {
        align-self: flex-start;
        background: rgba(255, 255, 255, 0.1);
        color: #FFFFFF;
        border: 1px solid rgba(255, 216, 115, 0.2);
    }

    .chat-input {
        padding: 1rem;
        display: flex;
        gap: 0.5rem;
        border-top: 1px solid rgba(255, 216, 115, 0.2);
    }

    .chat-input input {
        flex: 1;
        padding: 0.5rem 1rem;
        border: 1px solid rgba(255, 216, 115, 0.3);
        border-radius: 25px;
        background: rgba(255, 255, 255, 0.05);
        color: #FFFFFF;
        font-size: 0.9rem;
    }

    .chat-input input:focus {
        outline: none;
        border-color: #FFD873;
    }

    .chat-input input::placeholder {
        color: rgba(255, 255, 255, 0.6);
    }

    .chat-input button {
        background: #FFD873;
        color: #0D1625;
        border: none;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
    }

    .chat-input button:hover {
        background: #8FB7A5;
        transform: scale(1.1);
    }

    .typing-dots {
        display: flex;
        gap: 0.3rem;
        padding: 0.5rem;
    }

    .typing-dots span {
        width: 8px;
        height: 8px;
        background: #FFD873;
        border-radius: 50%;
        animation: typing 1.4s infinite ease-in-out;
    }

    .typing-dots span:nth-child(1) { animation-delay: -0.32s; }
    .typing-dots span:nth-child(2) { animation-delay: -0.16s; }

    @keyframes typing {
        0%, 80%, 100% {
            transform: scale(0.8);
            opacity: 0.5;
        }
        40% {
            transform: scale(1);
            opacity: 1;
        }
    }

    @media (max-width: 768px) {
        .chat-widget {
            width: calc(100vw - 40px);
            height: 60vh;
            bottom: 80px;
            right: 20px;
        }
    }
`;

// Inject styles
const styleSheet = document.createElement('style');
styleSheet.textContent = chatStyles;
document.head.appendChild(styleSheet); 