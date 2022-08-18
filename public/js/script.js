document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("xpaan JS imported successfully!");
  },
  false
);

// ####################### Item Switch #######################
const allItemButtons = document.querySelectorAll(".btn-item");
const allForms = document.querySelectorAll(".form-item");
if (allItemButtons.length && allForms.length) {
  allItemButtons.forEach((button) => {
    button.addEventListener("click", (e) => {
      const targetForm = document.querySelector(
        `.form-item.${button.dataset.form}`
      );
      allForms.forEach((form) => {
        form.classList.remove("show");
      });
      targetForm.classList.add("show");
    });
  });
}

// ####################### DARKMODE TOGGLE #######################
const themeToggle = document.querySelector(".btn-toggle");
const currentTheme = localStorage.getItem("theme");
const prefersDarkScheme = window.matchMedia("(prefers-color-scheme: dark)");

if (currentTheme === null && prefersDarkScheme) {
  console.log("nothing set & likes darkmode");
  document.body.classList.add("dark-theme");
}

if (currentTheme == "dark") {
  document.body.classList.add("dark-theme");
}

themeToggle.addEventListener("click", function (e) {
  e.preventDefault();
  document.body.classList.toggle("dark-theme");
  let theme = "light";
  if (document.body.classList.contains("dark-theme")) {
    theme = "dark";
  }
  localStorage.setItem("theme", theme);
});
