// Faq JS
var faqButtons = document.querySelectorAll(".block__tabs_title");
faqButtons.forEach(function (button) {
  button.addEventListener("click", function () {
    const slideElement = button.closest(".block__faq-slide");
    const sliderContainer = slideElement.closest(".faq_content_row");

    if (slideElement.classList.contains("change_icon")) {
      slideElement.querySelector(".block__faq-panel").style.display = "none";
      slideElement.classList.remove("change_icon");
    } else {
      sliderContainer.querySelectorAll(".block__faq-panel").forEach((panel) => {
        panel.style.display = "none";
      });
      sliderContainer.querySelectorAll(".block__faq-slide").forEach((slide) => {
        slide.classList.remove("change_icon");
      });
      slideElement.querySelector(".block__faq-panel").style.display = "block";
      slideElement.classList.add("change_icon");
    }
  });
});

// Click Event Listener for FAQ Heading
document.addEventListener("click", function (event) {
  const heading = event.target.closest(".js_faq_heading");
  if (heading) {
    const dataId = heading.getAttribute("data_id");

    // Remove active class from all headings
    document.querySelectorAll(".js_faq_heading").forEach((h) => {
      h.classList.remove("active");
    });
    heading.classList.add("active");

    const targetBlock = document.querySelector(`.block__faq-list-wrapper#${dataId}`);
    if (targetBlock) {
      const mobileOffset = window.innerWidth < 991 ? 80 : 100;
      const rect = targetBlock.getBoundingClientRect();
      const offsetPosition = rect.top + window.pageYOffset - mobileOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
    }
  }
});

// Check if there are FAQ headings
if (document.querySelector(".js_faq_heading")) {
  let lastId;
  const menuItems = document.querySelectorAll(".block__faq-list-wrapper");
  const scrollItems = Array.from(menuItems);
  window.addEventListener("scroll", function () {
    const headerHeight = document.querySelector(".header").offsetHeight || 0;
    const windowHeight = window.innerHeight;
    const halfWindowHeight = windowHeight / 4;
    const fromTop = window.scrollY + headerHeight - halfWindowHeight;
    const current = scrollItems.filter((item) => item.offsetTop < fromTop);
    const cur = current[current.length - 1];
    const id = cur ? cur.id : "";
    if (lastId !== id) {
      lastId = id;
      if (cur) {
        const dataId = cur.id;
        document.querySelectorAll(".js_faq_heading").forEach((heading) => {
          heading.classList.remove("active");
        });
        const activeHeading = document.querySelector(
          `.js_faq_heading[data_id='${dataId}']`
        );
        if (activeHeading) {
          activeHeading.classList.add("active");
          var htmlContent = activeHeading.innerHTML;
          document.querySelector(".faq_type").innerHTML = htmlContent;
        }
      }
    }
  });
}

function isTabletOrMobile() {
  return window.matchMedia("(max-width: 991px)").matches;
}
if (isTabletOrMobile()) {
  const element = document.querySelector(".block__faq-category-mobile");
  element.addEventListener("click", function () {
    this.classList.toggle("active");
    var closestFaq = this.closest(".block__faq-category").querySelector(".block__faq-type-list-inner");
    if (closestFaq) {
      closestFaq.style.display =
        closestFaq.style.display === "none" || closestFaq.style.display === "" ? "block" : "none";
    }
  });

  const element_one = document.querySelector(".block__faq-type-list-inner");
  element_one.addEventListener("click", function () {
    this.closest(".block__faq-category").querySelector(".block__faq-category-mobile").classList.toggle("active");
    this.style.display = this.style.display === "none" || this.style.display === "" ? "block" : "none";
  });
  // Select all <li> elements inside .block__faq-type-list-inner
  const elementGetHtml = document.querySelectorAll(".block__faq-type-list-inner li");
  elementGetHtml.forEach((li) => {
    li.addEventListener("click", function () {
      var htmlContent = this.innerHTML;
      
      document.querySelector(".faq_type").innerHTML = htmlContent;
    });
  });
}
