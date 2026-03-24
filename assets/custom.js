fetch('https://ipapi.co/json/')
  .then(response => response.json())
  .then(data => {
    if (data.country_code === 'AU') {
      document.body.classList.add('region-australia');
    }
  })
  .catch(function() {}); // prevent unhandled rejection errors

// ==========================  Blog Search Filter start =========================== //
function filterApply(value, div) {
  let title = document.querySelectorAll(".blog-post-title");
  let searchValue = value.toLowerCase();
  title.forEach((e) => {
    let dataTitle = e.getAttribute("data-post-title").toLowerCase();
    let titleParentDiv = e.closest(".filter_box");
    if (titleParentDiv) {
      if (dataTitle.indexOf(searchValue) > -1) {
        titleParentDiv.classList.add("active");
      } else {
        titleParentDiv.classList.remove("active");
      }
    }
  });
}
document.addEventListener("DOMContentLoaded", function () {
  let blockFilter = document.querySelector('[id^="filter-"]');
  if (blockFilter) {
    blockFilter.addEventListener("keyup", function () {
      filterApply(this.value, this.closest(".page-width"));
    });
  }
});
// ==========================  Blog Search Filter End =========================== //

// ==========================  Password View Function start =========================== //
const eyeClose = `<svg xmlns="http://www.w3.org/2000/svg" width="20px" height="20px" viewBox="0 0 64 64">
<path fill="none" stroke="var(--denary_color)" stroke-width="2" d="M1,32c0,0,11,15,31,15s31-15,31-15S52,17,32,17  S1,32,1,32z"/>
<circle fill="none" stroke="var(--denary_color)" stroke-width="2" cx="32" cy="32" r="7"/>
<line fill="none" stroke="var(--denary_color)" stroke-width="2" x1="9" y1="55" x2="55" y2="9"/>
</svg>`;
const eyeOpen = `<svg xmlns="http://www.w3.org/2000/svg" fill="var(--denary_color)" width="20px" height="20px" viewBox="0 0 60.254 60.254">
<g>
  <path d="M29.008,48.308c-16.476,0-28.336-17.029-28.833-17.754c-0.248-0.36-0.231-0.841,0.039-1.184c0.561-0.712,13.906-17.424,29.913-17.424
  c17.953,0,29.474,16.769,29.956,17.482c0.23,0.342,0.229,0.79-0.007,1.129c-0.475,0.688-11.842,16.818-29.899,17.721
  C29.786,48.297,29.396,48.308,29.008,48.308z M2.267,30.028c2.326,3.098,13.553,16.967,27.812,16.254
  c15.237-0.76,25.762-13.453,27.938-16.3c-2.175-2.912-12.811-16.035-27.889-16.035C16.7,13.947,4.771,27.084,2.267,30.028z"/>
  <path d="M30.127,37.114c-3.852,0-6.986-3.135-6.986-6.986c0-3.851,3.134-6.985,6.986-6.985s6.986,3.135,6.986,6.985
  C37.113,33.979,33.979,37.114,30.127,37.114z"/>
  <path d="M30.127,42.614c-6.885,0-12.486-5.602-12.486-12.486c0-6.883,5.602-12.485,12.486-12.485c6.884,0,12.486,5.602,12.486,12.485
  C42.613,37.012,37.013,42.614,30.127,42.614z M30.127,19.641c-5.782,0-10.486,4.704-10.486,10.486
  c0,5.781,4.704,10.485,10.486,10.485s10.486-4.704,10.486-10.485C40.613,24.345,35.91,19.641,30.127,19.641z"/>
</g>
</svg>`;
document.querySelectorAll(".toggle-password").forEach(function (toggleIcon) {
  toggleIcon.innerHTML = eyeClose;
  toggleIcon.addEventListener("click", function () {
    let inputField = this.previousElementSibling;
    if (inputField.type === "password") {
      inputField.type = "text";
      this.innerHTML = eyeOpen;
    } else {
      inputField.type = "password";
      this.innerHTML = eyeClose;
    }
  });
});
// ==========================  Password View Function End =========================== //

// ==========================  ® Superscript Start =========================== //
document.querySelectorAll("body *:not(script, style, noscript)").forEach(el => {
  if (el.childNodes.length) {
    el.childNodes.forEach(node => {
      if (node.nodeType === 3 && node.nodeValue.includes("®")) {
        let newHTML = node.nodeValue.replace(/®/g, '<sup class="reg-mark">®</sup>');
        let wrapper = document.createElement("span");
        wrapper.innerHTML = newHTML;
        if (wrapper.innerHTML !== node.nodeValue) {
          el.replaceChild(wrapper, node);
        }
      }
    });
  }
});
document.querySelectorAll(".reg-mark").forEach(mark => {
  let parent = mark.parentElement;
  if (!parent || !(parent instanceof Element)) return; // ✅ null guard
  let computedStyle = window.getComputedStyle(parent);
  if (!computedStyle || !computedStyle.fontSize) return; // ✅ null guard
  let fontSize = computedStyle.fontSize;
  let newSize = (parseFloat(fontSize) / 1.618) + "px";
  mark.style.fontSize = newSize;
  mark.style.position = "relative";
  mark.style.top = `-${parseFloat(newSize) / 2.2}px`;
  mark.style.marginLeft = "1px";
});
// ==========================  ® Superscript End =========================== //

// ================= Address form validation ===================================== //
document.addEventListener("DOMContentLoaded", function () {
  let inputField = document.querySelectorAll('.AddressName');
  inputField.forEach((input) => {
    input.addEventListener("input", function () {
      if (/\d/.test(this.value)) {
        this.value = this.value.replace(/\d/g, "");
      }
    });
  });
  let inputFieldNumber = document.querySelectorAll('.AddressNumber');
  inputFieldNumber.forEach((input) => {
    input.addEventListener("input", function () {
      if (/\D/.test(this.value)) {
        this.value = this.value.replace(/\D/g, "");
      }
    });
  });
});

// ==========================  Product variant radio =========================== //
document.querySelectorAll('.product-form__input input[type="radio"]').forEach(input => {
  input.addEventListener('change', function () {
    let selectedOptions = {};
    document.querySelectorAll('.product-form__input').forEach(fieldset => {
      let selectedInput = fieldset.querySelector('input[type="radio"]:checked');
      let legend = fieldset.querySelector('legend');
      if (legend && selectedInput) {
        selectedOptions[legend.textContent.trim()] = selectedInput.value;
      }
    });
  });
});

// ==========================  Product sticky-bar start =========================== //
const quantity__button = document.querySelectorAll('sticky-bar quantity-input .quantity__button');
quantity__button.forEach(function (e) {
  e.addEventListener('click', (elm) => {
    const target = document.querySelector('.block__selectoption-item quantity-input input');
    if (target) { // ✅ null guard
      target.value = elm.currentTarget.closest('quantity-input').querySelector('input').value;
    }
  });
});

const productmainbutton = document.querySelector('sticky-bar .product-form__submit');
if (productmainbutton) { // ✅ null guard (was already here, kept)
  productmainbutton.addEventListener('click', () => {
    const submitButton = document.querySelector('.product-form__buttons .product-form__submit[type="submit"]');
    if (submitButton) {
      submitButton.click();
      setTimeout(() => {
        let sticky_bar_available = document.querySelector('sticky-bar');
        const stickyInput = document.querySelector('sticky-bar quantity-input input');
        if (sticky_bar_available && stickyInput) { // ✅ null guard
          stickyInput.value = 1;
        }
      }, 1500);
    }
  });
}
// ==========================  Product sticky-bar End =========================== //

// ==========================  On scroll render section start  =========================== //
document.querySelectorAll(".template-sleeplab-design .block__scroll_sleep-study").forEach(function (el) {
  el.addEventListener("click", function (e) {
    e.preventDefault();
    const target = document.getElementById("book-sleep-study");
    if (target) {
      target.scrollIntoView({ behavior: "smooth" });
    }
  });
});
// ==========================  On scroll render section End =========================== //

// =============================   Cart note validation start  ============================= //
const cartDrawerCheckout = document.getElementById('CartDrawer-Checkout');
if (cartDrawerCheckout) { // ✅ null guard — was crashing on every non-cart page
  cartDrawerCheckout.addEventListener('click', function (event) {
    event.preventDefault();
    const cartDrawerDetails = document.getElementById('Details-CartDrawer');
    const cartNote = document.getElementById('CartDrawer-Note');
    const cartNoteSpan = document.querySelector('cart-note span');
    if (cartDrawerDetails && cartDrawerDetails.hasAttribute('open') && cartNote && cartNote.value == '') {
      if (cartNoteSpan) cartNoteSpan.style.display = 'block'; // ✅ null guard
    } else {
      window.location.href = '/checkout';
    }
  });
}
// =============================   Cart note validation End  ============================= //

window.addEventListener('load', function () {
  if (window.innerWidth < 749) {
    const collectionFilters = document.getElementById('main-collection-filters');
    const stickyHeader = document.querySelector('sticky-header');
    if (collectionFilters && stickyHeader) { // ✅ null guard — was crashing on non-collection pages
      let header_height = stickyHeader.clientHeight;
      collectionFilters.style.top = header_height + 'px';
    }
  }
});

// ============================= Announcement bar scroll class Start ============================= //
window.addEventListener("scroll", function () {
  const scrollTop = window.scrollY;
  const header = document.querySelector(".header-wrapper");
  const announcementBar = document.querySelector(".announcement-bar-section");

  if (announcementBar && header) { // ✅ null guard added for header
    const announcementHeight = announcementBar.offsetHeight;
    const earlyOffset = 10;
    if (scrollTop >= (announcementHeight - earlyOffset)) {
      header.classList.add("no-radius");
    } else {
      header.classList.remove("no-radius");
    }
  }
});
// ============================= Announcement bar scroll class End ============================= //

// =============================   Move UserWay position on mobile start  ============================= //
document.addEventListener('DOMContentLoaded', function () {
  function checkIsMobile() {
    if (window.innerWidth <= 768) {
      const elements = document.querySelectorAll('.userway_buttons_wrapper');
      elements.forEach(function (element) {
        element.style.removeProperty('top');
        element.style.top = 'calc(85% + 5px)';
      });
    }
  }

  const observer = new MutationObserver(function (mutationsList) {
    mutationsList.forEach(function (mutation) {
      if (mutation.type === 'childList') {
        const elements = document.querySelectorAll('.userway_buttons_wrapper');
        if (elements.length > 0) {
          checkIsMobile();
        }
      }
    });
  });

  observer.observe(document.body, { childList: true, subtree: true });

  window.addEventListener('resize', function () {
    checkIsMobile();
  });
});
// =============================   Move UserWay position on mobile end  ============================= //

// =============================   PowerReviews PDP Back To Top Start  ============================= //
document.addEventListener("click", function (e) {
  const backToTop = e.target.closest('.pr-rd-to-top');
  if (backToTop) {
    e.stopImmediatePropagation();
    e.preventDefault();

    const target = document.querySelector('#pr-review-snapshot');
    if (target) {
      const headerOffset = 100;
      const elementPosition = target.getBoundingClientRect().top + window.pageYOffset;
      const offsetPosition = elementPosition - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
  }
}, true);
// =============================   PowerReviews PDP Back To Top End  ============================= //