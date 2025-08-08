// Wompi Payment Integration
document.addEventListener('DOMContentLoaded', function() {
    const payBtn = document.getElementById('payBtn');
    if (payBtn) {
        payBtn.addEventListener('click', handlePayment);
    }
});

async function handlePayment() {
    try {
        // Show loading state
        const payBtn = document.getElementById('payBtn');
        const originalText = payBtn.innerHTML;
        payBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Procesando...';
        payBtn.disabled = true;

        // Generate payment data
        const paymentData = {
            amount: 100000, // 100 COP in cents
            currency: 'COP',
            reference: 'CONSULTA_' + Date.now(),
            description: 'Consulta psicológica - Laura Giraldo'
        };

        // Generate signature (in production, this should be done server-side)
        const signature = await generateSignature(paymentData);

        // Open Wompi widget
        const widget = new WidgetCheckout({
            publicKey: 'pub_test_TU_LLAVE',
            amount: paymentData.amount,
            currency: paymentData.currency,
            reference: paymentData.reference,
            description: paymentData.description,
            signature: signature,
            onSuccess: handlePaymentSuccess,
            onError: handlePaymentError,
            onClose: handlePaymentClose
        });

        widget.open();

    } catch (error) {
        console.error('Payment error:', error);
        handlePaymentError(error);
    } finally {
        // Reset button state
        const payBtn = document.getElementById('payBtn');
        payBtn.innerHTML = '<i class="fas fa-credit-card" style="margin-right: 10px;"></i>Pagar ahora (COP)';
        payBtn.disabled = false;
    }
}

async function generateSignature(paymentData) {
    // In production, this should be done server-side for security
    // This is a simplified example
    const data = `${paymentData.amount}${paymentData.currency}${paymentData.reference}`;
    
    // Using Web Crypto API for SHA-256
    const encoder = new TextEncoder();
    const dataBuffer = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const signature = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    
    return signature;
}

function handlePaymentSuccess(transaction) {
    console.log('Payment successful:', transaction);
    
    // Redirect to confirmation page
    const txid = transaction.id || 'demo_' + Date.now();
    window.location.href = `confirmacion.html?txid=${txid}`;
}

function handlePaymentError(error) {
    console.error('Payment failed:', error);
    
    // Show error notification
    showNotification('Error en el pago. Por favor, intenta nuevamente.', 'error');
}

function handlePaymentClose() {
    console.log('Payment widget closed');
    showNotification('Pago cancelado. Puedes intentar nuevamente cuando quieras.', 'info');
}

function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#3b82f6'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 10px;
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.addEventListener('click', () => {
        notification.style.transform = 'translateX(400px)';
        setTimeout(() => notification.remove(), 300);
    });
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (notification.parentNode) {
            notification.style.transform = 'translateX(400px)';
            setTimeout(() => notification.remove(), 300);
        }
    }, 5000);
} 