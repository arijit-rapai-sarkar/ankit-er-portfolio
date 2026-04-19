const year = document.getElementById("year");
const revealItems = document.querySelectorAll(".reveal");
const navAnchors = document.querySelectorAll(".nav-links a");
const sections = document.querySelectorAll("main section[id]");
const progressBar = document.querySelector(".scroll-progress");
const tiltCard = document.getElementById("tilt-card");
const magneticTargets = document.querySelectorAll(".magnetic");
const cursorMain = document.querySelector(".cursor-main");
const cursorFollow = document.querySelector(".cursor-follow");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (year) {
  year.textContent = new Date().getFullYear();
}

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("show");
      }
    });
  },
  {
    threshold: 0.2,
  }
);

revealItems.forEach((item) => revealObserver.observe(item));

function updateProgressBar() {
  const scrollTop = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
  const progress = maxScroll > 0 ? (scrollTop / maxScroll) * 100 : 0;

  if (progressBar) {
    progressBar.style.width = `${progress}%`;
  }
}

function updateActiveLink() {
  const position = window.scrollY + 180;

  sections.forEach((section) => {
    const top = section.offsetTop;
    const bottom = top + section.offsetHeight;
    const id = section.getAttribute("id");

    if (position >= top && position < bottom) {
      navAnchors.forEach((anchor) => {
        anchor.classList.toggle("active", anchor.getAttribute("href") === `#${id}`);
      });
    }
  });
}

window.addEventListener("scroll", () => {
  updateProgressBar();
  updateActiveLink();
});

updateProgressBar();
updateActiveLink();

if (tiltCard && !prefersReducedMotion) {
  tiltCard.addEventListener("mousemove", (event) => {
    const bounds = tiltCard.getBoundingClientRect();
    const percentX = (event.clientX - bounds.left) / bounds.width - 0.5;
    const percentY = (event.clientY - bounds.top) / bounds.height - 0.5;
    const rotateY = percentX * 14;
    const rotateX = percentY * -14;

    tiltCard.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-3px)`;
  });

  tiltCard.addEventListener("mouseleave", () => {
    tiltCard.style.transform = "perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0)";
  });
}

if (!prefersReducedMotion) {
  magneticTargets.forEach((button) => {
    button.addEventListener("mousemove", (event) => {
      const bounds = button.getBoundingClientRect();
      const offsetX = event.clientX - (bounds.left + bounds.width / 2);
      const offsetY = event.clientY - (bounds.top + bounds.height / 2);

      button.style.transform = `translate(${offsetX * 0.2}px, ${offsetY * 0.2}px)`;
    });

    button.addEventListener("mouseleave", () => {
      button.style.transform = "translate(0, 0)";
    });
  });
}

if (
  !prefersReducedMotion &&
  window.matchMedia("(pointer: fine)").matches &&
  cursorMain &&
  cursorFollow
) {
  document.body.classList.add("cursor-ready");
  let mouseX = window.innerWidth / 2;
  let mouseY = window.innerHeight / 2;
  let followX = mouseX;
  let followY = mouseY;

  const moveCursor = () => {
    followX += (mouseX - followX) * 0.18;
    followY += (mouseY - followY) * 0.18;

    cursorMain.style.left = `${mouseX}px`;
    cursorMain.style.top = `${mouseY}px`;
    cursorFollow.style.left = `${followX}px`;
    cursorFollow.style.top = `${followY}px`;

    requestAnimationFrame(moveCursor);
  };

  requestAnimationFrame(moveCursor);

  window.addEventListener("mousemove", (event) => {
    mouseX = event.clientX;
    mouseY = event.clientY;
  });

  const hoverTargets = document.querySelectorAll("a, button, .project-card, .skill-card");
  hoverTargets.forEach((item) => {
    item.addEventListener("mouseenter", () => {
      cursorFollow.classList.add("cursor-hover");
    });

    item.addEventListener("mouseleave", () => {
      cursorFollow.classList.remove("cursor-hover");
    });
  });
}

const messageForm = document.getElementById("message-form");
const formStatus = document.getElementById("form-status");
const senderEmailInput = document.getElementById("sender-email");

if (messageForm) {
  messageForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const submitButton = messageForm.querySelector('button[type="submit"]');
    const formData = new FormData(messageForm);

    // Help recipients reply directly to the sender address.
    if (senderEmailInput && senderEmailInput.value.trim()) {
      formData.set("replyto", senderEmailInput.value.trim());
    }

    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
    }

    if (formStatus) {
      formStatus.textContent = "Sending your message...";
      formStatus.classList.remove("status-success", "status-error");
    }

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
        headers: {
          Accept: "application/json",
        },
      });

      let result = {};
      try {
        result = await response.json();
      } catch (parseError) {
        result = {};
      }

      if (response.ok && result.success) {
        messageForm.reset();
        if (formStatus) {
          formStatus.textContent = "Message sent successfully.";
          formStatus.classList.add("status-success");
        }
      } else {
        throw new Error(result.message || "Failed to send message from Web3Forms.");
      }
    } catch (error) {
      console.error("Web3Forms submission error:", error);
      if (formStatus) {
        formStatus.textContent = `Message failed: ${error.message || "Please try again."}`;
        formStatus.classList.add("status-error");
      }
    } finally {
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit";
      }
    }
  });
}

