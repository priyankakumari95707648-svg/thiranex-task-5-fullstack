import { products } from "./data.js";
import { getCart, addToCart, updateQty, removeFromCart, cartCount, clearCart } from "./store.js";

const app=document.querySelector("#app");
const money=n=>`₹${n.toLocaleString("en-IN")}`;

function headerCount(){document.querySelector("#cart-count").textContent=cartCount();}

function productCard(p){
  return `<article class="card">
    <div class="product-image" aria-hidden="true">${p.emoji}</div>
    <div class="card-body">
      <div class="category">${p.category}</div><h3>${p.name}</h3>
      <p>${p.description}</p><div class="price">${money(p.price)}</div>
      <div class="card-actions">
        <a class="btn btn-secondary" href="#/product/${p.id}">View</a>
        <button class="btn btn-primary add-btn" data-id="${p.id}">Add</button>
      </div>
    </div>
  </article>`;
}

function bindAdd(){
  document.querySelectorAll(".add-btn").forEach(b=>b.onclick=()=>{
    addToCart(Number(b.dataset.id)); headerCount(); toast("Added to cart");
  });
}
function toast(msg){
  const t=document.createElement("div");t.className="toast";t.textContent=msg;
  document.body.appendChild(t);setTimeout(()=>t.remove(),1600);
}

function home(){
  app.innerHTML=`<section class="hero">
    <div><span class="badge">MODERN • SIMPLE • FAST</span>
      <h1>Everything you need, <span>beautifully.</span></h1>
      <p>A responsive e-commerce catalog built with modular JavaScript, client-side routing and persistent cart data.</p>
      <br><a class="btn btn-primary" href="#/products">Shop products</a>
    </div>
    <div class="hero-card"><div class="emoji">🛍️</div><div><h2>ShopEase</h2><p>Thiranex Task 5 Capstone</p></div></div>
  </section>
  <section><div class="section-title"><div><h2>Featured products</h2><p>Popular picks from our catalog.</p></div><a href="#/products">View all →</a></div>
  <div class="grid">${products.slice(0,3).map(productCard).join("")}</div></section>`;
  bindAdd();
}

function productsPage(){
  app.innerHTML=`<div class="section-title"><div><h1>Products</h1><p>Browse the full catalog.</p></div></div>
  <div class="toolbar"><input id="search" placeholder="Search products..." aria-label="Search products">
  <select id="category" aria-label="Filter by category"><option value="all">All categories</option>${[...new Set(products.map(p=>p.category))].map(c=>`<option>${c}</option>`).join("")}</select></div>
  <div id="product-grid" class="grid"></div>`;
  const render=()=>{
    const q=document.querySelector("#search").value.toLowerCase(),c=document.querySelector("#category").value;
    const list=products.filter(p=>(p.name+p.description).toLowerCase().includes(q)&&(c==="all"||p.category===c));
    document.querySelector("#product-grid").innerHTML=list.length?list.map(productCard).join(""):`<div class="empty">No products found.</div>`;
    bindAdd();
  };
  document.querySelector("#search").oninput=render;document.querySelector("#category").onchange=render;render();
}

function detail(id){
  const p=products.find(x=>x.id===Number(id));
  if(!p){notFound();return;}
  app.innerHTML=`<a href="#/products">← Back to products</a><br><br>
  <div class="cart-layout"><div class="hero-card"><div class="emoji">${p.emoji}</div><h1>${p.name}</h1></div>
  <div class="summary"><div class="category">${p.category}</div><h1>${p.name}</h1><p>${p.description}</p><div class="price">${money(p.price)}</div>
  <button class="btn btn-primary add-btn" data-id="${p.id}">Add to cart</button></div></div>`;
  bindAdd();
}

function cart(){
  const items=getCart().map(x=>({...x,...products.find(p=>p.id===x.id)}));
  const subtotal=items.reduce((s,x)=>s+x.price*x.qty,0);
  app.innerHTML=`<div class="section-title"><div><h1>Your Cart</h1><p>${items.length?`${items.length} product type(s)`: "Your cart is empty."}</p></div></div>
  ${items.length?`<div class="cart-layout"><div>${items.map(x=>`<div class="cart-item">
  <div class="cart-thumb">${x.emoji}</div><div class="cart-info"><b>${x.name}</b><div>${money(x.price)}</div>
  <div class="qty"><button data-minus="${x.id}">−</button><span>${x.qty}</span><button data-plus="${x.id}">+</button><button data-remove="${x.id}" aria-label="Remove ${x.name}">Remove</button></div></div>
  <b>${money(x.price*x.qty)}</b></div>`).join("")}</div>
  <aside class="summary"><h2>Summary</h2><div class="summary-row"><span>Subtotal</span><span>${money(subtotal)}</span></div><div class="summary-row"><span>Delivery</span><span>Free</span></div><div class="summary-row summary-total"><span>Total</span><span>${money(subtotal)}</span></div><br><button class="btn btn-primary" id="checkout">Checkout</button></aside></div>`:`<div class="empty"><h2>Nothing here yet 🛒</h2><p>Add a product to get started.</p><br><a class="btn btn-primary" href="#/products">Browse products</a></div>`}`;
  document.querySelectorAll("[data-plus]").forEach(b=>b.onclick=()=>{updateQty(Number(b.dataset.plus),1);cart()});
  document.querySelectorAll("[data-minus]").forEach(b=>b.onclick=()=>{updateQty(Number(b.dataset.minus),-1);cart()});
  document.querySelectorAll("[data-remove]").forEach(b=>b.onclick=()=>{removeFromCart(Number(b.dataset.remove));cart()});
  document.querySelector("#checkout")?.addEventListener("click",()=>{clearCart();headerCount();toast("Demo checkout complete");setTimeout(cart,500)});
}

function about(){app.innerHTML=`<section class="about"><span class="badge">THIRANEX TASK 5</span><h1>About ShopEase</h1><p>ShopEase is a production-style frontend capstone demonstrating modular architecture, client-side routing, reusable UI components, responsive design, localStorage persistence and optimized static assets.</p><p><b>Stack:</b> HTML5 · CSS3 · Vanilla JavaScript · Web Storage API</p><p>The project is static and can be deployed directly to Vercel, Netlify or GitHub Pages.</p></section>`;}
function notFound(){app.innerHTML=`<section class="not-found"><h1>404</h1><p>Page not found.</p><br><a class="btn btn-primary" href="#/">Go home</a></section>`;}

function router(){
  const [path,param]=location.hash.replace(/^#\/?/,"").split("/");
  if(path==="")home(); else if(path==="products")productsPage(); else if(path==="product")detail(param); else if(path==="cart")cart(); else if(path==="about")about(); else notFound();
  headerCount(); window.scrollTo({top:0,behavior:"smooth"});
}
window.addEventListener("hashchange",router);router();
