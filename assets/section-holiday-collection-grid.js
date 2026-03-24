let swiperInstance;
function initSwiper() {
  if (window.innerWidth < 750) {
    if (!swiperInstance) {
      swiperInstance = new Swiper(".block__holiday-collection-grid-slider", {
        slidesPerView: 1.1,
        centeredSlides: true,  
        loop: true,
        slideToClickedSlide: true,
        spaceBetween: 10,  
      });
    }
  } 
}
initSwiper();
window.addEventListener("resize", () => {
  initSwiper();
});

