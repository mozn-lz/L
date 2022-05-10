/* prevent ajax form double submit on click */

/* Search result proccessing START */
let loadproducts = (products) => {
    let product_Arr = [];
    products.forEach(product => {
        product_Arr.push(
            `<div class="product col-lg-3 col-md-4 col-sm-12 col-xs-12">` +
            `<div class="card">` +
            `<div class="card-header">` +
            `<a href="view-supplier/${product.supplier_id}">${product.supplier_name}</a>` +
            `</div>` +
            `<a href="view-product/${product.id}">` +
            `<img class="card-img-top border border-1" alt="product image" src=${product.product_image}>` +
            `<div class="card-body">` +
            `<div class="card-title">${product.product_name}</div>` +
            `<p class="card-text">M ${product.product_price}</p>` +
            `</div>` +
            `</a>` +
            `</div>` +
            `</div>`
        );
    });
    console.log(product_Arr.length);
    return (product_Arr);
}
let loadpromotions = (promotions) => {
    let promotion_arr = [];
    promotions.forEach(promotion => {
        promotion_arr.push(
            `<div class="promotion col-lg-3 col-md-4 col-sm-12 col-xs-12">` +
            `<div class="card">` +
            `<div class="card-header">` +
            `<a href="view-promotion/${promotion.supplier_id}">${promotion.supplier_name}</a>` +
            `</div>` +
            `<a href="view-promotion/${promotion.id}">` +
            // `<img class="card-img-top border border-1" alt="promotion image" src=${promotion.promotion_image}>` +
            `<div class="card-body">` +
            `<div class="card-title">${promotion.promotion_name}</div>` +
            `<p class="card-text">M ${promotion.promotion_expiry}</p>` +
            `</div>` +
            `</a>` +
            `</div>` +
            `</div>`
        );
    });
    console.log(promotion_arr.length);
    return (promotion_arr);
}
let loadsuppliers = (suppliers) => {
    let supplier_Arr = [];
    suppliers.forEach(supplier => {
        supplier_Arr.push(
            `<div class="promotion col-lg-3 col-md-4 col-sm-12 col-xs-12">` +
            `<div class="card">` +
            `<a href="view-supplier/${supplier.id}">` +
            `<img class="img-top border border-1" alt="supplier image" width="150px" src=${supplier.supplier_logo}>` +
            `<div class="card-body">` +
            `<div class="card-title">${supplier.supplier_name}</div>` +
            // `<p class="card-text">M ${promotion.product_price}</p>` +
            `</div>` +
            `</a>` +
            `</div>` +
            `</div>`
        );
    });
    console.log(supplier_Arr.length);
    return (supplier_Arr);
}

$('#search').keyup(() => {
    console.log(' Search ');
    if ($('#search').val().length > 1) {
        $.ajax({
            url: '/search',
            type: 'POST',
            data: { searchString: $('#search').val() },
            success: (result) => {
                console.log('result ', result);
                let result_arr = [];
                if (result.products.length) {
                    result_arr = result_arr.concat(loadproducts(result.products));
                    console.log('Products ', result_arr);
                }
                if (result.promotions.length) {
                    result_arr = result_arr.concat(loadpromotions(result.promotions));
                    console.log('promo ', result_arr);
                }
                if (result.suppliers.length) {
                    result_arr = result_arr.concat(loadsuppliers(result.suppliers));
                    console.log('supp ', result_arr);
                }
                // for (let i = 0; i < result.length; i++) {
                // 	const element = result[i];
                // 	result_arr.push(
                // 	`<button type="button" class="list-group-item list-group-item-action" onclick=setItemcode(${element.itemcode})>` +
                // 		`<b>${element.name} ${element.size} </b>` +
                // 		`M ${element.unit_selling.toFixed(2)} Remaining: ${element.remaining}` +
                // 	`</button>`);
                // }
                console.log('Siaplsy ', result_arr);
                $('#results').html(result_arr);
            },
            error: (e) => {
                console.log('Error: ', e)
            }
        });
    }
});
/* END	Search result proccessing  */


/* START preview logo START */
var openFile = function(event) {
        console.log('MAN ', event);
        var input = event.target;
        var reader = new FileReader();
        reader.onload = function() {
            console.log('MAN');
            var dataURL = reader.result;
            var output = document.getElementById('prev');
            output.src = dataURL;
        }
        reader.readAsDataURL(input.files[0]);
    }
    /* END preview logo END */

let categoryFilter = (cat) => {
    console.log(cat);
}

/**
 */
let getCurrentUrl = () => ($(location).attr('pathname'));

let countHit = () => {
        console.log('HitCnt uploading: ', getCurrentUrl())
        $.ajax({
            url: '/hit-counter',
            type: 'POST',
            data: {
                hitPath: getCurrentUrl(),
            },
            success: (result) => { console.log('Result ', result); },
            error: (e) => { console.log('Error: ', e) }
        });
    }
    // const url = $(location).attr('href');
    // const pathName = $(location).attr('pathname');

// save url to local storage
let setStoredURL = (url) => {
    console.log('set url', url);
    let save = (url[url.length - 1].url) != getCurrentUrl();
    console.log(typeof(url[url.length - 1].url), typeof(getCurrentUrl()), save);
    if (save) {
        console.log('ready to hit');
        countHit();
        localStorage.setItem('stored_url', JSON.stringify(url));
    }
}
let getStoredURL = () => {
    let stored_url = JSON.parse(localStorage.getItem('stored_url'));
    // console.log(stored_url);
    return (stored_url);
}
let urlready = () => {
        const path = getCurrentUrl();
        const storeObj = { url: path, time: Date.now() };
        let urlHistory = getStoredURL();
        const refreshTime = 20000 // 20s

        if (!urlHistory) {
            urlHistory = [3];
            urlHistory[0] = { url: path, time: Date.now() };
            setStoredURL(urlHistory);
        } else {
            setTimeout(() => {
                const index = urlHistory.findIndex(history => history.url == path);
                if ((index || index == 0) && index > -1) {
                    // url found 
                    if (Date.now() - urlHistory[index].time > refreshTime) {
                        // update last visit timestamp for current url
                        urlHistory.splice(index, 1);
                        urlHistory.push(storeObj);
                        setStoredURL(urlHistory);
                    }
                } else {
                    // url not found
                    if (urlHistory.length > 2)
                        urlHistory.shift(); // remoe oldest
                    urlHistory.push(storeObj); // instert new
                    setStoredURL(urlHistory);
                }
            }, 7000);
        }
    }
    // update last visit without reload; 20s intaval
if (getCurrentUrl().includes('view-product/') ||
    getCurrentUrl().includes('view-special/') ||
    getCurrentUrl().includes('view-supplier/')) {

    setInterval(() => {
        // console.log('Hello interval');
        urlready();
    }, 20000);
}

$(document).ready(urlready()); // set on page load