var swiper = new Swiper(".block__team-info-img-slider", {
  loop: true,
  spaceBetween: 0,
  slidesPerView: 1,
  freeMode: false,
  grabCursor: false,
  allowTouchMove: false,
  watchSlidesProgress: true,
});
var swiper2 = new Swiper(".block__team-info-text-slider", {
  loop: true,
  spaceBetween: 0,
  navigation: {
    nextEl: ".block__team-info-slider-next",
    prevEl: ".block__team-info-slider-prev",
  },
  thumbs: {
    swiper: swiper,
  },
});
