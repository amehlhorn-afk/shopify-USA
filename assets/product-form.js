if (!customElements.get('product-form')) {
  customElements.define(
    'product-form',
    class ProductForm extends HTMLElement {
      constructor() {
        super();

        this.form = this.querySelector('form');
        this.variantIdInput.disabled = false;
        this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
        this.cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer');
        this.submitButton = this.querySelector('[type="submit"]');
        this.submitButtonText = this.submitButton.querySelector('span');

        if (document.querySelector('cart-drawer')) this.submitButton.setAttribute('aria-haspopup', 'dialog');

        this.hideErrors = this.dataset.hideErrors === 'true';
      }

      onSubmitHandler(evt) {
        evt.preventDefault();
        if (this.submitButton.getAttribute('aria-disabled') === 'true') return;

        this.handleErrorMessage();

        this.submitButton.setAttribute('aria-disabled', true);
        this.submitButton.classList.add('loading');
        this.querySelector('.loading__spinner').classList.remove('hidden');

        const config = fetchConfig('javascript');
        config.headers['X-Requested-With'] = 'XMLHttpRequest';
        delete config.headers['Content-Type'];

        const formData = new FormData(this.form);
        if (this.cart) {
          formData.append(
            'sections',
            this.cart.getSectionsToRender().map((section) => section.id)
          );
          formData.append('sections_url', window.location.pathname);
          this.cart.setActiveElement(document.activeElement);
        }
        config.body = formData;

        fetch(`${routes.cart_add_url}`, config)
          .then((response) => response.json())
          .then((response) => {
            if (response.status) {
              publish(PUB_SUB_EVENTS.cartError, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                errors: response.errors || response.description,
                message: response.message,
              });
              console.log("response",response.text)
              this.handleErrorMessage(response.description);

              const soldOutMessage = this.submitButton.querySelector('.sold-out-message');
              if (!soldOutMessage) return;
              this.submitButton.setAttribute('aria-disabled', true);
              this.submitButtonText.classList.add('hidden');
              soldOutMessage.classList.remove('hidden');
              this.error = true;
              return;
            } else if (!this.cart) {
              window.location = window.routes.cart_url;
              return;
            }
            if (!this.error)
              publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: formData.get('id'),
                cartData: response,
              });
            this.error = false;
            const quickAddModal = this.closest('quick-add-modal');
            if (quickAddModal) {
              document.body.addEventListener(
                'modalClosed',
                () => {
                  setTimeout(() => {
                    this.cart.renderContents(response);
                  });
                },
                { once: true }
              );
              quickAddModal.hide(true);
            } else {
              this.cart.renderContents(response);
            }
            initializeBogoButton()
          })
          .catch((e) => {
            console.error(e);
          })
          .finally(() => {
            this.submitButton.classList.remove('loading');
            if (this.cart && this.cart.classList.contains('is-empty')) this.cart.classList.remove('is-empty');
            if (!this.error) this.submitButton.removeAttribute('aria-disabled');
            this.querySelector('.loading__spinner').classList.add('hidden');
            const getPDPdetailclosest = this.submitButton.closest('.product');
            if (!getPDPdetailclosest) return;
            const priceElement = getPDPdetailclosest.querySelector('.price-item');
            if (!priceElement) return;
            const priceText = priceElement.innerText;
            console.log("priceText",priceText)
            const addToCartButtons = getPDPdetailclosest.querySelectorAll('.product-form__submit .add-to-cart-price');
            addToCartButtons.forEach(button => {
              button.innerHTML = `Add To Cart - ${priceText}`;
            });
            CartDrawerSlider();
            setTimeout(() => {
              let sticky_bar_available =  document.querySelector('sticky-bar'); 
                if(sticky_bar_available){
                 document.querySelector('sticky-bar quantity-input input').value = 1; 
              }
            }, 1000);
            if (document.querySelector('.free-product-added') == null) {
              this.add_free_product();
            }
            initializeBogoButton();
          });
      }
      add_free_product(event) {
        fetch('/cart.json')
          .then((res) => {
            return res.json();
          }).then((data) => {
            if (document.querySelector('.block__free--product-wrapper') != null) {
              var var_id = document.querySelector('.block__free--product-wrapper').getAttribute('data-id');
              
            }
            if (document.querySelector('.block_cart-shpping-baar-inner') != null) {
              var free_gift_price = document.querySelector('.block_cart-shpping-baar-inner').getAttribute('data_add_freegift_price');
              if (data.total_price >= free_gift_price) {
                console.log("var_id",var_id)
                if (document.querySelector('.free-product-added') == null) {
                  var formData = {
                    id: var_id,
                    quantity: 1,
                  };
                  product_Add_function(formData);
                }
              } else {
                if (document.querySelector('.free-product-remove') != null) {
                  document.querySelector('.free-product-remove').dispatchEvent(new Event('click', { 'bubbles': true }));
                }
              }
            }
          });
      }
      handleErrorMessage(errorMessage = false) {
        if (this.hideErrors) return;
        this.errorMessageWrapper =
          this.errorMessageWrapper || this.querySelector('.product-form__error-message-wrapper');
        if (!this.errorMessageWrapper) return;
        this.errorMessage = this.errorMessage || this.errorMessageWrapper.querySelector('.product-form__error-message');

        this.errorMessageWrapper.toggleAttribute('hidden', !errorMessage);

        if (errorMessage) {
          this.errorMessage.textContent = errorMessage;
        }
      }

      toggleSubmitButton(disable = true, text) {
        if (disable) {
          this.submitButton.setAttribute('disabled', 'disabled');
          if (text) this.submitButtonText.textContent = text;
        } else {
          this.submitButton.removeAttribute('disabled');
          this.submitButtonText.textContent = window.variantStrings.addToCart;
        }
      }

      get variantIdInput() {
        return this.form.querySelector('[name=id]');
      }
    }
  );
}


function initializeBogoButton() {
  const BogoButton = document.querySelector('.bogo-add');

  function updateCart(itemKey) {
    var formData = {
      id: itemKey,
      quantity: 1,
    };
    product_Add_function(formData);
  }

  if (BogoButton) {
    BogoButton.addEventListener('click', function (e) {
      
      let itemKey = this.getAttribute('data-product-id');
    
      updateCart(itemKey);
  
    });
  }
}

initializeBogoButton();

function product_Add_function(formData) {
  fetch('/cart/add.js', {
    body: JSON.stringify(formData),
    credentials: 'same-origin',
    headers: {
      'Content-Type': 'application/json',
      'X-Requested-With': 'xmlhttprequest'
    },
    method: 'POST'
  }).then(function (response) {
    setTimeout(() => {
      updateCartUrl();
      CartDrawerSlider();
    }, 1000)
    return response.json();
  }).then(function (json) {
    fetch(`${routes.cart_url}?section_id=cart-drawer`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const selectors = ['cart-drawer-items', '.cart-drawer__footer', '.drawer__header', '.block__protection-product-price'];
        for (const selector of selectors) {
          const targetElement = document.querySelector(selector);
          const sourceElement = html.querySelector(selector);
          if (targetElement && sourceElement) {
            targetElement.replaceWith(sourceElement);
          }
        }
      })
  }).catch(function (err) {
    console.error(err)
  });
}