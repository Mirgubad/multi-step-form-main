const formBody = document.getElementById("userForm");
const formTitle = document.getElementById("form-title");
const formDescription = document.getElementById("form-info");
const nextBtn = document.getElementById("next-btn");
const backBtn = document.getElementById("back-btn");
const confirmBtn = document.getElementById("confirm-btn");
const stepNums = document.querySelectorAll(".step-num");
const stepsContent = document.querySelectorAll(".steps");


let currentIndex = 0;

confirmBtn.addEventListener("click", () => {

})
nextBtn.addEventListener("click", () => {

    if (currentIndex != stepNums.length - 1) {
        stepNums[currentIndex].classList.remove("active")
        stepsContent[currentIndex].classList.remove("d-block")
        stepsContent[currentIndex].classList.add("d-none")
        currentIndex++;
        stepNums[currentIndex].classList.add("active")
        stepsContent[currentIndex].classList.remove("d-none")
        stepsContent[currentIndex].classList.add("d-block")


    }

    if (currentIndex == stepNums.length - 1) {
        confirmBtn.classList.remove("d-none");
        confirmBtn.classList.add("d-block")
        nextBtn.classList.remove("d-block")
        nextBtn.classList.add("d-none")
    }

    if (currentIndex > 0) {
        backBtn.classList.add("visible")
        backBtn.classList.remove("unvisible")

    }
    formTitle.textContent = steps[currentIndex].title
    formDescription.textContent = steps[currentIndex].description
})

backBtn.addEventListener("click", () => {

    if (currentIndex > 0) {
        // stepNums[currentIndex].classList.remove("active")
        // currentIndex--;
        // stepNums[currentIndex].classList.add("active")
        stepNums[currentIndex].classList.remove("active")
        stepsContent[currentIndex].classList.remove("d-block")
        stepsContent[currentIndex].classList.add("d-none")
        currentIndex--;
        stepNums[currentIndex].classList.add("active")
        stepsContent[currentIndex].classList.remove("d-none")
        stepsContent[currentIndex].classList.add("d-block")
    }

    if (currentIndex < stepNums.length) {
        confirmBtn.classList.remove("d-block");
        confirmBtn.classList.add("d-none")
        nextBtn.classList.remove("d-none")
        nextBtn.classList.add("d-block")
    }
    if (currentIndex == 0) {
        backBtn.classList.add("unvisible")
        backBtn.classList.remove("visible")

    }
    formTitle.textContent = steps[currentIndex].title
    formDescription.textContent = steps[currentIndex].description

})





const steps = [

    {

        title: "Personal info",
        description: "Please provide your name, email address, and phone number."
    }
    , {

        title: "Select your plan",
        description: "You have the option of monthly or yearly billing."
    },
    {

        title: "Pick add-ons",
        description: "Add-ons help enhance your gaming experience."
    },
    {
        title: "Finishing up",
        description: "Double-check everything looks OK before confirming."
    }
]