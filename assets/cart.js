class CartRemoveButton extends HTMLElement {
  constructor() {
    super();

    this.addEventListener('click', (event) => {
      event.preventDefault();
      const cartItems = this.closest('cart-items') || this.closest('cart-drawer-items');

      const dataIndexRemove = this.dataset.index;
      const productId = this.getAttribute('data-product-id');
      const itemKey = this.getAttribute('data-prodkey');
      const isBogo = this.getAttribute('data-bogo') === 'true';

      if (productId && isBogo) {
        const formData = new FormData();
        fetch('/cart.js')
          .then(response => response.json())
          .then(cart => {
            cart.items.forEach((item) => {
              if (item.product_id == productId) {
                formData.append(`updates[${item.key}]`, 0);
              }
            });
            return fetch('/cart/update.js', {
              method: 'POST',
              body: formData
            });
          })
          .then(response => response.json())
          .then(data => {
            console.log('Removed all BOGO items:', data);
            cartRefresh();
            setTimeout(() => {
              updateCartUrl();
              CartDrawerSlider();
            }, 1000)
          })
          .catch((error) => {
            console.error('Error removing BOGO items:', error);
          });
      } else {
        cartItems.updateQuantity(dataIndexRemove, 0);
      }
    });
  }
}

if (!customElements.get('cart-remove-button')) {
  customElements.define('cart-remove-button', CartRemoveButton);
}

class CartItems extends HTMLElement {
  constructor() {
    super();
    this.lineItemStatusElement =
      document.getElementById('shopping-cart-line-item-status') || document.getElementById('CartDrawer-LineItemStatus');

    const debouncedOnChange = debounce((event) => {
      this.onChange(event);
    }, ON_CHANGE_DEBOUNCE_TIMER);

    this.addEventListener('change', debouncedOnChange.bind(this));
  }

  cartUpdateUnsubscriber = undefined;

  connectedCallback() {
    this.cartUpdateUnsubscriber = subscribe(PUB_SUB_EVENTS.cartUpdate, (event) => {
      if (event.source === 'cart-items') {
        return;
      }
      this.onCartUpdate();
    });
  }

  disconnectedCallback() {
    if (this.cartUpdateUnsubscriber) {
      this.cartUpdateUnsubscriber();
    }
  }

  resetQuantityInput(id) {
    const input = this.querySelector(`#Quantity-${id}`);
    input.value = input.getAttribute('value');
    this.isEnterPressed = false;
  }

  setValidity(event, index, message) {
    event.target.setCustomValidity(message);
    event.target.reportValidity();
    this.resetQuantityInput(index);
    event.target.select();
  }

  validateQuantity(event) {
    const inputValue = parseInt(event.target.value);
    const index = event.target.dataset.index;
    let message = '';

    if (inputValue < event.target.dataset.min) {
      message = window.quickOrderListStrings.min_error.replace('[min]', event.target.dataset.min);
    } else if (inputValue > parseInt(event.target.max)) {
      message = window.quickOrderListStrings.max_error.replace('[max]', event.target.max);
    } else if (inputValue % parseInt(event.target.step) !== 0) {
      if(!event.srcElement.nodeName == 'TEXTAREA'){
        message = window.quickOrderListStrings.step_error.replace('[step]', event.target.step);
      }
    }

    if (message) {
      this.setValidity(event, index, message);
    } else {
      event.target.setCustomValidity('');
      event.target.reportValidity();
      this.updateQuantity(
        index,
        inputValue,
        document.activeElement.getAttribute('name'),
        event.target.dataset.quantityVariantId
      );
    }
  }

  onChange(event) {
    this.validateQuantity(event);
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

  onCartUpdate() {
    if (this.tagName === 'CART-DRAWER-ITEMS') {
      fetch(`${routes.cart_url}?section_id=cart-drawer`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const selectors = ['cart-drawer-items', '.cart-drawer__footer'];
          for (const selector of selectors) {
            const targetElement = document.querySelector(selector);
            const sourceElement = html.querySelector(selector);
            if (targetElement && sourceElement) {
              targetElement.replaceWith(sourceElement);
            }
          }
        })
        .catch((e) => {
          console.error(e);
        });
    } else {
      fetch(`${routes.cart_url}?section_id=main-cart-items`)
        .then((response) => response.text())
        .then((responseText) => {
          const html = new DOMParser().parseFromString(responseText, 'text/html');
          const sourceQty = html.querySelector('cart-items');
          this.innerHTML = sourceQty.innerHTML;
        })
        .catch((e) => {
          console.error(e);
        });
    }
    setTimeout(() => {
      updateCartUrl();
      CartDrawerSlider();
      initializeBogoButton();
    }, 1000)
  }

  getSectionsToRender() {
    return [
      {
        id: 'main-cart-items',
        section: document.getElementById('main-cart-items').dataset.id,
        selector: '.js-contents',
      },
      {
        id: 'cart-icon-bubble',
        section: 'cart-icon-bubble',
        selector: '.shopify-section',
      },
      {
        id: 'cart-live-region-text',
        section: 'cart-live-region-text',
        selector: '.shopify-section',
      },
      {
        id: 'main-cart-footer',
        section: document.getElementById('main-cart-footer').dataset.id,
        selector: '.js-contents',
      },
    ];
  }

  updateQuantity(line, quantity, name, variantId) {
    this.enableLoading(line);

    const body = JSON.stringify({
      line,
      quantity,
      sections: this.getSectionsToRender().map((section) => section.section),
      sections_url: window.location.pathname,
    });

    fetch(`${routes.cart_change_url}`, { ...fetchConfig(), ...{ body } })
      .then((response) => {
        return response.text();
      })
      .then((state) => {
        const parsedState = JSON.parse(state);
        const quantityElement =
          document.getElementById(`Quantity-${line}`) || document.getElementById(`Drawer-quantity-${line}`);
        const items = document.querySelectorAll('.cart-item');

        if (parsedState.errors) {
          quantityElement.value = quantityElement.getAttribute('value');
          this.updateLiveRegions(line, parsedState.errors);
          return;
        }

        this.classList.toggle('is-empty', parsedState.item_count === 0);
        const cartDrawerWrapper = document.querySelector('cart-drawer');
        const cartFooter = document.getElementById('main-cart-footer');

        if (cartFooter) cartFooter.classList.toggle('is-empty', parsedState.item_count === 0);
        if (cartDrawerWrapper) cartDrawerWrapper.classList.toggle('is-empty', parsedState.item_count === 0);

        this.getSectionsToRender().forEach((section) => {
          const elementToReplace =
            document.getElementById(section.id).querySelector(section.selector) || document.getElementById(section.id);
          elementToReplace.innerHTML = this.getSectionInnerHTML(
            parsedState.sections[section.section],
            section.selector
          );
        });
        const updatedValue = parsedState.items[line - 1] ? parsedState.items[line - 1].quantity : undefined;
        let message = '';
        if (items.length === parsedState.items.length && updatedValue !== parseInt(quantityElement.value)) {
          if (typeof updatedValue === 'undefined') {
            message = window.cartStrings.error;
          } else {
            message = window.cartStrings.quantityError.replace('[quantity]', updatedValue);
          }
        }
        this.updateLiveRegions(line, message);

        const lineItem =
          document.getElementById(`CartItem-${line}`) || document.getElementById(`CartDrawer-Item-${line}`);
        if (lineItem && lineItem.querySelector(`[name="${name}"]`)) {
          cartDrawerWrapper
            ? trapFocus(cartDrawerWrapper, lineItem.querySelector(`[name="${name}"]`))
            : lineItem.querySelector(`[name="${name}"]`).focus();
        } else if (parsedState.item_count === 0 && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper.querySelector('.drawer__inner-empty'), cartDrawerWrapper.querySelector('a'));
        } else if (document.querySelector('.cart-item') && cartDrawerWrapper) {
          trapFocus(cartDrawerWrapper, document.querySelector('.cart-item__name'));
        }

        publish(PUB_SUB_EVENTS.cartUpdate, { source: 'cart-items', cartData: parsedState, variantId: variantId });
        const event = new CustomEvent('cart:updated');
        document.dispatchEvent(event);
        if (document.querySelector('.block__free--product-wrapper') != null) {
          this.add_free_product();
        }
        initializeBogoButton();
        setTimeout(() => {
          CartDrawerSlider()
          updateCartUrl();
        }, 1000)
      })
      .catch(() => {
        this.querySelectorAll('.loading__spinner').forEach((overlay) => overlay.classList.add('hidden'));
        const errors = document.getElementById('cart-errors') || document.getElementById('CartDrawer-CartErrors');
        errors.textContent = window.cartStrings.error;
      })
      .finally(() => {
        this.disableLoading(line);
      });
  }

  updateLiveRegions(line, message) {
    const lineItemError =
      document.getElementById(`Line-item-error-${line}`) || document.getElementById(`CartDrawer-LineItemError-${line}`);
    if (lineItemError) lineItemError.querySelector('.cart-item__error-text').textContent = message;

    this.lineItemStatusElement.setAttribute('aria-hidden', true);

    const cartStatus =
      document.getElementById('cart-live-region-text') || document.getElementById('CartDrawer-LiveRegionText');
    cartStatus.setAttribute('aria-hidden', false);

    setTimeout(() => {
      cartStatus.setAttribute('aria-hidden', true);
    }, 1000);
  }

  getSectionInnerHTML(html, selector) {
    return new DOMParser().parseFromString(html, 'text/html').querySelector(selector).innerHTML;
  }

  enableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.add('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    [...cartItemElements, ...cartDrawerItemElements].forEach((overlay) => overlay.classList.remove('hidden'));

    document.activeElement.blur();
    this.lineItemStatusElement.setAttribute('aria-hidden', false);
  }

  disableLoading(line) {
    const mainCartItems = document.getElementById('main-cart-items') || document.getElementById('CartDrawer-CartItems');
    mainCartItems.classList.remove('cart__items--disabled');

    const cartItemElements = this.querySelectorAll(`#CartItem-${line} .loading__spinner`);
    const cartDrawerItemElements = this.querySelectorAll(`#CartDrawer-Item-${line} .loading__spinner`);

    cartItemElements.forEach((overlay) => overlay.classList.add('hidden'));
    cartDrawerItemElements.forEach((overlay) => overlay.classList.add('hidden'));
  }
}

customElements.define('cart-items', CartItems);

if (!customElements.get('cart-note')) {
  customElements.define(
    'cart-note',
    class CartNote extends HTMLElement {
      constructor() {
        super();

        this.addEventListener(
          'input',
          debounce((event) => {
            const body = JSON.stringify({ note: event.target.value });
            fetch(`${routes.cart_update_url}`, { ...fetchConfig(), ...{ body } });
          }, ON_CHANGE_DEBOUNCE_TIMER)
        ); 
        if(!document.getElementById("CartDrawer-Note").value == ''){
          document.getElementById('Details-CartDrawer').setAttribute('open', '');
          document.querySelector('#Details-CartDrawer summary').setAttribute('aria-expanded', 'true');
        }else{
          if(document.getElementById('Details-CartDrawer').hasAttribute('open') && document.getElementById("CartDrawer-Note").value == ''){
            document.getElementById('CartDrawer-Checkout').setAttribute('disabled', '');
          }
        }
      }
    }
  );
}

document.querySelectorAll('.quantity__input').forEach(function(input) {
  input.addEventListener('input', function(event) {
    this.value = this.value.replace(/[^0-9]/g, ''); // Allow only numbers
  });
});

function CartDrawerSlider() {
  const CartdrawerCarousel = document.querySelector('.block__cart-drawer-collection-slider');
  if (CartdrawerCarousel)
    new Swiper(CartdrawerCarousel, {
      slidesPerView: 1,
      spaceBetween: 12,
      loop: true,
      navigation: {
        nextEl: '.cart-slider-swiper-button-next',
        prevEl: '.cart-slider-swiper-button-prev',
      },
      breakpoints: {
        320: {
          slidesPerView: '1.5',
          spaceBetween: 12,
        },
        420: {
          slidesPerView: '1.7',
          spaceBetween: 12,
        },
        749: {
          slidesPerView: '2.3',
          spaceBetween: 12,
        },
      },
    });
}

function updateCartUrl() {
  fetch('/cart.js')
    .then((response) => response.json())
    .then((cart) => {
      const cartItems = cart.items.map((item) => `${item.variant_id}:${item.quantity}`).join(',');
      const shareUrl = `${window.location.origin}/cart/${cartItems}?storefront=true`;
      document.getElementById('block__share-your-cart-url').value = shareUrl;
    })
    .catch((error) => {
      console.error('Error fetching cart details:', error);
    });
}



document.addEventListener('DOMContentLoaded', function () {
function initializeBogoButton() {

  const BogoButton = document.querySelector('.bogo-add');
  if(BogoButton){
    function updateCart(itemKey) {
      var formData = {
        id: itemKey,
        quantity: 1,
      };
      product_Add_function(formData);
    }
  }
  

  if (BogoButton) {
    BogoButton.addEventListener('click', function (e) {
      
      let itemKey = this.getAttribute('data-product-id');

       updateCart(itemKey);

    });
  }
}
initializeBogoButton();
});

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

document.addEventListener("DOMContentLoaded", function () {
    let labels = document.querySelectorAll(".block__cart-hide-free-product");
    if (labels.length > 0) {
      labels.forEach((label) => {
        let itemId = label.getAttribute("data_attr_hide_free");
        console.log("itemId", itemId);

        if (itemId) {
          fetch("/cart/change.js", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id: itemId, quantity: 0 }),
          })
            .then((response) => response.json())
            .then(() => {
              cartRefresh();
            })
            .catch((error) => console.error("Error updating cart:", error));
        }
      });
    }
});
function cartRefresh() {
  fetch(`/cart`)
  .then((response) => response.text())
  .then((responseText) => {
    let html = new DOMParser().parseFromString(responseText, 'text/html');
    let selectors = ['cart-items'];
    for (let selector of selectors) {
      let targetElement = document.querySelector(selector);
      let sourceElement = html.querySelector(selector);
      if (targetElement && sourceElement) {
        targetElement.replaceWith(sourceElement);
        
      }
    }
  })
  fetch(`/cart`)
  .then((response) => response.text())
  .then((responseText) => {
    let html = new DOMParser().parseFromString(responseText, 'text/html');
    let selectors = ['.cart__footer-wrapper'];
    for (let selector of selectors) {
      let targetElement = document.querySelector(selector);
      let sourceElement = html.querySelector(selector);
      if (targetElement && sourceElement) {
        targetElement.replaceWith(sourceElement);
      }
    }
  })
 
  fetch(`${routes.cart_url}?section_id=cart-drawer`)
      .then((response) => response.text())
      .then((responseText) => {
        const html = new DOMParser().parseFromString(responseText, 'text/html');
        const cartDrawer = document.querySelector('#CartDrawer');
        const updatedCartDrawer = html.querySelector('#CartDrawer');
        if (cartDrawer && updatedCartDrawer) {
          cartDrawer.replaceWith(updatedCartDrawer);
          const cartItems = updatedCartDrawer.querySelector('.cart-items tbody');
          if (!cartItems || cartItems.children.length === 0) {
            updatedCartDrawer.closest('cart-drawer').classList.add('is-empty');
          } else {
            updatedCartDrawer.closest('cart-drawer').classList.remove('is-empty');
          }
        }
      });
  fetch('/cart.js')
  .then(response => response.json())
  .then(cart => {
    let cartItemCount = cart.item_count;
    let cartIconBubbles = document.querySelectorAll('.cart-count-bubble span');
    if (cartIconBubbles.length > 0) {
      cartIconBubbles.forEach(bubble => {
          bubble.textContent = cartItemCount;
      });
    }
  })
}


