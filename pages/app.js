// ============================================
// CART MANAGEMENT
// ============================================

// ============================================
// CART MANAGEMENT (Updated for multiple items)
// ============================================

const Cart = {
    prices: {
        small: 4.50,
        medium: 5.50,
        large: 6.50,
        addon: 0.50
    },

    // Get all items in cart
    getItems: function() {
        const items = localStorage.getItem('cartItems');
        return items ? JSON.parse(items) : [];
    },

    // Add item to cart
    addItem: function(item) {
        const items = this.getItems();
        items.push(item);
        localStorage.setItem('cartItems', JSON.stringify(items));
    },

    // Update item at index
    updateItem: function(index, item) {
        const items = this.getItems();
        if (index >= 0 && index < items.length) {
            items[index] = item;
            localStorage.setItem('cartItems', JSON.stringify(items));
        }
    },

    // Remove item at index
    removeItem: function(index) {
        const items = this.getItems();
        items.splice(index, 1);
        localStorage.setItem('cartItems', JSON.stringify(items));
    },

    // Clear all items
    clearCart: function() {
        localStorage.removeItem('cartItems');
        localStorage.removeItem('editingIndex');
    },

    // Set which item is being edited
    setEditingIndex: function(index) {
        if (index !== null && index !== undefined) {
            localStorage.setItem('editingIndex', index.toString());
        } else {
            localStorage.removeItem('editingIndex');
        }
    },

    // Get which item is being edited
    getEditingIndex: function() {
        const index = localStorage.getItem('editingIndex');
        return index !== null ? parseInt(index) : null;
    },

    // Calculate total for a single item
    calculateItemTotal: function(size, addons, quantity) {
        let basePrice = 0;
        
        if (size) {
            basePrice = this.prices[size];
        }
        
        const addonPrice = addons.length * this.prices.addon;
        return (basePrice + addonPrice) * quantity;
    },

    // Calculate cart totals
    calculateCartTotals: function() {
        const items = this.getItems();
        let subtotal = 0;
        
        items.forEach(item => {
            subtotal += this.calculateItemTotal(item.size, item.addons, item.quantity);
        });
        
        const tax = subtotal * 0.08; // 8% of subtotal
        const tip = 0;
        
        return {
            subtotal: subtotal,
            tax: tax,
            tip: tip,
            total: subtotal + tax + tip
        };
    },

    // Format price for display
    formatPrice: function(amount) {
        return `$${amount.toFixed(2)}`;
    },

    // Legacy support - keep for backward compatibility
    saveOrder: function(orderData) {
        // This is now deprecated but kept for compatibility
        localStorage.setItem('currentOrder', JSON.stringify(orderData));
    },

    getOrder: function() {
        const order = localStorage.getItem('currentOrder');
        return order ? JSON.parse(order) : null;
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
    let editingIndex = Cart.getEditingIndex();

    // Check if we're editing an existing item
    if (editingIndex !== null) {
        const items = Cart.getItems();
        const editingItem = items[editingIndex];
        
        if (editingItem) {
            // Change button text
            if (addToBagBtn) {
                addToBagBtn.textContent = 'Update Bag';
            }

            // Restore the item being edited
            restoreItem(editingItem);
        }
    }

    function restoreItem(item) {
        // Restore size
        if (item.size) {
            const sizeRadio = document.querySelector(`.size-radio[value="${item.size}"]`);
            if (sizeRadio) {
                sizeRadio.checked = true;
                sizeRadio.closest('.size-button').classList.add('selected');
                selectedSize = item.size;
            }
        }

        // Restore ingredients
        if (item.ingredients && item.ingredients.length > 0) {
            ingredientCheckboxes.forEach(checkbox => {
                const ingredientName = checkbox.closest('.ingredient-button').querySelector('span:last-child').textContent;
                if (item.ingredients.includes(ingredientName)) {
                    checkbox.checked = true;
                    checkbox.closest('.ingredient-button').classList.add('selected');
                }
            });
        }

        // Restore addons
        if (item.addons && item.addons.length > 0) {
            addonCheckboxes.forEach(checkbox => {
                const addonName = checkbox.closest('.addon-item').querySelector('.addon-name').textContent;
                if (item.addons.includes(addonName)) {
                    checkbox.checked = true;
                    checkbox.closest('.addon-item').classList.add('selected');
                }
            });
        }

        // Restore quantity
        if (item.quantity) {
            quantity = item.quantity;
            quantityDisplay.textContent = quantity;
        }

        updateTotalPrice();
    }

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

    function getCurrentItem() {
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
        
        const qty = parseInt(document.querySelector('.quantity').textContent);
        
        return {
            size: size,
            ingredients: ingredients,
            addons: addons,
            quantity: qty
        };
    }

    // Button clicks
    if (addToBagBtn) {
        addToBagBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate that a size is selected
            if (!selectedSize) {
                alert('Please select a size before adding to bag');
                return;
            }
            
            const item = getCurrentItem();
            
            if (editingIndex !== null) {
                // Update existing item
                Cart.updateItem(editingIndex, item);
                Cart.setEditingIndex(null);
            } else {
                // Add new item
                Cart.addItem(item);
            }
            
            window.location.href = 'bag.html';
        });
    }

    if (orderNowBtn) {
        orderNowBtn.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Validate that a size is selected
            if (!selectedSize) {
                alert('Please select a size before ordering');
                return;
            }
            
            const item = getCurrentItem();
            
            if (editingIndex !== null) {
                Cart.updateItem(editingIndex, item);
                Cart.setEditingIndex(null);
            } else {
                Cart.addItem(item);
            }
            
            window.location.href = 'checkout.html';
        });
    }

    updateTotalPrice();
}

// ============================================
// BAG PAGE
// ============================================

function initBagPage() {
    const bagItemsContainer = document.getElementById('bagItemsContainer');
    if (!bagItemsContainer) return;

    const items = Cart.getItems();
    
    if (items.length === 0) {
        // Show empty state
        bagItemsContainer.innerHTML = `
           <div class="empty-bag">
            <div class="empty-bag-icon-svg">
                <svg width="120" height="120" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <!-- Bag body -->
                    <path d="M40 75 L160 75 L170 180 L30 180 Z" 
                          stroke="#ddd" 
                          stroke-width="7" 
                          fill="none" 
                          stroke-linejoin="round"/>
                    
                    <!-- Single handle -->
                    <path d="M65 75 C65 45, 135 45, 135 75" 
                          stroke="#ddd" 
                          stroke-width="7" 
                          fill="none" 
                          stroke-linecap="round"/>
                </svg>
            </div>
            <h2 class="empty-bag-title">Your Bag is Empty</h2>
            <p class="empty-bag-message">Order some delicious smoothies!</p>
            <a href="index.html" class="empty-bag-button">Start Ordering</a>
        </div>
        `;
        
        // Hide subtotal and buttons
        const bagSubtotal = document.querySelector('.bag-subtotal');
        const bagActionButtons = document.querySelector('.bag-action-buttons');
        if (bagSubtotal) bagSubtotal.style.display = 'none';
        if (bagActionButtons) bagActionButtons.style.display = 'none';
        
        return;
    }

    // Show subtotal and buttons if hidden
    const bagSubtotal = document.querySelector('.bag-subtotal');
    const bagActionButtons = document.querySelector('.bag-action-buttons');
    if (bagSubtotal) bagSubtotal.style.display = 'flex';
    if (bagActionButtons) bagActionButtons.style.display = 'grid';

    const ingredientImages = {
        'Mixed Berry': 'ingredients/mixberries.png',
        'Pineapple': 'ingredients/pineapple.png',
        'Strawberry': 'ingredients/strawberry.png',
        'Mango': 'ingredients/mango.png',
        'Banana': 'ingredients/banana.png',
        'Spinach': 'ingredients/spinach.png',
        'Kale': 'ingredients/kale.png'
    };

    // Render all items
    bagItemsContainer.innerHTML = '';
    items.forEach((item, index) => {
        const itemTotal = Cart.calculateItemTotal(item.size, item.addons, item.quantity);
        
        let detailsHTML = '';
        
        if (item.size) {
            detailsHTML += '<div class="detail-section">';
            const sizeText = item.size.charAt(0).toUpperCase() + item.size.slice(1);
            detailsHTML += `<span class="detail-badge detail-size">${sizeText}</span>`;
            detailsHTML += '</div>';
        }
        
        if (item.ingredients && item.ingredients.length > 0) {
            detailsHTML += '<div class="detail-section">';
            item.ingredients.forEach(ingredient => {
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
        
        if (item.addons && item.addons.length > 0) {
            detailsHTML += '<div class="detail-section">';
            item.addons.forEach(addon => {
                detailsHTML += `<span class="detail-badge detail-addon">${addon} (+$0.50)</span>`;
            });
            detailsHTML += '</div>';
        }

        const itemHTML = `
            <div class="bag-item" data-index="${index}">
                <div class="bag-item-image">
                    <img src="Smoothie_images/custom.png" alt="Custom Smoothie">
                </div>
                <div class="bag-item-details">
                    <div class="bag-item-header">
                        <span class="bag-item-name">Custom Smoothie</span>
                        <span class="bag-item-price">${Cart.formatPrice(itemTotal)}</span>
                    </div>
                    <div class="order-details">${detailsHTML}</div>
                    <div class="bag-item-actions">
                        <a href="#" class="bag-action-link edit-item" data-index="${index}">Edit</a>
                        <a href="#" class="bag-action-link remove-item" data-index="${index}">Remove</a>
                        <div class="bag-quantity-controls">
                            <button class="quantity-button minus" data-index="${index}">−</button>
                            <span class="quantity">${item.quantity}</span>
                            <button class="quantity-button plus" data-index="${index}">+</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        bagItemsContainer.insertAdjacentHTML('beforeend', itemHTML);
    });

    // Update subtotal
    const totals = Cart.calculateCartTotals();
    const subtotalElement = document.querySelector('.bag-subtotal-amount');
    if (subtotalElement) {
        subtotalElement.textContent = Cart.formatPrice(totals.subtotal);
    }

    // Add event listeners for edit buttons
    document.querySelectorAll('.edit-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.dataset.index);
            Cart.setEditingIndex(index);
            window.location.href = 'customize.html';
        });
    });

    // Add event listeners for remove buttons
    document.querySelectorAll('.remove-item').forEach(btn => {
        btn.addEventListener('click', function(e) {
            e.preventDefault();
            const index = parseInt(this.dataset.index);
            showRemoveModal(index);
        });
    });

    // Add event listeners for quantity buttons
    document.querySelectorAll('.quantity-button.minus').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const items = Cart.getItems();
            if (items[index].quantity > 1) {
                items[index].quantity--;
                Cart.updateItem(index, items[index]);
                initBagPage(); // Refresh
            }
        });
    });

    document.querySelectorAll('.quantity-button.plus').forEach(btn => {
        btn.addEventListener('click', function() {
            const index = parseInt(this.dataset.index);
            const items = Cart.getItems();
            items[index].quantity++;
            Cart.updateItem(index, items[index]);
            initBagPage(); // Refresh
        });
    });

    // Add more items button - clear editing state
    const addMoreBtn = document.getElementById('addMoreItems');
    if (addMoreBtn) {
        addMoreBtn.addEventListener('click', function(e) {
            e.preventDefault();
            Cart.setEditingIndex(null);
            window.location.href = 'customize.html';
        });
    }

    // Remove modal functionality
    function showRemoveModal(index) {
        const removeModal = document.getElementById('removeModal');
        if (removeModal) {
            removeModal.classList.add('active');
            
            const confirmRemove = document.getElementById('confirmRemove');
            const cancelRemove = document.getElementById('cancelRemove');
            
            // Remove old listeners
            const newConfirm = confirmRemove.cloneNode(true);
            confirmRemove.parentNode.replaceChild(newConfirm, confirmRemove);
            
            newConfirm.addEventListener('click', () => {
                Cart.removeItem(index);
                removeModal.classList.remove('active');
                initBagPage(); // Refresh to show empty state if needed
            });
            
            cancelRemove.onclick = () => {
                removeModal.classList.remove('active');
            };
            
            removeModal.onclick = (e) => {
                if (e.target === removeModal) {
                    removeModal.classList.remove('active');
                }
            };
        }
    }
}

// ============================================
// CHECKOUT PAGE
// ============================================

function initCheckoutPage() {
    const radioInputs = document.querySelectorAll('.radio-input');
    if (!radioInputs.length) return; // Not on checkout page

    const items = Cart.getItems();
    const totals = Cart.calculateCartTotals();
    
    if (items.length > 0 && totals) {
        const summaryItems = document.querySelectorAll('.summary-item');
        
        // Build display for all items
        let allItemsHTML = '';
        items.forEach((item, index) => {
            const itemTotal = Cart.calculateItemTotal(item.size, item.addons, item.quantity);
            let detailsText = '';
            
            if (item.size) {
                detailsText += item.size.charAt(0).toUpperCase() + item.size.slice(1) + ', ';
            }
            
            if (item.ingredients.length > 0) {
                detailsText += item.ingredients.join(' ');
            }
            
            allItemsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${index < items.length - 1 ? '15px' : '0'};">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${item.quantity}x Custom Smoothie</div>
                        <div style="font-size: 13px; color: #666; line-height: 1.4;">${detailsText}</div>
                    </div>
                    <div style="font-weight: 600; margin-left: 15px; white-space: nowrap;">${Cart.formatPrice(itemTotal)}</div>
                </div>
            `;
        });
        
        // Update first summary item with all items
        if (summaryItems.length >= 4) {
            const firstItem = summaryItems[0];
            firstItem.style.display = 'block';
            firstItem.innerHTML = allItemsHTML;
            
            // Update totals
            summaryItems[1].querySelector('span:last-child').textContent = Cart.formatPrice(totals.subtotal);
            summaryItems[2].querySelector('span:last-child').textContent = Cart.formatPrice(totals.tax);
            summaryItems[3].querySelector('span:last-child').textContent = Cart.formatPrice(totals.tip);
        }
        
        const summaryTotal = document.querySelector('.summary-total span:last-child');
        if (summaryTotal) {
            summaryTotal.textContent = Cart.formatPrice(totals.total);
        }
    }

    // Radio button selection handler
    radioInputs.forEach(radio => {
        radio.addEventListener('change', function() {
            const radioGroup = document.querySelectorAll(`input[name="${this.name}"]`);
            
            radioGroup.forEach(r => {
                r.closest('.radio-option').classList.remove('selected');
            });
            
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
            tipButtons.forEach(btn => btn.classList.remove('selected'));
            this.classList.add('selected');
        });
    });

    // Time modal functionality
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
                const laterOption = document.querySelector('input[value="later"]');
                if (laterOption) {
                    const laterOptionParent = laterOption.closest('.radio-option');
                    const sublabel = laterOptionParent.querySelector('.radio-sublabel');
                    if (sublabel) {
                        sublabel.textContent = selectedTime.value;
                    }
                }
                
                if (timeModal) timeModal.classList.remove('active');
            }
        });
    }

    // Apple Pay modal functionality
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
    if (!receiptItems.length) return;

    const items = Cart.getItems();
    const totals = Cart.calculateCartTotals();
    
    if (items.length > 0 && totals) {
        // Build display for all items
        let allItemsHTML = '';
        items.forEach((item, index) => {
            const itemTotal = Cart.calculateItemTotal(item.size, item.addons, item.quantity);
            let detailsText = '';
            
            if (item.size) {
                detailsText += item.size.charAt(0).toUpperCase() + item.size.slice(1) + ' ';
            }
            
            if (item.ingredients.length > 0) {
                detailsText += item.ingredients.join(' ') + ' ';
            }
            
            if (item.addons.length > 0) {
                detailsText += item.addons.join(' ');
            }
            
            allItemsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${index < items.length - 1 ? '15px' : '0'};">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${item.quantity}x Custom Smoothie</div>
                        <div style="font-size: 13px; color: #666; line-height: 1.4;">${detailsText}</div>
                    </div>
                    <div style="font-weight: 600; margin-left: 15px; white-space: nowrap;">${Cart.formatPrice(itemTotal)}</div>
                </div>
            `;
        });
        
        // Update first receipt item - replace entire content
        const firstItem = receiptItems[0];
        firstItem.style.display = 'block';
        firstItem.innerHTML = allItemsHTML;
        
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
            allReceiptItems[subtotalIndex].querySelector('span:last-child').textContent = Cart.formatPrice(totals.subtotal);
            if (allReceiptItems[subtotalIndex + 1]) {
                allReceiptItems[subtotalIndex + 1].querySelector('span:last-child').textContent = Cart.formatPrice(totals.tax);
            }
            if (allReceiptItems[subtotalIndex + 2]) {
                allReceiptItems[subtotalIndex + 2].querySelector('span:last-child').textContent = Cart.formatPrice(totals.tip);
            }
        }
        
        const receiptTotal = document.querySelector('.receipt-total span:last-child');
        if (receiptTotal) {
            receiptTotal.textContent = Cart.formatPrice(totals.total);
        }
    }
}

// ============================================
// STATUS PAGE
// ============================================

function initStatusPage() {
    const receiptItems = document.querySelectorAll('.receipt-item');
    if (!receiptItems.length) return;

    const items = Cart.getItems();
    const totals = Cart.calculateCartTotals();
    
    if (items.length > 0 && totals) {
        // Build display for all items
        let allItemsHTML = '';
        items.forEach((item, index) => {
            const itemTotal = Cart.calculateItemTotal(item.size, item.addons, item.quantity);
            let detailsText = '';
            
            if (item.size) {
                detailsText += item.size.charAt(0).toUpperCase() + item.size.slice(1) + ' ';
            }
            
            if (item.ingredients.length > 0) {
                detailsText += item.ingredients.join(' ') + ' ';
            }
            
            if (item.addons.length > 0) {
                detailsText += item.addons.join(' ');
            }
            
            allItemsHTML += `
                <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: ${index < items.length - 1 ? '15px' : '0'};">
                    <div style="flex: 1;">
                        <div style="font-weight: 600; margin-bottom: 4px;">${item.quantity}x Custom Smoothie</div>
                        <div style="font-size: 13px; color: #666; line-height: 1.4;">${detailsText}</div>
                    </div>
                    <div style="font-weight: 600; margin-left: 15px; white-space: nowrap;">${Cart.formatPrice(itemTotal)}</div>
                </div>
            `;
        });
        
        // Update first receipt item - replace entire content
        const firstItem = receiptItems[0];
        firstItem.style.display = 'block';
        firstItem.innerHTML = allItemsHTML;
        
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
            allReceiptItems[subtotalIndex].querySelector('span:last-child').textContent = Cart.formatPrice(totals.subtotal);
            if (allReceiptItems[subtotalIndex + 1]) {
                allReceiptItems[subtotalIndex + 1].querySelector('span:last-child').textContent = Cart.formatPrice(totals.tax);
            }
            if (allReceiptItems[subtotalIndex + 2]) {
                allReceiptItems[subtotalIndex + 2].querySelector('span:last-child').textContent = Cart.formatPrice(totals.tip);
            }
        }
        
        const receiptTotal = document.querySelector('.receipt-total span:last-child');
        if (receiptTotal) {
            receiptTotal.textContent = Cart.formatPrice(totals.total);
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