// ============================================
// CART MANAGEMENT
// ============================================

const Cart = {
    prices: {
        small: 4.50,
        medium: 5.50,
        large: 6.50,
        addon: 0.50
    },

    saveOrder: function(orderData) {
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
    },

    getOrder: function() {
        const order = localStorage.getItem('currentOrder');
        return order ? JSON.parse(order) : null;
    },

    calculateTotal: function(size, addons, quantity) {
        let basePrice = 0;
        
        if (size) {
            basePrice = this.prices[size];
        }
        
        const addonPrice = addons.length * this.prices.addon;
        const subtotal = (basePrice + addonPrice) * quantity;
        const tax = 1.00;
        const tip = 0;
        
        return {
            subtotal: subtotal,
            tax: tax,
            tip: tip,
            total: subtotal + tax + tip
        };
    },

    formatPrice: function(amount) {
        return `$${amount.toFixed(2)}`;
    }
};

// ============================================
// CUSTOMIZE PAGE
// ============================================

function initCustomizePage() {
    const sizeRadios = document.querySelectorAll('.size-radio');
    const ingredientCheckboxes = document.querySelectorAll('.ingredient-checkbox');
    const addonCheckboxes = document.querySelectorAll('.addon-checkbox');
    const minusButton = document.querySelector('.quantity-button.minus');
    const plusButton = document.querySelector('.quantity-button.plus');
    const quantityDisplay = document.querySelector('.quantity');
    const addToBagBtn = document.querySelector('.btn-secondary');
    const orderNowBtn = document.querySelector('.btn-primary');

    if (!sizeRadios.length) return; // Not on customize page

    let selectedSize = null;
    let quantity = 1;

    // Update total price
    function updateTotalPrice() {
        let basePrice = 0;
        
        if (selectedSize) {
            basePrice = Cart.prices[selectedSize];
        }
        
        const selectedAddons = document.querySelectorAll('.addon-checkbox:checked').length;
        const addonPrice = selectedAddons * Cart.prices.addon;
        const total = (basePrice + addonPrice) * quantity;
        
        document.querySelector('.total-price').textContent = `$${total.toFixed(2)}`;
    }

    // Size selection
    sizeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            document.querySelectorAll('.size-button').forEach(btn => {
                btn.classList.remove('selected');
            });
            
            if (this.checked) {
                this.closest('.size-button').classList.add('selected');
                selectedSize = this.value;
                updateTotalPrice();
            }
        });
    });

    // Ingredient selection (max 3)
    ingredientCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parent = this.closest('.ingredient-button');
            const checkedCount = document.querySelectorAll('.ingredient-checkbox:checked').length;
            
            if (this.checked) {
                if (checkedCount > 3) {
                    this.checked = false;
                    return;
                }
                parent.classList.add('selected');
            } else {
                parent.classList.remove('selected');
            }
        });
    });

    // Addon selection
    addonCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const parent = this.closest('.addon-item');
            
            if (this.checked) {
                parent.classList.add('selected');
            } else {
                parent.classList.remove('selected');
            }
            
            updateTotalPrice();
        });
    });

    // Quantity controls
    if (minusButton) {
        minusButton.addEventListener('click', () => {
            if (quantity > 1) {
                quantity--;
                quantityDisplay.textContent = quantity;
                updateTotalPrice();
            }
        });
    }

    if (plusButton) {
        plusButton.addEventListener('click', () => {
            quantity++;
            quantityDisplay.textContent = quantity;
            updateTotalPrice();
        });
    }

    // Save order function
    function saveCurrentOrder() {
        const sizeRadio = document.querySelector('.size-radio:checked');
        const size = sizeRadio ? sizeRadio.value : null;
        
        const ingredientCheckboxes = document.querySelectorAll('.ingredient-checkbox:checked');
        const ingredients = Array.from(ingredientCheckboxes).map(cb => 
            cb.closest('.ingredient-button').querySelector('span:last-child').textContent
        );
        
        const addonCheckboxes = document.querySelectorAll('.addon-checkbox:checked');
        const addons = Array.from(addonCheckboxes).map(cb => 
            cb.closest('.addon-item').querySelector('.addon-name').textContent
        );
        
        const quantity = parseInt(document.querySelector('.quantity').textContent);
        const pricing = Cart.calculateTotal(size, addons, quantity);
        
        Cart.saveOrder({
            size: size,
            ingredients: ingredients,
            addons: addons,
            quantity: quantity,
            pricing: pricing
        });
    }

    // Button clicks
    if (addToBagBtn) {
        addToBagBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCurrentOrder();
            window.location.href = 'bag.html';
        });
    }

    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            saveCurrentOrder();
            window.location.href = 'checkout.html';
        });
    }

    updateTotalPrice();
}

// ============================================
// BAG PAGE
// ============================================

function initBagPage() {
    const bagItemName = document.querySelector('.bag-item-name');
    if (!bagItemName) return; // Not on bag page

    const order = Cart.getOrder();
    
    if (order) {
        // Update item price
        const bagItemPrice = document.querySelector('.bag-item-price');
        if (bagItemPrice) {
            bagItemPrice.textContent = Cart.formatPrice(order.pricing.subtotal / order.quantity);
        }
        
        // Update quantity
        const quantityDisplay = document.querySelector('.bag-quantity-controls .quantity');
        if (quantityDisplay) {
            quantityDisplay.textContent = order.quantity;
        }
        
        // Update subtotal - correct selector for bag page
        const subtotalPrice = document.querySelector('.bag-subtotal span:last-child');
        if (subtotalPrice) {
            subtotalPrice.textContent = Cart.formatPrice(order.pricing.subtotal);
        }
    }
}

// ============================================
// CHECKOUT PAGE
// ============================================

function initCheckoutPage() {
    const radioInputs = document.querySelectorAll('.radio-input');
    if (!radioInputs.length) return; // Not on checkout page

    // Load order data
    const order = Cart.getOrder();
    
    if (order) {
        const summaryItems = document.querySelectorAll('.summary-item');
        if (summaryItems.length >= 4) {
            summaryItems[0].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
            summaryItems[1].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
            summaryItems[2].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tax);
            summaryItems[3].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tip);
        }
        
        const summaryTotal = document.querySelector('.summary-total span:last-child');
        if (summaryTotal) {
            summaryTotal.textContent = Cart.formatPrice(order.pricing.total);
        }
    }

    // Radio button selection
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            const radioGroup = document.querySelectorAll(`input[name="${this.name}"]`);
            
            radioGroup.forEach(r => {
                r.closest('.radio-option').classList.remove('selected');
            });
            
            if (this.checked) {
                this.closest('.radio-option').classList.add('selected');
            }

            // Open Apple Pay modal
            if (this.name === 'payment' && this.value === 'apple') {
                const applePayModal = document.getElementById('applePayModal');
                if (applePayModal) applePayModal.classList.add('active');
            }

            // Open time modal
            if (this.name === 'pickup-time' && this.value === 'later') {
                const timeModal = document.getElementById('timeModal');
                if (timeModal) timeModal.classList.add('active');
            }
        });
    });

    // Tip buttons
    const tipButtons = document.querySelectorAll('.tip-button');
    tipButtons.forEach(button => {
        button.addEventListener('click', function() {
            tipButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Time modal
    const timeModal = document.getElementById('timeModal');
    const closeModal = document.getElementById('closeModal');
    const confirmTime = document.getElementById('confirmTime');
    const timeRadios = document.querySelectorAll('.time-radio');

    if (timeRadios.length) {
        timeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                document.querySelectorAll('.time-option').forEach(opt => {
                    opt.classList.remove('selected');
                });
                if (this.checked) {
                    this.closest('.time-option').classList.add('selected');
                }
            });
        });
    }

    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (timeModal) timeModal.classList.remove('active');
        });
    }

    if (timeModal) {
        timeModal.addEventListener('click', (e) => {
            if (e.target === timeModal) {
                timeModal.classList.remove('active');
            }
        });
    }

    if (confirmTime) {
        confirmTime.addEventListener('click', () => {
            const selectedTime = document.querySelector('.time-radio:checked');
            
            if (selectedTime) {
                const laterOption = document.querySelector('input[value="later"]').closest('.radio-option');
                const sublabel = laterOption.querySelector('.radio-sublabel');
                sublabel.textContent = selectedTime.value;
                
                if (timeModal) timeModal.classList.remove('active');
            }
        });
    }

    // Apple Pay modal
    const applePayModal = document.getElementById('applePayModal');
    const applePayConfirm = document.querySelector('.confirm-section');

    if (applePayModal) {
        applePayModal.addEventListener('click', (e) => {
            if (e.target === applePayModal) {
                applePayModal.classList.remove('active');
            }
        });
    }

    if (applePayConfirm) {
        applePayConfirm.addEventListener('click', () => {
            if (applePayModal) applePayModal.classList.remove('active');
            window.location.href = 'confirmation.html';
        });
    }
}

// ============================================
// CONFIRMATION PAGE
// ============================================

function initConfirmationPage() {
    const receiptItems = document.querySelectorAll('.receipt-item');
    if (!receiptItems.length) return; // Not on confirmation page

    const order = Cart.getOrder();
    
    if (order && receiptItems.length >= 4) {
        receiptItems[0].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
        receiptItems[1].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
        receiptItems[2].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tax);
        receiptItems[3].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tip);
        
        const receiptTotal = document.querySelector('.receipt-total span:last-child');
        if (receiptTotal) {
            receiptTotal.textContent = Cart.formatPrice(order.pricing.total);
        }
    }
}

// ============================================
// INITIALIZE ON PAGE LOAD
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initCustomizePage();
    initBagPage();
    initCheckoutPage();
    initConfirmationPage();
});