window.addEventListener("_mpr_form_submit", function(payload){
  // Payload contain all data from the form
  console.log('the payload', payload);
  const detail_allinfo = payload.detail;
  let submittedEmail = detail_allinfo.email;
  let submittedLocation = detail_allinfo.city;
  let submittedProductid = detail_allinfo?.product?.id;
  let submittedProductVariantid = detail_allinfo?.product?.variantId;
  let submittedProductsku = detail_allinfo?.product?.sku;
  let enablereview = detail_allinfo?.['enable-the-checkbox-to-add-review'];
  let submittedRating = Number(detail_allinfo?.['rating']);
  let submittedRatingheading = detail_allinfo?.['review-title'];
  let submittedRatingcomment = detail_allinfo?.['comments'];
  let submittedUsername = detail_allinfo?.['firstName'];
 
  const isReviewEnabled = enablereview === true || enablereview === "true";
  
  if (isReviewEnabled) {
    const allinfo = {
      "fields": [
        {
          "id": "ag2",
          "field_type": "simple",
          "key": "rating",
          "label": "Your Rating",
          "value": submittedRating
        },
        {
          "id": "ag1",
          "field_type": "simple",
          "key": "headline",
          "label": "Review Headline",
          "value": ""+submittedRatingheading+""
        },
        {
          "id": "ag3",
          "field_type": "simple",
          "key": "comments",
          "label": "Comments",
          "value": ""+submittedRatingcomment+""
        },
        {
          "id": "ag7",
          "field_type": "simple",
          "key": "name",
          "label": "Nickname",
          "value": ""+submittedUsername+""
        },
        {
          "id": "ag8",
          "field_type": "simple",
          "key": "location",
          "label": "Location",
          "value": ""+submittedLocation+""
        },
        {
          "id": "email_collection",
          "field_type": "simple",
          "key": "email_collection",
          "label": "Email",
          "value": ""+submittedEmail+""
        }
      ]
    };
    fetch("https://writeservices.powerreviews.com/api/b2b/writereview/submit_review?apikey=3a5017af-6b0b-4aa7-ac7d-3352896fe3e2&locale=en_US&merchant_id=1806575603&page_id="+submittedProductid+"&page_id_variant="+submittedProductsku+"", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(allinfo)
    })
    .then((response) => response.json())
    .then((data) => {
      console.log("API response:", data);
    })
    .catch((error) => {
      console.error("API error:", error);
    });
  }
});