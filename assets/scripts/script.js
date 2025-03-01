/**
 * Multi-step Form Handler
 * Implements form validation, state management, and UI updates for a multi-step form
 * with live validation feedback
 */

// Form Configuration
const PLANS = {
    monthly: [9, 12, 15],
    yearly: [90, 120, 150]
};

const ADD_ONS = {
    monthly: [1, 2, 3],
    yearly: [10, 20, 30]
};

// Form State Management using a class-based approach
class FormStateManager {
    constructor() {
        this.currentIndex = 0;
        this.completedSteps = [false, false, false, false];
        this.isYearlyBilling = false;

        this.formData = {
            step1: {
                name: "",
                email: "",
                phoneNumber: ""
            },
            step2: {
                billing: "",
                billingPrice: 0
            },
            step3: {
                addOns: [],
                addOnsPrice: 0
            }
        };

        // Step Configuration
        this.steps = [
            {
                title: "Personal info",
                description: "Please provide your name, email address, and phone number.",
                validation: this.validatePersonalInfo.bind(this)
            },
            {
                title: "Select your plan",
                description: "You have the option of monthly or yearly billing.",
                validation: this.validateBillingPlan.bind(this)
            },
            {
                title: "Pick add-ons",
                description: "Add-ons help enhance your gaming experience.",
                validation: this.validateAddOns.bind(this)
            },
            {
                title: "Finishing up",
                description: "Double-check everything looks OK before confirming.",
                validation: this.validateSummary.bind(this)
            }
        ];

        this.validationRules = {
            name: {
                validate: (value) => value.trim() !== '',
                message: 'Name is required'
            },
            email: {
                validate: (value) => {
                    const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                    return value.trim() !== '' && emailPattern.test(value.trim());
                },
                message: 'Please enter a valid email address'
            },
            phone: {
                validate: (value) => {
                    const phonePattern = /^\+?[1-9]\d{1,14}$/;
                    return value.trim() !== '' && phonePattern.test(value.trim());
                },
                message: 'Please enter a valid phone number'
            }
        };

        this.initDOMElements();
        this.bindEvents();
        this.setupLiveValidation();
        this.updateStep();
    }

    // Initialize DOM references
    initDOMElements() {
        this.elements = {
            form: document.getElementById("userForm"),
            formTitle: document.getElementById("form-title"),
            formDescription: document.getElementById("form-info"),
            nextBtn: document.getElementById("next-btn"),
            backBtn: document.getElementById("back-btn"),
            confirmBtn: document.getElementById("confirm-btn"),
            selectedPlan: document.getElementById("plan-title"),
            planPrice: document.getElementById("plan-price"),
            additionalsContainer: document.querySelector(".additionals"),
            stepNums: document.querySelectorAll(".step-num"),
            stepsContent: document.querySelectorAll(".steps"),
            totalPriceElement: document.getElementById("total-price"),
            changeBtn: document.getElementById("change_btn"),
            switchBilling: document.getElementById("switch"),
            planType: document.getElementById("plan-type"),
            totalInfo: document.getElementById("total-info"),
            personalInfoInputs: {
                name: document.querySelector('input[name="name"]'),
                email: document.querySelector('input[name="email"]'),
                phone: document.querySelector('input[name="phone"]')
            }
        };
    }

    // Set up live validation for all form inputs
    setupLiveValidation() {
        const { personalInfoInputs } = this.elements;

        // Set up input event listeners for text fields
        Object.entries(personalInfoInputs).forEach(([fieldName, input]) => {
            if (!input) return;

            // Add input and blur event listeners for live validation
            input.addEventListener('input', () => this.validateField(fieldName, input));
            input.addEventListener('blur', () => this.validateField(fieldName, input));
        });

        // Set up change listeners for radio buttons and checkboxes
        const billingOptions = document.querySelectorAll('input[name="billing"]');
        billingOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.validateBillingPlan();
            });
        });

        const addOnOptions = document.querySelectorAll('input[name="add-ons"]');
        addOnOptions.forEach(option => {
            option.addEventListener('change', () => {
                this.validateAddOns();
            });
        });
    }

    /**
     * Validates a specific field using defined validation rules
     * @param {string} fieldName - The name of the field to validate
     * @param {HTMLElement} input - The input element to validate
     * @returns {boolean} - Whether the field is valid
     */
    validateField(fieldName, input) {
        if (!input || !this.validationRules[fieldName]) return false;

        const rule = this.validationRules[fieldName];
        const isValid = rule.validate(input.value);

        this.toggleValidationUI(input, isValid);

        // Update validation message if needed
        const parentDiv = input.closest('div');
        if (parentDiv) {
            const validationMessage = parentDiv.querySelector('.validation-message');
            if (validationMessage) {
                validationMessage.textContent = isValid ? '' : rule.message;
            }
        }

        // Update form data if valid
        if (isValid) {
            if (fieldName === 'name') this.formData.step1.name = input.value.trim();
            if (fieldName === 'email') this.formData.step1.email = input.value.trim();
            if (fieldName === 'phone') this.formData.step1.phoneNumber = input.value.trim();
        }

        return isValid;
    }

    // Bind all event listeners
    bindEvents() {
        const { form, nextBtn, backBtn, changeBtn, stepNums, switchBilling } = this.elements;

        if (changeBtn) {
            changeBtn.addEventListener("click", this.handleChangePlan.bind(this));
        }

        if (nextBtn) {
            nextBtn.addEventListener("click", this.handleNextStep.bind(this));
        }

        if (backBtn) {
            backBtn.addEventListener("click", this.handlePrevStep.bind(this));
        }

        if (form) {
            form.addEventListener("submit", this.handleSubmit.bind(this));
        }

        // Step navigation click handlers
        if (stepNums) {
            stepNums.forEach((step, index) => {
                step.addEventListener("click", () => this.handleStepNavigation(index));
            });
        }

        if (switchBilling) {
            switchBilling.addEventListener("change", this.handleBillingToggle.bind(this));
        }
    }

    /**
     * Extracts a numeric price from a string, handling currency symbols
     * @param {string} priceText - Price text (e.g. "$9.99")
     * @returns {number} - Parsed price
     */
    extractPrice(priceText) {
        if (!priceText) return 0;
        // Remove currency symbols and other non-numeric characters except decimal point
        const numericString = priceText.replace(/[^\d.-]/g, '');
        return parseFloat(numericString) || 0;
    }

    /**
     * Updates the total price display
     */
    updateTotalPrice() {
        const { totalPriceElement, planType, totalInfo } = this.elements;
        const totalPrice = this.formData.step2.billingPrice + this.formData.step3.addOnsPrice;

        if (!totalPriceElement) return;

        if (this.isYearlyBilling) {
            totalPriceElement.textContent = `$${totalPrice.toFixed(2)}/Yr`;
            if (planType) planType.textContent = "Yr";
            if (totalInfo) totalInfo.textContent = "Total (per year)";
        } else {
            totalPriceElement.textContent = `$${totalPrice.toFixed(2)}/Mo`;
            if (planType) planType.textContent = "Mo";
            if (totalInfo) totalInfo.textContent = "Total (per month)";
        }
    }

    /**
     * Toggles validation error UI
     * @param {HTMLElement} element - Form element to validate
     * @param {boolean} isValid - Whether the element is valid
     */
    toggleValidationUI(element, isValid) {
        if (!element) return;

        const parentDiv = element.closest('div');
        if (!parentDiv) return;

        const validationMessage = parentDiv.querySelector('.validation-message');

        if (isValid) {
            element.classList.remove('invalid');
            validationMessage?.classList.add('d-none');
        } else {
            element.classList.add('invalid');
            validationMessage?.classList.remove('d-none');
        }
    }

    /**
     * Resets all validation UI elements
     * @param {string} selector - CSS selector for elements to reset
     */
    resetValidationUI(selector) {
        document.querySelectorAll(selector).forEach(input => {
            input.classList.remove('invalid');
            const parentDiv = input.closest('div');
            if (parentDiv) {
                const validationMessage = parentDiv.querySelector('.validation-message');
                validationMessage?.classList.add('d-none');
            }
        });
    }

    // Validation Functions
    validatePersonalInfo() {
        const { personalInfoInputs } = this.elements;
        let isValid = true;

        // Validate each field and accumulate the results
        Object.entries(personalInfoInputs).forEach(([fieldName, input]) => {
            if (!input) {
                isValid = false;
                return;
            }

            const fieldValid = this.validateField(fieldName, input);
            isValid = isValid && fieldValid;
        });

        return isValid;
    }

    validateBillingPlan() {
        const billing = document.querySelector('input[name="billing"]:checked');
        const billingInputs = document.querySelectorAll('input[name="billing"]');

        this.resetValidationUI('input[name="billing"]');

        if (!billing) {
            billingInputs.forEach(input => this.toggleValidationUI(input, false));
            return false;
        }

        this.formData.step2.billing = billing.value;

        // Extract and store the billing price
        const billingPriceElement = billing.closest('.custom_radio')?.querySelector('.billing-price');
        this.formData.step2.billingPrice = billingPriceElement ?
            this.extractPrice(billingPriceElement.textContent) : 0;

        this.updateTotalPrice();
        return true;
    }

    validateAddOns() {
        const addOns = document.querySelectorAll('input[name="add-ons"]:checked');
        const addOnInputs = document.querySelectorAll('input[name="add-ons"]');

        this.resetValidationUI('input[name="add-ons"]');

        if (addOns.length === 0) {
            addOnInputs.forEach(input => this.toggleValidationUI(input, false));
            return false;
        }

        // Create an array of objects with title and price for each selected add-on
        this.formData.step3.addOns = Array.from(addOns).map(addOn => {
            const addOnContainer = addOn.closest('.add-ons-checkbox');
            // Try both class name variants
            const titleElement = addOnContainer?.querySelector('.add-ons-title') ||
                addOnContainer?.querySelector('.add-ons_title');

            const priceElement = addOnContainer?.querySelector('.add-ons-price');

            const title = titleElement ? titleElement.textContent.trim() : 'Unknown Add-on';
            const price = priceElement ? this.extractPrice(priceElement.textContent) : 0;

            return { title, price };
        });

        // Calculate the total price of selected add-ons
        this.formData.step3.addOnsPrice = this.formData.step3.addOns.reduce(
            (total, addOn) => total + addOn.price, 0
        );

        this.updateTotalPrice();
        return true;
    }

    validateSummary() {
        return true;
    }

    /**
     * Updates summary step UI with selected plan and add-ons
     */
    updateSummaryStep() {
        const { planPrice, selectedPlan, additionalsContainer } = this.elements;

        // Display the selected plan price and name
        if (planPrice) planPrice.textContent = `${this.formData.step2.billingPrice.toFixed(2)}`;
        if (selectedPlan) selectedPlan.textContent = this.formData.step2.billing;

        // Clear and rebuild the additionals container
        if (additionalsContainer) {
            additionalsContainer.innerHTML = '';

            // Append each additional item
            this.formData.step3.addOns.forEach((addOn) => {
                const additionalDiv = document.createElement('div');
                additionalDiv.classList.add('additional');

                const priceSuffix = this.isYearlyBilling ? '/yr' : '/mo';
                additionalDiv.innerHTML = `
          <h4>${addOn.title}</h4>
          <h5>+$${addOn.price.toFixed(2)}${priceSuffix}</h5>
        `;

                additionalsContainer.appendChild(additionalDiv);
            });
        }
    }

    /**
     * Validates the current step and returns whether it's valid
     * @returns {boolean} - Whether the current step is valid
     */
    validateStep() {
        const isValid = this.steps[this.currentIndex].validation();
        if (isValid) {
            this.completedSteps[this.currentIndex] = true;
        }
        return isValid;
    }

    /**
     * Updates the UI based on the current step
     */
    updateStep() {
        const { stepNums, stepsContent, formTitle, formDescription, backBtn, nextBtn, confirmBtn } = this.elements;

        // Update step indicator UI
        stepNums?.forEach((step, index) => {
            step.classList.toggle("active", index === this.currentIndex);
        });

        // Show/hide appropriate step content
        stepsContent?.forEach((content, index) => {
            content.classList.toggle("d-block", index === this.currentIndex);
            content.classList.toggle("d-none", index !== this.currentIndex);
        });

        // Update step title and description
        if (formTitle) formTitle.textContent = this.steps[this.currentIndex].title;
        if (formDescription) formDescription.textContent = this.steps[this.currentIndex].description;

        // Toggle navigation buttons
        if (backBtn) {
            backBtn.classList.toggle("visible", this.currentIndex > 0);
            backBtn.classList.toggle("unvisible", this.currentIndex === 0);
        }

        if (nextBtn) {
            nextBtn.classList.toggle("d-block", this.currentIndex < stepNums.length - 1);
            nextBtn.classList.toggle("d-none", this.currentIndex === stepNums.length - 1);
        }

        if (confirmBtn) {
            confirmBtn.classList.toggle("d-block", this.currentIndex === stepNums.length - 1);
            confirmBtn.classList.toggle("d-none", this.currentIndex < stepNums.length - 1);
        }

        // Update summary UI if on the last step
        if (this.currentIndex === 3) {
            this.updateSummaryStep();
        }
    }

    // Event Handlers
    handleChangePlan() {
        this.currentIndex = 1;
        this.updateStep();
    }

    handleNextStep() {
        if (this.validateStep() && this.currentIndex < this.elements.stepNums.length - 1) {
            this.currentIndex++;
            this.updateStep();
        }
    }

    handlePrevStep() {
        if (this.currentIndex > 0) {
            this.currentIndex--;
            this.updateStep();
        }
    }

    handleStepNavigation(index) {
        // Prevent interactions if the form is completed
        if (this.completedSteps[this.completedSteps.length - 1]) return;

        // Don't allow moving forward if current step isn't completed
        if (index > this.currentIndex && !this.completedSteps[this.currentIndex]) {
            return;
        }

        // Allow backward navigation anytime
        if (index <= this.currentIndex) {
            this.currentIndex = index;
            this.updateStep();
        }
        // Allow forward navigation only if previous steps completed
        else if (this.completedSteps[index - 1]) {
            this.currentIndex = index;
            this.updateStep();
        }
    }

    handleBillingToggle(e) {
        const yearly = document.getElementById("yearly");
        const monthly = document.getElementById("monthly");
        const billingsBottom = document.querySelectorAll(".billings-bottom");
        const addOnsInfo = document.querySelectorAll(".add-ons__info");

        this.isYearlyBilling = e.target.checked;

        if (this.isYearlyBilling) {
            monthly?.classList.remove("active");
            yearly?.classList.add("active");

            billingsBottom.forEach((billing, index) => {
                billing.innerHTML = `
          <p>$<span class="billing-price">${PLANS.yearly[index]}</span>/yr</p>
          <p class="billing-price__free">2 months free</p>
        `;
            });

            addOnsInfo.forEach((info, index) => {
                info.innerHTML = `
          <h5>+$<span class="add-ons-price">${ADD_ONS.yearly[index]}</span>/yr</h5>
        `;
            });
        } else {
            yearly?.classList.remove("active");
            monthly?.classList.add("active");

            billingsBottom.forEach((billing, index) => {
                billing.innerHTML = `
          <p>$<span class="billing-price">${PLANS.monthly[index]}</span>/mo</p>
        `;
            });

            addOnsInfo.forEach((info, index) => {
                info.innerHTML = `
          <h5>+$<span class="add-ons-price">${ADD_ONS.monthly[index]}</span>/mo</h5>
        `;
            });
        }

        // Re-validate the billing plan after switching
        this.validateBillingPlan();
    }

    handleSubmit(e) {
        e.preventDefault();

        if (typeof swal === 'undefined') {
            console.error('SweetAlert is not defined. Make sure it is properly loaded.');
            // Fallback to browser's built-in confirm
            if (!window.confirm("Are you sure you want to submit the form? You will not be able to edit it.")) {
                return;
            }

            if (!this.validateStep()) {
                alert("Please fill in all required fields.");
                return;
            }

            this.completeForm();
            return;
        }

        swal({
            title: "Are you sure?",
            text: "If you submit the form, you will not be able to edit it!",
            icon: "warning",
            buttons: true,
        })
            .then((willConfirm) => {
                if (willConfirm) {
                    if (!this.validateStep()) {
                        swal("Please fill in all required fields.");
                        return;
                    }

                    this.completeForm();
                } else {
                    swal("Form not submitted!");
                }
            })
            .catch(error => {
                console.error('SweetAlert error:', error);
                alert('An error occurred while processing your submission. Please try again.');
            });
    }

    /**
     * Complete the form submission and show thank you page
     */
    completeForm() {
        const { stepsContent, formTitle, formDescription } = this.elements;

        // Hide current step content
        if (stepsContent[this.currentIndex]) {
            stepsContent[this.currentIndex].classList.remove("d-block");
            stepsContent[this.currentIndex].classList.add("d-none");
        }

        // Show thank you/confirmation step
        const thankYouStep = stepsContent.length - 1;
        if (stepsContent[thankYouStep]) {
            stepsContent[thankYouStep].classList.remove("d-none");
            stepsContent[thankYouStep].classList.add("d-block");
        }

        // Hide form elements
        if (formTitle) formTitle.classList.add("d-none");
        if (formDescription) formDescription.classList.add("d-none");

        // Remove action buttons
        const actionButtons = document.querySelector(".action-buttons");
        if (actionButtons) actionButtons.remove();

        // Log final form data
        console.log('Form submitted with data:', this.formData);
    }
}

// Initialize the form when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    try {
        new FormStateManager();
        console.log('Form handler initialized successfully');
    } catch (error) {
        console.error('Error initializing form handler:', error);
    }
});