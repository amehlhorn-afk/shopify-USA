document.addEventListener("DOMContentLoaded", (event) => {
    TangentAI.init();
});

const TangentAI = (function () {
    const init = () => {
        const window_url = new URL(window.location.href);
        response_id = window_url.searchParams.get("resp_id");
        TangentAI.fetchRecommendation(response_id)
            .then((recommendationData) =>
                TangentAI.displayRecommendation(recommendationData)
            )
            .catch((e) => console.log(e));
    };

    const fetchRecommendation = async (resp_id) => {
        try {
            let response = await fetch(
                `https://service.tangent.ai/shopify/get-checkout-products?resp_id=${resp_id}&self_serve=true&multiple_variants=true`
            );
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            let globalData = await response.json();
            return globalData;
        } catch (error) {
            console.error("Error fetching data:", error);
            return null;
        }
    };

    const displayRecommendation = (data) => {
        let selectedVariants = TangentAI.getSelectedVariantsObject(
            data.products,
            data.selected_variants
        );
        let recommendedProducts = TangentAI.getRecommendedProductDetails(
            selectedVariants,
            data.products
        );
        if(recommendedProducts.length === 0){
          renderErrorMessage()
        }
      
        recommendedProducts.forEach((product) => {
            renderProductDetails(product);
            addClickHandler(product);
        });


    };

    const renderProductDetails = (product) => {
        const productContainer = document.querySelector(".tangent-recommendation-container");
        let productBlock = document.createElement("div");
        productBlock.className = "product-block";
        const productImage = renderProductImage(product);
        const productDetails = renderProductBlock(product);
        productBlock.innerHTML = productImage;
        productBlock.innerHTML += productDetails;
        productContainer.appendChild(productBlock);
    }

    const renderProductImage = (product) => {
        return `<div class='product-image-block'><img src='${product.variantImage ? product.variantImage : product.imageUrl}' alt='${product.imageAlt}' class='product-image' /></div>`
    }

    const renderErrorMessage=()=>{
      const recommendationContainer = document.querySelector(".tangent-recommendation-container");
      recommendationContainer.innerHTML = `<p class="error-message">Product or variant not available, please try again.</p>`
    }

    const renderProductBlock = (product) => {
        return `
        <div class='product-detail-block'>
            <div>
                <h2 class='product-title'>${product.title} ${product.variantTitle}</h2>
                <div class='product-price-block'>
                    <div class='price-block'>
                        <p class='product-price'>$${product.price}</p>
                    </div>
                    ${product.offerLabel ? `<div class='ffer-block'>
                            <p class='offer-tag'>${product.offerLabel}</p>
                        </div>` : ''
            }
                    <div class='rating-block'></div>
                </div>
                <div class='product-description-block'>
                    <p class='product-description'>${product.description}</p>
                </div>
                <div class='product-advantages-block'>
                    <p class='advantage-title'>Advantages</p>
                    <div class='product-feature-container'>
                        ${getProductFeatures(product.productFeatures)}
                    </div>
                </div>
            </div>
            <div class='product-addcart-block'>
                <button class='add-to-cart-btn' data-variantid=${product.variantId}>Add to cart</button>
                <a class='learn-more-btn' href=${product.productURL} target='_blank'>Learn more</a>
                 <a class='shop-nfm-btn' href="https://www.nfm.com/bedgear?productType=Bed%20Pillows&sz=24" target='_blank'>Shop NFM</a>
            </div>
        </div>
        `
    }

    const getSelectedVariantsObject = (individualProducts, selectedVaraints) => {
        const filteredObject = {};
        // Iterate through the array of individual product IDs
        individualProducts.forEach((product) => {
            // Check if the product ID exists in the second object
            if (selectedVaraints.hasOwnProperty(product.id)) {
                // Add the product ID and its variants to the filtered object
                filteredObject[product.id] = selectedVaraints[product.id];
            }
        });
        return filteredObject;
    };

    const getRecommendedProductDetails = (selectedVariants, productList) => {
        let resultedProducts = [];
        // Map through selected variants and match them with products
        for (let productId in selectedVariants) {
            if (selectedVariants[productId].length > 0) {
                let matchingProduct = filterList(productList, productId); //get matching product
                if (matchingProduct) {
                    for (let variantId of selectedVariants[productId]) {
                        let matchingVariant = filterList(
                            matchingProduct.variants.edges,
                            variantId
                        ); //get matching variant
                        if (matchingVariant) {
                            let productDetails = {
                                title: matchingProduct.title,
                                handle: matchingProduct.handle,
                                description: matchingProduct.description,
                                productId: matchingProduct.id,
                                variantId: matchingVariant.node.id.split("/").pop(),
                                offerLabel: matchingProduct.offerLabel?.value,
                                variantTitle: matchingVariant.node.title,
                                productURL: getProductURL(matchingVariant.node.id.split("/").pop(), matchingProduct.handle),
                                variantImage: matchingVariant.node.image?.url,
                                price: matchingVariant.node.price,
                                isVariantAvailable: isVariantAvalaible(
                                    matchingProduct,
                                    matchingVariant.node
                                ),
                                imageUrl: matchingProduct.images.nodes[0].url,
                                imageAlt: `${matchingProduct.title} image`,
                                productFeatures: matchingProduct.productFeatures
                            };
                            resultedProducts.push(productDetails);
                        }
                    }
                }
            }
        }
        return resultedProducts;
    };

    //get product features
    const getProductFeatures = (product) => {
        const features = product?.reference;
        let featuresBlocks = ``;
        Object.keys(features).forEach((key) => {
            if (key.startsWith("feature")) {
                let index = key.replace("feature", "");
                let feature = features[key]?.value;
                let icon = features[`image${index}`]?.reference?.image?.url;
                if (feature && icon) {
                    featuresBlocks += `<div class='product-feature-block'>
                        <img src='${icon}' alt='${feature}' class='feature-icon' />
                        <p class='feature-title'>${feature}</p>
                    </div>`
                }
            }
        })
        return featuresBlocks;
    }

    //event handler for add to cart button
    const addClickHandler = () => {
        const addToCartBtns = document.querySelectorAll(".add-to-cart-btn");
        if (addToCartBtns.length === 0) return;
        addToCartBtns.forEach((btn) => {
            btn.addEventListener("click", () => {
                addVariantsToCart(btn.dataset.variantid);
            });
        })
    }

    //add variant/product to cart
    const addVariantsToCart = (variant_id) => {
        addItemToCart(variant_id);
        /*console.log("variant_ids", variant_ids);
        let formData = {
            'items': variant_ids.map((variant_id) => ({ "id": variant_id, "quantity": 1 }))
        }
        fetch('/cart/add.js', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        }).then((res) => {
            publish(PUB_SUB_EVENTS.cartUpdate, {
                source: 'product-form',
                productVariantId: variant_ids[0],
                cartData: res.json(),
            });
        }).catch((error) => {
            console.error('Error:', error);
        });*/
    }

    const addItemToCart = (variant_id) => {
        let cart = document.querySelector('cart-notification') || document.querySelector('cart-drawer'),
            formData = {
                items: [
                    {
                        id: variant_id,
                        quantity: 1
                    }
                ],
                sections: cart.getSectionsToRender().map(section => section.id)
            };
        cart.setActiveElement(document.activeElement);
        const config = fetchConfig('json');
        config.headers['X-Requested-With'] = 'XMLHttpRequest',
            config.body = JSON.stringify(formData),
            fetch(`${routes.cart_add_url}`, config).then(response => response.json()).then(
                response => {
                    if (response.errors) {
                        publish(
                            PUB_SUB_EVENTS.cartError,
                            {
                                source: 'product-form',
                                productVariantId: variant_id,
                                errors: response.errors,
                                message: response.errors
                            }
                        );
                        let errorMessageWrapper = document.querySelector('.product-form__error-message-wrapper');
                        if (!errorMessageWrapper) return;
                        let errorMessage = errorMessageWrapper.querySelector('.product-form__error-message');
                        errorMessageWrapper.toggleAttribute('hidden', !errorMessage),
                            errorMessage &&
                            (errorMessage.textContent = response.errors)
                    } else {
                        publish(
                            PUB_SUB_EVENTS.cartUpdate,
                            {
                                source: 'product-form',
                                productVariantId: variant_id
                            }
                        );
                        let cartObj = {};
                        Object.assign(cartObj, response.items[0]),
                            Object.assign(cartObj, {
                                sections: response.sections
                            }),
                            cart.renderContents(cartObj),
                            cart.classList.remove('is-empty'),
                            trapFocus(
                                document.getElementById('CartDrawer'),
                                document.getElementById('CartDrawer')
                            )
                    }
                }
            )
    }

    //to get the pruduct URL
    const getProductURL = (variantID, handle) => {
        return `${window.location.origin}/products/${handle}?variant=${variantID}`;
    };

    //get the single item from an array with a matching id
    const filterList = (lists, matchingId) => {
        return lists.find((list) => {
            const id = list.id || list.node?.id.split("/").pop();
            return id == matchingId;
        });
    };

    //get image slug
    const getImageSlug = (slugOrigin, slugName, fileType) => {
        return `${slugOrigin}/${slugName
            .toLowerCase()
            .replaceAll(" ", "-")}.${fileType}`;
    };

    //check variant availability
    const isVariantAvalaible = (product, variant) => {
        if (product.status == "ARCHIVED") {
            return false;
        } else {
            return (
                variant.inventoryQuantity > 0 || variant.inventoryPolicy === "CONTINUE"
            );
        }
    };

    return {
        init,
        fetchRecommendation,
        displayRecommendation,
        getSelectedVariantsObject,
        getRecommendedProductDetails,
    };
})();
