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

    if (!sizeRadios.length) return;

    let selectedSize = null;
    let quantity = 1;
    let isEditMode = false;

    // Load existing order if returning from bag
    const existingOrder = Cart.getOrder();
    if (existingOrder) {
        isEditMode = true;
        
        // Change button text to "Update Bag"
        if (addToBagBtn) {
            addToBagBtn.textContent = 'Update Bag';
        }

        // Restore size
        if (existingOrder.size) {
            const sizeRadio = document.querySelector(`.size-radio[value="${existingOrder.size}"]`);
            if (sizeRadio) {
                sizeRadio.checked = true;
                sizeRadio.closest('.size-button').classList.add('selected');
                selectedSize = existingOrder.size;
            }
        }

        // Restore ingredients
        if (existingOrder.ingredients && existingOrder.ingredients.length > 0) {
            ingredientCheckboxes.forEach(checkbox => {
                const ingredientName = checkbox.closest('.ingredient-button').querySelector('span:last-child').textContent;
                if (existingOrder.ingredients.includes(ingredientName)) {
                    checkbox.checked = true;
                    checkbox.closest('.ingredient-button').classList.add('selected');
                }
            });
        }

        // Restore addons
        if (existingOrder.addons && existingOrder.addons.length > 0) {
            addonCheckboxes.forEach(checkbox => {
                const addonName = checkbox.closest('.addon-item').querySelector('.addon-name').textContent;
                if (existingOrder.addons.includes(addonName)) {
                    checkbox.checked = true;
                    checkbox.closest('.addon-item').classList.add('selected');
                }
            });
        }

        // Restore quantity
        if (existingOrder.quantity) {
            quantity = existingOrder.quantity;
            quantityDisplay.textContent = quantity;
        }

        // Update price display
        updateTotalPrice();
    }

    // Update total price function
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
    if (!bagItemName) return;

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
        
        // Update subtotal
        const subtotalPrice = document.querySelector('.bag-subtotal span:last-child');
        if (subtotalPrice) {
            subtotalPrice.textContent = Cart.formatPrice(order.pricing.subtotal);
        }

        // Display order details with badges and images
        const orderDetails = document.querySelector('.order-details');
        if (orderDetails) {
            let detailsHTML = '';
            
            const ingredientImages = {
                'Mixed Berry': 'Smoothie_images/mixberries.png',
                'Pineapple': 'Smoothie_images/pineapple.png',
                'Strawberry': 'Smoothie_images/strawberry.png',
                'Mango': 'Smoothie_images/mango.png',
                'Banana': 'Smoothie_images/banana.png',
                'Spinach': 'Smoothie_images/spinach.png',
                'Kale': 'Smoothie_images/kale.png'
            };
            
            if (order.size) {
                detailsHTML += '<div class="detail-section">';
                const sizeText = order.size.charAt(0).toUpperCase() + order.size.slice(1);
                detailsHTML += `<span class="detail-badge detail-size">${sizeText}</span>`;
                detailsHTML += '</div>';
            }
            
            if (order.ingredients && order.ingredients.length > 0) {
                detailsHTML += '<div class="detail-section">';
                order.ingredients.forEach(ingredient => {
                    const imgSrc = ingredientImages[ingredient] || '';
                    if (imgSrc) {
                        detailsHTML += `<span class="detail-badge detail-ingredient">
                            <img src="${imgSrc}" alt="${ingredient}" class="detail-icon">
                            ${ingredient}
                        </span>`;
                    } else {
                        detailsHTML += `<span class="detail-badge detail-ingredient">${ingredient}</span>`;
                    }
                });
                detailsHTML += '</div>';
            }
            
            if (order.addons && order.addons.length > 0) {
                detailsHTML += '<div class="detail-section">';
                order.addons.forEach(addon => {
                    detailsHTML += `<span class="detail-badge detail-addon">${addon} (+$0.50)</span>`;
                });
                detailsHTML += '</div>';
            }
            
            orderDetails.innerHTML = detailsHTML;
        }
    }

    // Edit button - go back to customize page
    const editButton = document.querySelector('.bag-action-link[href="customize.html"]');
    if (editButton) {
        editButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'customize.html';
        });
    }

    // Back button - go back to customize page
    const backButton = document.querySelector('.back-button[href="customize.html"]');
    if (backButton) {
        backButton.addEventListener('click', function(e) {
            e.preventDefault();
            window.location.href = 'customize.html';
        });
    }

    // Remove button - show confirmation modal
    const removeButton = document.querySelector('.bag-action-link[href="bag.html"]');
    const removeModal = document.getElementById('removeModal');
    const cancelRemove = document.getElementById('cancelRemove');
    const confirmRemove = document.getElementById('confirmRemove');

    if (removeButton && removeModal) {
        removeButton.addEventListener('click', function(e) {
            e.preventDefault();
            removeModal.classList.add('active');
        });
    }

    // Cancel remove
    if (cancelRemove && removeModal) {
        cancelRemove.addEventListener('click', () => {
            removeModal.classList.remove('active');
        });
    }

    // Confirm remove
    if (confirmRemove) {
        confirmRemove.addEventListener('click', () => {
            // Clear the order from localStorage
            localStorage.removeItem('currentOrder');
            
            // Close modal
            if (removeModal) {
                removeModal.classList.remove('active');
            }
            
            // Redirect to home page
            window.location.href = 'index.html';
        });
    }

    // Close modal when clicking overlay
    if (removeModal) {
        removeModal.addEventListener('click', (e) => {
            if (e.target === removeModal) {
                removeModal.classList.remove('active');
            }
        });
    }
}

// ============================================
// CHECKOUT PAGE
// ============================================

function initCheckoutPage() {
    const radioInputs = document.querySelectorAll('.radio-input');
    if (!radioInputs.length) return; // Not on checkout page

    const order = Cart.getOrder();
    
    if (order) {
        // Update first summary item with quantity and details
        const summaryItems = document.querySelectorAll('.summary-item');
        if (summaryItems.length >= 4) {
            // First item - Custom Smoothie with quantity
            const firstItem = summaryItems[0];
            const itemNameDiv = firstItem.querySelector('.summary-item-name');
            if (itemNameDiv) {
                itemNameDiv.textContent = `${order.quantity}x Custom Smoothie`;
            }
            firstItem.querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
            
            // Display order details below item name
            const orderDetailsCheckout = firstItem.querySelector('.order-details-checkout');
            if (orderDetailsCheckout) {
                let detailsText = '';
                
                if (order.size) {
                    detailsText += order.size.charAt(0).toUpperCase() + order.size.slice(1);
                }
                
                if (order.ingredients.length > 0) {
                    if (detailsText) detailsText += ', ';
                    detailsText += order.ingredients.join(' ');
                }
                
                orderDetailsCheckout.textContent = detailsText;
            }
            
            // Update other items
            summaryItems[1].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
            summaryItems[2].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tax);
            summaryItems[3].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tip);
        }
        
        const summaryTotal = document.querySelector('.summary-total span:last-child');
        if (summaryTotal) {
            summaryTotal.textContent = Cart.formatPrice(order.pricing.total);
        }
    }

    // Radio button selection handler
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            // Get all radio buttons with the same name
            const radioGroup = document.querySelectorAll(`input[name="${this.name}"]`);
            
            // Remove selected class from all options in this group
            radioGroup.forEach(r => {
                r.closest('.radio-option').classList.remove('selected');
            });
            
            // Add selected class to the checked option
            if (this.checked) {
                this.closest('.radio-option').classList.add('selected');
            }

            // Open Apple Pay modal if Apple Pay is selected
            if (this.name === 'payment' && this.value === 'apple') {
                const applePayModal = document.getElementById('applePayModal');
                if (applePayModal) applePayModal.classList.add('active');
            }

            // Open time modal if "Schedule for later" is selected
            if (this.name === 'pickup-time' && this.value === 'later') {
                const timeModal = document.getElementById('timeModal');
                if (timeModal) timeModal.classList.add('active');
            }
        });
    });

    // Tip button selection
    const tipButtons = document.querySelectorAll('.tip-button');
    tipButtons.forEach(button => {
        button.addEventListener('click', function() {
            // Remove selected from all tip buttons
            tipButtons.forEach(btn => btn.classList.remove('selected'));
            // Add selected to clicked button
            this.classList.add('selected');
        });
    });

    // Time modal functionality
    const timeModal = document.getElementById('timeModal');
    const closeModal = document.getElementById('closeModal');
    const confirmTime = document.getElementById('confirmTime');
    const timeRadios = document.querySelectorAll('.time-radio');

    // Handle time slot selection
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

    // Close time modal
    if (closeModal) {
        closeModal.addEventListener('click', () => {
            if (timeModal) timeModal.classList.remove('active');
        });
    }

    // Close time modal when clicking overlay
    if (timeModal) {
        timeModal.addEventListener('click', (e) => {
            if (e.target === timeModal) {
                timeModal.classList.remove('active');
            }
        });
    }

    // Confirm time selection
    if (confirmTime) {
        confirmTime.addEventListener('click', () => {
            const selectedTime = document.querySelector('.time-radio:checked');
            
            if (selectedTime) {
                // Update the "Schedule for later" label with selected time
                const laterOption = document.querySelector('input[value="later"]');
                if (laterOption) {
                    const laterOptionParent = laterOption.closest('.radio-option');
                    const sublabel = laterOptionParent.querySelector('.radio-sublabel');
                    if (sublabel) {
                        sublabel.textContent = selectedTime.value;
                    }
                }
                
                // Close modal
                if (timeModal) timeModal.classList.remove('active');
            }
        });
    }

    // Apple Pay modal functionality
    const applePayModal = document.getElementById('applePayModal');
    const applePayConfirm = document.querySelector('.confirm-section');

    // Close Apple Pay modal when clicking overlay
    if (applePayModal) {
        applePayModal.addEventListener('click', (e) => {
            if (e.target === applePayModal) {
                applePayModal.classList.remove('active');
            }
        });
    }

    // Close Apple Pay modal and go to confirmation when clicking confirm
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
    if (!receiptItems.length) return;

    const order = Cart.getOrder();
    
    if (order) {
        // Update first receipt item with quantity and name
        const firstItem = receiptItems[0];
        const itemNameDiv = firstItem.querySelector('.receipt-item-name');
        if (!itemNameDiv) {
            // If no receipt-item-name class, try to find the first div
            const firstDiv = firstItem.querySelector('div div:first-child');
            if (firstDiv) {
                firstDiv.textContent = `${order.quantity}x Custom Smoothie`;
            }
        } else {
            itemNameDiv.textContent = `${order.quantity}x Custom Smoothie`;
        }
        
        firstItem.querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
        
        // Display order details (size, ingredients, addons)
        const orderDetailsConfirmation = firstItem.querySelector('.order-details-confirmation');
        if (orderDetailsConfirmation) {
            let detailsText = '';
            
            if (order.size) {
                detailsText += order.size.charAt(0).toUpperCase() + order.size.slice(1);
            }
            
            if (order.ingredients.length > 0) {
                if (detailsText) detailsText += ' ';
                detailsText += order.ingredients.join(' ');
            }
            
            if (order.addons.length > 0) {
                if (detailsText) detailsText += ' ';
                detailsText += order.addons.join(' ');
            }
            
            orderDetailsConfirmation.textContent = detailsText;
        }
        
        // Find and update subtotal, tax, tip
        const allReceiptItems = document.querySelectorAll('.receipt-item');
        let subtotalIndex = -1;
        
        allReceiptItems.forEach((item, index) => {
            const directSpans = item.querySelectorAll(':scope > span');
            if (directSpans.length === 2 && directSpans[0].textContent === 'Subtotal') {
                subtotalIndex = index;
            }
        });
        
        if (subtotalIndex !== -1) {
            allReceiptItems[subtotalIndex].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
            if (allReceiptItems[subtotalIndex + 1]) {
                allReceiptItems[subtotalIndex + 1].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tax);
            }
            if (allReceiptItems[subtotalIndex + 2]) {
                allReceiptItems[subtotalIndex + 2].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tip);
            }
        }
        
        const receiptTotal = document.querySelector('.receipt-total span:last-child');
        if (receiptTotal) {
            receiptTotal.textContent = Cart.formatPrice(order.pricing.total);
        }
    }
}

// ============================================
// STATUS PAGE
// ============================================

function initStatusPage() {
    const orderDetailsStatus = document.querySelector('.order-details-status');
    if (!orderDetailsStatus) return; // Not on status page

    const order = Cart.getOrder();
    
    if (order) {
        // Update first receipt item with quantity and name
        const receiptItemName = document.querySelector('.receipt-item-name');
        if (receiptItemName) {
            receiptItemName.textContent = `${order.quantity}x Custom Smoothie`;
        }
        
        const firstReceiptItem = document.querySelector('.receipt-item');
        if (firstReceiptItem) {
            firstReceiptItem.querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
        }
        
        // Display order details (size, ingredients, addons)
        if (orderDetailsStatus) {
            let detailsText = '';
            
            if (order.size) {
                detailsText += order.size.charAt(0).toUpperCase() + order.size.slice(1);
            }
            
            if (order.ingredients.length > 0) {
                if (detailsText) detailsText += ' ';
                detailsText += order.ingredients.join(' ');
            }
            
            if (order.addons.length > 0) {
                if (detailsText) detailsText += ' ';
                detailsText += order.addons.join(' ');
            }
            
            orderDetailsStatus.textContent = detailsText;
        }
        
        // Find and update subtotal, tax, tip
        const allReceiptItems = document.querySelectorAll('.receipt-item');
        let subtotalIndex = -1;
        
        allReceiptItems.forEach((item, index) => {
            const directSpans = item.querySelectorAll(':scope > span');
            if (directSpans.length === 2 && directSpans[0].textContent === 'Subtotal') {
                subtotalIndex = index;
            }
        });
        
        if (subtotalIndex !== -1) {
            allReceiptItems[subtotalIndex].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.subtotal);
            if (allReceiptItems[subtotalIndex + 1]) {
                allReceiptItems[subtotalIndex + 1].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tax);
            }
            if (allReceiptItems[subtotalIndex + 2]) {
                allReceiptItems[subtotalIndex + 2].querySelector('span:last-child').textContent = Cart.formatPrice(order.pricing.tip);
            }
        }
        
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
    initStatusPage(); 
});