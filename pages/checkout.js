// Radio button selection handler
const radioInputs = document.querySelectorAll('.radio-input');

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

        // Open modal if "Schedule for later" is selected
        if (this.name === 'pickup-time' && this.value === 'later') {
            document.getElementById('timeModal').classList.add('active');
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

// Handle time slot selection
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

// Close modal
closeModal.addEventListener('click', () => {
    timeModal.classList.remove('active');
});

// Close modal when clicking overlay
timeModal.addEventListener('click', (e) => {
    if (e.target === timeModal) {
        timeModal.classList.remove('active');
    }
});

// Confirm time selection
confirmTime.addEventListener('click', () => {
    const selectedTime = document.querySelector('.time-radio:checked');
    
    if (selectedTime) {
        // Update the "Schedule for later" label with selected time
        const laterOption = document.querySelector('input[value="later"]').closest('.radio-option');
        const sublabel = laterOption.querySelector('.radio-sublabel');
        sublabel.textContent = selectedTime.value;
        
        // Close modal
        timeModal.classList.remove('active');
    }
});

const laterOption = document.querySelector('input[value="later"]').closest('.radio-option');
laterOption.addEventListener('click', () => {
    if (document.querySelector('input[value="later"]').checked) {
        document.getElementById('timeModal').classList.add('active');
    }
});