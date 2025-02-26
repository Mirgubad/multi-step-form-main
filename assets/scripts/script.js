/**
 * Multi-step Form Handler
 * Implements form validation, state management, and UI updates for a multi-step form
 */

// DOM Elements
const form = document.getElementById("userForm");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-info");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const confirmBtn = document.getElementById("confirm-btn");
const selectedPlan = document.getElementById("plan-title");
const planPrice = document.getElementById("plan-price");
const additionalsContainer = document.querySelector(".additionals");
const stepNums = document.querySelectorAll(".step-num");
const stepsContent = document.querySelectorAll(".steps");
const totalPriceElement = document.getElementById("total-price");
const changeBtn = document.getElementById("change_btn");

// Form State
let currentIndex = 0;
const completedSteps = [false, false, false, false];

// Form Data Store
const formDataObject = {
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

/**
 * Extracts a numeric price from a string, handling currency symbols
 * @param {string} priceText - Price text (e.g. "$9.99")
 * @returns {number} - Parsed price
 */
const extractPrice = (priceText) => {
    if (!priceText) return 0;
    // Remove currency symbols and other non-numeric characters except decimal point
    const numericString = priceText.replace(/[^\d.-]/g, '');
    return parseFloat(numericString) || 0;
};

/**
 * Updates the total price display
 */
const updateTotalPrice = () => {
    const totalPrice = formDataObject.step2.billingPrice + formDataObject.step3.addOnsPrice;
    if (totalPriceElement) {
        totalPriceElement.textContent = `$${totalPrice.toFixed(2)}`;
    }
};

/**
 * Toggles validation error UI
 * @param {HTMLElement} element - Form element to validate
 * @param {boolean} isValid - Whether the element is valid
 */
const toggleValidationUI = (element, isValid) => {
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
};

/**
 * Resets all validation UI elements
 * @param {string} selector - CSS selector for elements to reset
 */
const resetValidationUI = (selector) => {
    document.querySelectorAll(selector).forEach(input => {
        input.classList.remove('invalid');
        const parentDiv = input.closest('div');
        if (parentDiv) {
            const validationMessage = parentDiv.querySelector('.validation-message');
            validationMessage?.classList.add('d-none');
        }
    });
};

// Step Validation Functions
const stepValidations = {
    // Personal Info Validation
    validatePersonalInfo: () => {
        const name = document.querySelector('input[name="name"]');
        const email = document.querySelector('input[name="email"]');
        const phone = document.querySelector('input[name="phone"]');

        resetValidationUI('input');

        let isValid = true;

        // Name validation
        const nameValid = name.value.trim() !== '';
        toggleValidationUI(name, nameValid);
        if (nameValid) {
            formDataObject.step1.name = name.value.trim();
        } else {
            isValid = false;
        }

        // Email validation
        const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const emailValid = email.value.trim() !== '' && emailPattern.test(email.value.trim());
        toggleValidationUI(email, emailValid);
        if (emailValid) {
            formDataObject.step1.email = email.value.trim();
        } else {
            isValid = false;
        }

        // Phone validation
        const phonePattern = /^\+?[1-9]\d{1,14}$/;
        const phoneValid = phone.value.trim() !== '' && phonePattern.test(phone.value.trim());
        toggleValidationUI(phone, phoneValid);
        if (phoneValid) {
            formDataObject.step1.phoneNumber = phone.value.trim();
        } else {
            isValid = false;
        }

        return isValid;
    },

    // Billing Plan Validation
    validateBillingPlan: () => {
        const billing = document.querySelector('input[name="billing"]:checked');
        const billingInputs = document.querySelectorAll('input[name="billing"]');

        resetValidationUI('input[name="billing"]');

        if (!billing) {
            billingInputs.forEach(input => toggleValidationUI(input, false));
            return false;
        }

        formDataObject.step2.billing = billing.value;

        // Extract and store the billing price
        const billingPriceElement = billing.closest('.custom_radio')?.querySelector('.billing-price');
        formDataObject.step2.billingPrice = billingPriceElement ?
            extractPrice(billingPriceElement.textContent) : 0;

        updateTotalPrice();
        return true;
    },

    // Add-ons Validation
    validateAddOns: () => {
        const addOns = document.querySelectorAll('input[name="add-ons"]:checked');
        const addOnInputs = document.querySelectorAll('input[name="add-ons"]');

        resetValidationUI('input[name="add-ons"]');

        if (addOns.length === 0) {
            addOnInputs.forEach(input => toggleValidationUI(input, false));
            return false;
        }

        // Create an array of objects with title and price for each selected add-on
        formDataObject.step3.addOns = Array.from(addOns).map(addOn => {
            const addOnContainer = addOn.closest('.add-ons-checkbox');
            // Fix: Use consistent class name - try both variants
            const titleElement =
                addOnContainer.querySelector('.add-ons-title') ||
                addOnContainer.querySelector('.add-ons_title');

            const priceElement = addOnContainer.querySelector('.add-ons-price');

            const title = titleElement ? titleElement.textContent.trim() : 'Unknown Add-on';
            const price = priceElement ? extractPrice(priceElement.textContent) : 0;

            return { title, price };
        });

        // Calculate the total price of selected add-ons
        formDataObject.step3.addOnsPrice = formDataObject.step3.addOns.reduce(
            (total, addOn) => total + addOn.price, 0
        );

        updateTotalPrice();
        return true;
    },

    // Summary Step Validation (always valid)
    validateSummary: () => true
};

// Step Configuration
const steps = [
    {
        title: "Personal info",
        description: "Please provide your name, email address, and phone number.",
        validation: stepValidations.validatePersonalInfo
    },
    {
        title: "Select your plan",
        description: "You have the option of monthly or yearly billing.",
        validation: stepValidations.validateBillingPlan
    },
    {
        title: "Pick add-ons",
        description: "Add-ons help enhance your gaming experience.",
        validation: stepValidations.validateAddOns
    },
    {
        title: "Finishing up",
        description: "Double-check everything looks OK before confirming.",
        validation: stepValidations.validateSummary
    }
];

/**
 * Updates summary step UI with selected plan and add-ons
 */
const updateSummaryStep = () => {
    // Display the selected plan price and name
    if (planPrice) planPrice.textContent = `${formDataObject.step2.billingPrice.toFixed(2)}`;
    if (selectedPlan) selectedPlan.textContent = formDataObject.step2.billing;

    // Clear and rebuild the additionals container
    if (additionalsContainer) {
        additionalsContainer.innerHTML = '';

        // Append each additional item
        formDataObject.step3.addOns.forEach((addOn) => {
            const additionalDiv = document.createElement('div');
            additionalDiv.classList.add('additional');
            additionalDiv.innerHTML = `
                <h4>${addOn.title}</h4>
                <h5>+$${addOn.price.toFixed(2)}/mo</h5>
            `;
            additionalsContainer.appendChild(additionalDiv);
        });
    }
};

/**
 * Validates the current step and returns whether it's valid
 * @returns {boolean} - Whether the current step is valid
 */
const validateStep = () => {
    const isValid = steps[currentIndex].validation();
    if (isValid) {
        completedSteps[currentIndex] = true;
    }
    return isValid;
};

/**
 * Updates the UI based on the current step
 */
const updateStep = () => {
    // Update step indicator UI
    stepNums.forEach((step, index) => {
        step.classList.toggle("active", index === currentIndex);
    });

    // Show/hide appropriate step content
    stepsContent.forEach((content, index) => {
        content.classList.toggle("d-block", index === currentIndex);
        content.classList.toggle("d-none", index !== currentIndex);
    });

    // Update step title and description
    if (formTitle) formTitle.textContent = steps[currentIndex].title;
    if (formDescription) formDescription.textContent = steps[currentIndex].description;

    // Toggle navigation buttons
    if (backBtn) {
        backBtn.classList.toggle("visible", currentIndex > 0);
        backBtn.classList.toggle("unvisible", currentIndex === 0);
    }

    if (nextBtn) {
        nextBtn.classList.toggle("d-block", currentIndex < stepNums.length - 1);
        nextBtn.classList.toggle("d-none", currentIndex === stepNums.length - 1);
    }

    if (confirmBtn) {
        confirmBtn.classList.toggle("d-block", currentIndex === stepNums.length - 1);
        confirmBtn.classList.toggle("d-none", currentIndex < stepNums.length - 1);
    }

    // Update summary UI if on the last step
    if (currentIndex === 3) {
        updateSummaryStep();
    }
};

// Event Handlers
if (changeBtn) {
    changeBtn.addEventListener("click", () => {
        currentIndex = 1;
        updateStep();
    });
}

if (nextBtn) {
    nextBtn.addEventListener("click", () => {
        if (validateStep() && currentIndex < stepNums.length - 1) {
            currentIndex++;
            updateStep();
        }
    });
}

if (backBtn) {
    backBtn.addEventListener("click", () => {
        if (currentIndex > 0) {
            currentIndex--;
            updateStep();
        }
    });
}

if (form) {
    form.addEventListener("submit", (e) => {
        e.preventDefault();

        if (typeof swal === 'undefined') {
            console.error('SweetAlert is not defined. Make sure it is properly loaded.');
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
                    if (!validateStep()) {
                        swal("Please fill in all required fields.");
                        return;
                    }

                    // Hide current step content
                    if (stepsContent[currentIndex]) {
                        stepsContent[currentIndex].classList.remove("d-block");
                        stepsContent[currentIndex].classList.add("d-none");
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
                    console.log('Form submitted with data:', formDataObject);
                } else {
                    swal("Form not submitted!");
                }
            })
            .catch(error => {
                console.error('SweetAlert error:', error);
                alert('An error occurred while processing your submission. Please try again.');
            });
    });
}

// Step navigation click handlers
stepNums.forEach((step, index) => {
    step.addEventListener("click", () => {
        // Prevent interactions if the form is completed
        if (completedSteps[completedSteps.length - 1]) return;

        // Don't allow moving forward if current step isn't completed
        if (index > currentIndex && !completedSteps[currentIndex]) {
            return;
        }

        // Allow backward navigation anytime
        if (index <= currentIndex) {
            currentIndex = index;
            updateStep();
        }
        // Allow forward navigation only if previous steps completed
        else if (completedSteps[index - 1]) {
            currentIndex = index;
            updateStep();
        }
    });
});

// Initialize the form UI
updateStep();