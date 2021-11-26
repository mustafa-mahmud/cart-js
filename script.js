'use strict';

const productsContainerEl = document.querySelector('.products-center');
const totalCartsItemsEl = document.querySelector('.cart-items');
const cartContentEl = document.querySelector('.cart-content');
const cartOverlayEl = document.querySelector('.cart-overlay');
const cartEl = document.querySelector('.cart');
const openCartBtn = document.querySelector('.cart-btn');
const closeCartBtn = document.querySelector('.close-cart');
const cartTotalEl = document.querySelector('.cart-total');
const clearCartEl = document.querySelector('.clear-cart');

let cartsArr = localStorage.getItem('store_id')
  ? JSON.parse(localStorage.getItem('store_id'))
  : [];

let productArr = [];

const fetchData = async () => {
  const res = await fetch('./products.json');
  const { items } = await res.json();

  processData(items);
};

const processData = (datas) => {
  datas.forEach((data) => {
    productArr.push({
      id: data.sys.id,
      title: data.fields.title,
      price: data.fields.price,
      image: data.fields.image.fields.file.url,
    });
  });

  displayUI(productArr);
};

const displayUI = (products) => {
  products.forEach((data) => {
    productsContainerEl.innerHTML += `
		<article class="product">
					<div class="img-container">
						<img src="${data.image}" alt="${data.title}" class="product-img">
						<button class="bag-btn" data-id="${data.id}">
							<i class="fas fa-shopping-cart"></i> add to bag
						</button>
					</div>
					<h3>${data.title}</h3>
					<h4>$${data.price}</h4>
				</article>
		`;
  });

  document
    .querySelectorAll('.bag-btn')
    .forEach((btn) => btn.addEventListener('click', addCart));

  addBagToInCart();
  incDecCart();
  addRemoveProducts();
};

const addCart = (e) => {
  const id = +e.target.getAttribute('data-id') - 1;
  const info = {
    id: id,
    initPrice: productArr[id].price,
    quantity: 1,
  };

  cartsArr.push(info);

  localStorage.setItem('store_id', JSON.stringify(cartsArr));

  cartsUpdate();
};

const cartsUpdate = () => {
  //add to bag change to in cart
  addBagToInCart();

  //cart icons increase as length of carts
  incDecCart();

  //add products to .cart
  addRemoveProducts();

  //total price add
  totalPrice(cartsArr);
};

const incDecCart = () => {
  totalCartsItemsEl.textContent = cartsArr.length;
};

const addBagToInCart = () => {
  const allBtns = document.querySelectorAll('.bag-btn');

  allBtns.forEach((btn) => {
    btn.textContent = 'ADD TO BAG';
    btn.style.pointerEvents = 'auto';
  });

  for (let i = 0; i < cartsArr.length; i++) {
    allBtns[cartsArr[i].id].textContent = 'IN CART';
    allBtns[cartsArr[i].id].style.pointerEvents = 'none';
  }
};

const addRemoveProducts = () => {
  cartContentEl.innerHTML = '';
  cartsArr.forEach((info) => {
    cartContentEl.innerHTML += `
					<div class="cart-item" data-id="${info.id}">
						<img src="${productArr[info.id].image}" alt="product item">
						<div>
							<h4>${productArr[info.id].title}</h4>
							<h5>$${productArr[info.id].price}</h5>
							<span class="remove-item">remove</span>
						</div>
						<div class="update-amount">
							<i class="fas fa-chevron-up inc"></i>
							<p class="item-amount">${info.quantity}</p>
							<i class="fas fa-chevron-down dec"></i>
						</div>
						<div id="total">
							<p>
								<strong>$${(productArr[info.id].price * info.quantity).toFixed(2)}</strong>
							</p>
						</div>
					</div>
		`;
  });

  document
    .querySelectorAll('.remove-item')
    .forEach((item) => item.addEventListener('click', removeCart));

  document
    .querySelectorAll('.update-amount')
    .forEach((item) => item.addEventListener('click', updateAmount));
};

const toggleCartOverlay = () => {
  cartOverlayEl.classList.toggle('show-cart');
};

const removeCart = (e) => {
  const id = +e.target.closest('.cart-item').getAttribute('data-id');

  for (let i = 0; i < cartsArr.length; i++) {
    if (cartsArr[i].id === id) cartsArr.splice(i, 1);
  }

  localStorage.setItem('store_id', JSON.stringify(cartsArr));

  cartsUpdate();
};

const updateAmount = (e) => {
  const target = e.target;
  const quantity = +target
    .closest('.update-amount')
    .querySelector('.item-amount').textContent;

  if (target.classList.contains('inc')) {
    const id = +target.closest('.cart-item').getAttribute('data-id');

    cartsArr = cartsArr.map((info) => {
      if (info.id === id) {
        return {
          id: id,
          initPrice: info.initPrice,
          quantity: (info.quantity += 1),
        };
      }

      return info;
    });
  }

  if (target.classList.contains('dec')) {
    if (quantity <= 1) return;

    const id = +target.closest('.cart-item').getAttribute('data-id');

    cartsArr = cartsArr.map((info) => {
      if (info.id === id) {
        return {
          id: id,
          initPrice: info.initPrice,
          quantity: (info.quantity -= 1),
        };
      }

      return info;
    });
  }

  localStorage.setItem('store_id', JSON.stringify(cartsArr));
  cartsUpdate();
};

const totalPrice = (total) => {
  let getTotal = total.map((amount) => amount.quantity * amount.initPrice);

  if (getTotal.length)
    getTotal = getTotal.reduce((prev, curr) => prev + curr).toFixed(2);
  else getTotal = 0;

  cartTotalEl.textContent = `${getTotal}`;
};

const clearCart = () => {
  localStorage.removeItem('store_id');
  cartsArr = [];

  cartsUpdate();
};

/////////////////////////////
fetchData();
totalPrice(cartsArr);
openCartBtn.addEventListener('click', toggleCartOverlay);
closeCartBtn.addEventListener('click', toggleCartOverlay);
clearCartEl.addEventListener('click', clearCart);
