

document.addEventListener("DOMContentLoaded", () => {

    // Mobile navigation
    const menuToggle = document.getElementById("menuToggle");
    const navLinks = document.getElementById("navLinks");

    if (menuToggle && navLinks) {

        menuToggle.addEventListener("click", () => {
            navLinks.classList.toggle("show");

            const isOpen = navLinks.classList.contains("show");

            menuToggle.setAttribute(
                "aria-label",
                isOpen ? "Close navigation" : "Open navigation"
            );

            menuToggle.textContent = isOpen ? "×" : "☰";
        });

        // Close menu after clicking a link
        const links = navLinks.querySelectorAll("a");

        links.forEach(link => {
            link.addEventListener("click", () => {
                navLinks.classList.remove("show");
                menuToggle.textContent = "☰";
                menuToggle.setAttribute(
                    "aria-label",
                    "Open navigation"
                );
            });
        });
    }


    // Contact form
    const contactForm = document.getElementById("contactForm");
    const formMessage = document.getElementById("formMessage");

    if (contactForm && formMessage) {

        contactForm.addEventListener("submit", (event) => {

            event.preventDefault();

            const name = document.getElementById("name").value.trim();

            if (name === "") {
                formMessage.textContent =
                    "Please enter your name.";
                return;
            }

            formMessage.textContent =
                `Thanks, ${name}! Your message has been received.`;

            contactForm.reset();
        });
    }

});
