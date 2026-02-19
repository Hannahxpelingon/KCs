// Ingredient selection (max 3)
const ingredientCheckboxes = document.querySelectorAll('.ingredient-checkbox');

ingredientCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const parent = this.closest('.ingredient-button');
        const checkedCount = document.querySelectorAll('.ingredient-checkbox:checked').length;
        
        if (this.checked) {
            // Check if already at limit before checking
            if (checkedCount > 3) {
                this.checked = false;
                return; // Stop here, don't add selected class
            }
            parent.classList.add('selected');
        } else {
            parent.classList.remove('selected');
        }
    });
});

// Addon selection
const addonCheckboxes = document.querySelectorAll('.addon-checkbox');

addonCheckboxes.forEach(checkbox => {
    checkbox.addEventListener('change', function() {
        const parent = this.closest('.addon-item');
        
        if (this.checked) {
            parent.classList.add('selected');
        } else {
            parent.classList.remove('selected');
        }
    });
});

// Size selection (only one can be selected)
const sizeRadios = document.querySelectorAll('.size-radio');

sizeRadios.forEach(radio => {
    radio.addEventListener('change', function() {
        // Remove selected from all size buttons
        document.querySelectorAll('.size-button').forEach(btn => {
            btn.classList.remove('selected');
        });
        
        // Add selected to the parent of the checked radio
        if (this.checked) {
            this.closest('.size-button').classList.add('selected');
        }
    });
});

// Quantity controls
const minusButton = document.querySelector('.quantity-button.minus');
const plusButton = document.querySelector('.quantity-button.plus');
const quantityDisplay = document.querySelector('.quantity');
let quantity = 1;

minusButton.addEventListener('click', () => {
    if (quantity > 1) {
        quantity--;
        quantityDisplay.textContent = quantity;
    }
});

plusButton.addEventListener('click', () => {
    quantity++;
    quantityDisplay.textContent = quantity;
});