// ── CAROUSEL ──
const TOTAL = 7;
const INTERVAL = 5000;
let current = 0;
let timer = null;
let progressTimer = null;
let progStart = null;

const wrap   = document.getElementById('slidesWrap');
const dots   = document.getElementById('carDots');
const ctr    = document.getElementById('carCounter');
const prog   = document.getElementById('carProgress');

// Build dots
for(let i=0;i<TOTAL;i++){
  const d = document.createElement('button');
  d.className = 'car-dot' + (i===0?' active':'');
  d.setAttribute('aria-label','Slide '+(i+1));
  d.onclick = ()=>moveTo(i);
  dots.appendChild(d);
}

function moveTo(n){
  current = ((n % TOTAL) + TOTAL) % TOTAL;
  wrap.style.transform = `translateX(-${current*100}%)`;
  document.querySelectorAll('.car-dot').forEach((d,i)=>d.classList.toggle('active',i===current));
  ctr.innerHTML = `<strong>${String(current+1).padStart(2,'0')}</strong> / ${String(TOTAL).padStart(2,'0')}`;
  resetProgress();
}

function resetProgress(){
  clearInterval(timer);
  cancelAnimationFrame(progressTimer);
  prog.style.transition = 'none';
  prog.style.width = '0%';
  progStart = performance.now();
  requestAnimationFrame(animProg);
  timer = setInterval(()=>moveTo(current+1), INTERVAL);
}

function animProg(ts){
  if(!progStart) progStart = ts;
  const elapsed = ts - progStart;
  const pct = Math.min((elapsed/INTERVAL)*100, 100);
  prog.style.transition = 'none';
  prog.style.width = pct + '%';
  if(pct < 100) progressTimer = requestAnimationFrame(animProg);
}

moveTo(0);

// Keyboard nav
document.addEventListener('keydown', e=>{
  if(e.key==='ArrowLeft') moveTo(current-1);
  if(e.key==='ArrowRight') moveTo(current+1);
});

// Touch swipe
let tx=0;
document.getElementById('inicio').addEventListener('touchstart',e=>{tx=e.touches[0].clientX},{passive:true});
document.getElementById('inicio').addEventListener('touchend',e=>{
  const dx = e.changedTouches[0].clientX - tx;
  if(Math.abs(dx)>50) moveTo(dx<0?current+1:current-1);
});

// ── CART ──
let cart = [];

function addToCart(name, price, emoji){
  price = parseFloat(price);
  const i = cart.findIndex(x=>x.name===name);
  if(i>-1) cart[i].qty++;
  else cart.push({name,price,emoji,qty:1});
  renderCart();
  showToast('✓ '+name.split('–').pop().trim()+' agregado');
}

function renderCart(){
  const body = document.getElementById('cartBody');
  const badge = document.getElementById('navBadge');
  const total = document.getElementById('cartTotal');
  const totalQty = cart.reduce((s,i)=>s+i.qty,0);
  const totalAmt = cart.reduce((s,i)=>s+i.price*i.qty,0);
  badge.textContent = totalQty;
  total.textContent = '$'+totalAmt.toFixed(2);

  if(!cart.length){
    body.innerHTML = `<div class="cart-empty"><span class="cart-empty-icon">🛒</span><p>Tu carrito está vacío</p><p style="margin-top:.4rem;font-size:.78rem;color:rgba(255,255,255,.2)">Agrega productos desde el menú</p></div>`;
    return;
  }
  body.innerHTML = cart.map((item,idx)=>`
    <div class="cart-item">
      <div class="ci-emoji">${item.emoji.length>2?item.emoji.slice(0,2):item.emoji}</div>
      <div class="ci-info">
        <h4>${item.name}</h4>
        <span>$${(item.price*item.qty).toFixed(2)}</span>
      </div>
      <div class="ci-qty">
        <button class="qbtn" onclick="changeQty(${idx},-1)">−</button>
        <span class="qnum">${item.qty}</span>
        <button class="qbtn" onclick="changeQty(${idx},1)">+</button>
      </div>
    </div>
  `).join('');
}

function changeQty(idx,d){
  cart[idx].qty+=d;
  if(cart[idx].qty<=0) cart.splice(idx,1);
  renderCart();
}

function clearCart(){
  cart=[];
  renderCart();
}

function openCart(){ document.getElementById('cartOverlay').classList.add('open'); renderCart(); }
function closeCart(){ document.getElementById('cartOverlay').classList.remove('open'); }
function closeCartOutside(e){ if(e.target===document.getElementById('cartOverlay')) closeCart(); }

function checkout(){
  if(!cart.length){ showToast('⚠ El carrito está vacío'); return; }
  const lines = cart.map(i=>`- ${i.name} x${i.qty} ($${(i.price*i.qty).toFixed(2)})`).join('%0A');
  const total = cart.reduce((s,i)=>s+i.price*i.qty,0).toFixed(2);
  const msg = `Hola Rapibolitas! Me gustaría hacer el siguiente pedido:%0A%0A${lines}%0A%0ATotal: $${total}%0A%0A¡Gracias! 💜`;
  window.open(`https://wa.me/50368428856?text=${msg}`,'_blank');
}

function showToast(msg){
  const t = document.getElementById('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(t._to);
  t._to = setTimeout(()=>t.classList.remove('show'), 2600);
}

renderCart();