const formBody = document.getElementById("userForm");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-info");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const confirmBtn = document.getElementById("confirm-btn");
const stepNums = document.querySelectorAll(".step-num");
const stepsContent = document.querySelectorAll(".steps");
const actionButtons = document.querySelector(".action-buttons");


let currentIndex = 0;

const steps = [
    { title: "Personal info", description: "Please provide your name, email address, and phone number." },
    { title: "Select your plan", description: "You have the option of monthly or yearly billing." },
    { title: "Pick add-ons", description: "Add-ons help enhance your gaming experience." },
    { title: "Finishing up", description: "Double-check everything looks OK before confirming." }
];

const updateStep = () => {
    stepNums.forEach((step, index) => step.classList.toggle("active", index === currentIndex));
    stepsContent.forEach((content, index) => {
        content.classList.toggle("d-block", index === currentIndex);
        content.classList.toggle("d-none", index !== currentIndex);
    });

    formTitle.textContent = steps[currentIndex].title;
    formDescription.textContent = steps[currentIndex].description;

    backBtn.classList.toggle("visible", currentIndex > 0);
    backBtn.classList.toggle("unvisible", currentIndex === 0);

    nextBtn.classList.toggle("d-block", currentIndex < stepNums.length - 1);
    nextBtn.classList.toggle("d-none", currentIndex === stepNums.length - 1);

    confirmBtn.classList.toggle("d-block", currentIndex === stepNums.length - 1);
    confirmBtn.classList.toggle("d-none", currentIndex < stepNums.length - 1);
};

nextBtn.addEventListener("click", () => {
    if (currentIndex < stepNums.length - 1) {
        currentIndex++;
        updateStep();
    }
});

backBtn.addEventListener("click", () => {
    if (currentIndex > 0) {
        currentIndex--;
        updateStep();
    }
});

confirmBtn.addEventListener("click", () => {
    stepsContent[currentIndex].classList.remove("d-block");
    stepsContent[currentIndex].classList.add("d-none");

    currentIndex = stepsContent.length - 1;

    stepsContent[currentIndex].classList.remove("d-none");
    stepsContent[currentIndex].classList.add("d-block");

    formTitle.classList.add("d-none");
    formDescription.classList.add("d-none");

    nextBtn.classList.add("d-none");
    backBtn.classList.add("d-none");
    confirmBtn.classList.add("d-none");
});

stepNums.forEach((step, index) => {
    step.addEventListener("click", () => {
        if (index !== currentIndex) {
            // Hide current step
            stepsContent[currentIndex].classList.remove("d-block");
            stepsContent[currentIndex].classList.add("d-none");
            stepNums[currentIndex].classList.remove("active");

            // Update current index
            currentIndex = index;

            // Show new step
            stepsContent[currentIndex].classList.remove("d-none");
            stepsContent[currentIndex].classList.add("d-block");
            stepNums[currentIndex].classList.add("active");

            // Update form title & description
            formTitle.textContent = steps[currentIndex].title;
            formDescription.textContent = steps[currentIndex].description;

            // Toggle button visibility
            backBtn.classList.toggle("visible", currentIndex > 0);
            backBtn.classList.toggle("unvisible", currentIndex === 0);

            nextBtn.classList.toggle("d-none", currentIndex === stepNums.length - 1);
            confirmBtn.classList.toggle("d-none", currentIndex !== stepNums.length - 1);
        }
    });
});



updateStep();
