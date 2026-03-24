const gallerySlider = document.querySelector(".block__gallery-slider");
if (gallerySlider) {
  const galleryHeader = gallerySlider.parentElement.querySelector(
    ".block__gallery-slider-header"
  );

  if (galleryHeader) {
    swiperGallery = new Swiper(".block__gallery-slider", {
      slidesPerView: 1.16,
      centeredSlides: true,
      loop: true,
      initialSlide: 0,
      slideToClickedSlide: true,
      spaceBetween: 12,
      navigation: {
        nextEl: galleryHeader.querySelector(".gallery-slider-next"),
        prevEl: galleryHeader.querySelector(".gallery-slider-prev"),
      },
      breakpoints: {
        750: {
          slidesPerView: 1.25,
          spaceBetween: 20,
        },
        992: {
          slidesPerView: 1.5,
          spaceBetween: 20,
        },
        1200: {
          slidesPerView: 1.5,
          spaceBetween: 30,
        },
        1440: {
          slidesPerView: 1.727,
          spaceBetween: 60,
        },
      },
    });
  }
}
