let swiperPartner;
function initSwiper() {
  if (window.innerWidth < 992) {
    if (!swiperPartner) {
      swiperPartner = new Swiper(".block__partner-slider", {
        slidesPerView: 'auto',
        loop: false,
        slideToClickedSlide: true,
        spaceBetween: 24,  
      });
    }
  } 
}
initSwiper();
window.addEventListener("resize", () => {
  initSwiper();
});

