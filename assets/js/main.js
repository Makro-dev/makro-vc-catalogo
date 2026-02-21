"use strict"; // Activa modo estricto, ayuda a prevenir errores comunes
console.log("🔐 Strict-safe activado");
// =========================
// MAIN.JS UNIFICADO – MAKRO VC
// Optimizado para conexiones lentas
// =========================
document.addEventListener("DOMContentLoaded", () => {
  // ======================
  // DETECTOR DE PÁGINA (BLINDAJE)
  // ======================
  const PAGE = {
    isIndex: document.getElementById("destacados") || document.getElementById("ofertas"),
    isCatalogo: document.getElementById("btn-buscar"),
    isProducto: document.getElementById("productImage")
  };
  // ======================
  // DETECTOR DE PRODUCTO OG (OG ONLY)
  // ======================
  const isStaticOGProduct =
  document.documentElement.hasAttribute("data-og-only") === true;
  // ======================
  // ELEMENTOS COMUNES
  // ======================
  const hamburger = document.getElementById("hamburger");
  const sidebar = document.querySelector(".sidebar");

  if (hamburger && sidebar) {
    hamburger.addEventListener("click", () => {
      sidebar.classList.toggle("active");
      document.body.classList.toggle("sidebar-open");
    });
  }

  if (window.visualViewport) {
    window.visualViewport.addEventListener("resize", () => {
      const keyboardOpen = window.visualViewport.height < window.innerHeight - 120;
      document.body.classList.toggle("keyboard-open", keyboardOpen);
    });
  }
  
  // ======================
  // ANIMACIONES DE ENTRADA
  // ======================
  const animated = document.querySelectorAll(".fade-up, .slide-left, .slide-right");
  if (animated.length) {
    const observerAnim = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("show");
          observerAnim.unobserve(entry.target);
        }
      });
    }, { threshold: 0.2 });

    animated.forEach(el => observerAnim.observe(el));
  }

  // ======================
  // LAZY LOAD GLOBAL
  // ======================
  const observerLazy = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        img.src = img.dataset.src || img.src;
        img.removeAttribute("data-src");
        img.classList.remove("lazy-img");
        observerLazy.unobserve(img);
      }
    });
  }, { rootMargin: "200px 0px" });

  document.querySelectorAll("img[data-src]").forEach(img => observerLazy.observe(img));

  // TODO el código de ofertas y destacados
  // ======================
  // INDEX.HTML – DESTACADOS Y OFERTAS
  // ======================
  if (PAGE.isIndex && typeof PRODUCTS !== "undefined") {

    const destacadosContainer = document.getElementById("destacados");
    const ofertasContainer = document.getElementById("ofertas");

    if (typeof PRODUCTS !== "undefined") {
      PRODUCTS.forEach(p => {
        // ===== OFERTAS =====
        if (p.oferta && ofertasContainer) {
          const card = document.createElement("article");
          card.className = "product-card en-oferta";
          card.innerHTML = `
          ${p.oferta ? `<span class="badge-oferta">OFERTA</span>` : ""}
          ${p.nuevo ? `<span class="badge-nuevo">NUEVO</span>` : ""}
          ${!p.disponible ? `<span class="badge-agotado">AGOTADO</span>` : ""}
          <img data-src="${p.imagen}" alt="${p.nombre}" class="lazy-img" width="200" height="240" decoding="async">
          <h3>${p.nombre}</h3>
          <p class="price">USD ${p.precio.usd}</p>
          ${renderStars(p.estrellas)}
          <div class="card-actions">
            <a href="producto-${p.id}.html" class="btn">Ver detalles</a>
          </div>
          `;

          ofertasContainer.appendChild(card);
          observerLazy.observe(card.querySelector("img"));
        }

        // ===== DESTACADOS =====
        if (p.destacado && destacadosContainer) {
          const card = document.createElement("article");
          card.className = "product-card";
          card.innerHTML = `
          <img
            data-src="${p.imagen}"
            alt="${p.nombre}"
            class="lazy-img"
            width="200"
            height="240"
            decoding="async"
          >
          <h3>${p.nombre}</h3>
          <p class="price">USD ${p.precio.usd}</p>
          ${renderStars(p.estrellas)}
        
          <div class="card-actions">
            <a href="producto-${p.id}.html" class="btn">Ver detalles</a>
          </div>
          `;
          destacadosContainer.appendChild(card);
          observerLazy.observe(card.querySelector("img"));
        }
      });

      // Carrusel automático
      const initCarousels = () => {
        const carousels = document.querySelectorAll(
          ".ofertas.scroll-horizontal, .destacados.scroll-horizontal"
        );
        carousels.forEach(carousel => {
          let scrollSpeed = 0.8, direction = 1, isPaused = false;
          const updateSpeed = () => {
            const cards = carousel.querySelectorAll(".product-card, .offer-card");
            scrollSpeed = Math.max(0.5, Math.min(1.5, cards.length / 6));
          };
          updateSpeed();
          window.addEventListener("resize", updateSpeed);

          const step = () => {
            if (!isPaused) {
              carousel.scrollLeft += scrollSpeed * direction;
              if (carousel.scrollLeft + carousel.clientWidth >= carousel.scrollWidth) direction = -1;
              else if (carousel.scrollLeft <= 0) direction = 1;
            }
            requestAnimationFrame(step);
          };
          step();
          carousel.addEventListener("mouseenter", () => (isPaused = true));
          carousel.addEventListener("mouseleave", () => (isPaused = false));

          carousel.style.scrollBehavior = "auto";
        });
      };
      initCarousels();
    }
  }
  // BLINDAJE
  if (PAGE.isCatalogo && typeof PRODUCTS !== "undefined") {
    // ======================
    // CATALOGO.HTML – FILTROS Y PAGINACIÓN
    // ======================
    const searchInput = document.getElementById("search");
    const categoriaSelect = document.getElementById("categoria");
    const zonaSelect = document.getElementById("zona");
    const ordenSelect = document.getElementById("orden");
    const resultadosMsg = document.getElementById("filtro-resultados");
    const categoriasDOM = document.querySelectorAll(".categoria");
    const btnBuscar = document.getElementById("btn-buscar");
    const btnLimpiar = document.getElementById("btn-limpiar");
    const btnCargarMas = document.getElementById("btn-cargar-mas");

    const STORAGE_KEY = "makrovc_filtro";
    const ITEMS_POR_PAGINA = 12;
    let productosVisibles = ITEMS_POR_PAGINA;
    let listaFiltrada = [];
    let filtroGuardado = JSON.parse(localStorage.getItem(STORAGE_KEY)) || {
      search: "",
      categoria: "todas",
      zona: "todas",
      orden: "default"
    };

    if (searchInput) searchInput.value = filtroGuardado.search;
    if (categoriaSelect) categoriaSelect.value = filtroGuardado.categoria;
    if (zonaSelect) zonaSelect.value = filtroGuardado.zona;
    if (ordenSelect) ordenSelect.value = filtroGuardado.orden;

    const guardarFiltros = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(filtroGuardado));

    const renderParcial = () => renderCatalogo(listaFiltrada.slice(0, productosVisibles));

    const renderCatalogo = (productos) => {
      categoriasDOM.forEach(cat => {
        const grid = cat.querySelector(".product-grid");
        grid.innerHTML = "";
        cat.style.display = "none";
      });
      const buffers = {};
      productos.forEach(p => {
        if (!buffers[p.categoria]) buffers[p.categoria] = [];
        buffers[p.categoria].push(cardHTMLCatalogo(p));
      });
      Object.entries(buffers).forEach(([catId, htmls]) => {
        const categoria = document.getElementById(catId);
        if (!categoria) return;
        const grid = categoria.querySelector(".product-grid");
        grid.innerHTML = htmls.join("");
        categoria.style.display = "";

        if (grid.classList.contains("scroll-horizontal")) {
          grid.style.display = "flex";
          grid.style.overflowX = "auto";
          grid.style.flexWrap = "nowrap";
          grid.style.gap = "12px";
          grid.style.padding = "0 12px";
          grid.querySelectorAll(".product-card").forEach(card => {
            card.style.flex = "0 0 auto";
           card.style.width = "160px";
            card.style.marginRight = "12px";
          });
        } else {
          grid.classList.remove("scroll-horizontal");
        }

        grid.querySelectorAll("img[data-src]").forEach(img => observerLazy.observe(img));
      });
    };

    const cardHTMLCatalogo = (p) => {
      // Clase extra si está agotado
      const soldOutClass = !p.disponible ? "product-soldout" : "";

      return `
      <article class="product-card ${p.oferta ? "en-oferta" : ""} ${soldOutClass}">
        ${p.oferta ? `<span class="badge-oferta">OFERTA</span>` : ""}
        ${p.nuevo ? `<span class="badge-nuevo">NUEVO</span>` : ""}
        ${!p.disponible ? `<span class="badge-agotado">AGOTADO</span>` : ""}
        <img data-src="${p.imagen}" alt="${p.nombre}" class="lazy-img" width="200" height="240" decoding="async">
        <h3>${p.nombre}</h3>
        <p class="price">USD ${p.precio.usd}</p>
        ${renderStars(p.estrellas)}
        <div class="card-actions">
          <a href="producto-${p.id}.html"
            class="btn ${!p.disponible ? "disabled" : ""}" 
            ${!p.disponible ? 'aria-disabled="true"' : ""}>
            ${p.disponible ? "Ver" : "Agotado"}
          </a>
        </div>
      </article>
      `;
    };

    const toggleBtnLimpiar = () => {
      if (!btnLimpiar) return;
      const filtrosActivos =
      searchInput.value.trim() !== "" ||
      categoriaSelect.value !== "todas" ||
      zonaSelect.value !== "todas" ||
      ordenSelect.value !== "default";
      btnLimpiar.classList.toggle("show", filtrosActivos);
    };

    const aplicarFiltros = () => {
      if (typeof PRODUCTS === "undefined") return;
      let lista = [...PRODUCTS];

      // Texto
      if (filtroGuardado.search) {
        const txt = filtroGuardado.search.toLowerCase();
        lista = lista.filter(p => p.nombre.toLowerCase().includes(txt));
      }
      // Categoria
      if (filtroGuardado.categoria !== "todas") {
        lista = lista.filter(p => p.categoria === filtroGuardado.categoria);
      }
      // Zona
      if (filtroGuardado.zona !== "todas") {
        lista = lista.filter(p =>
          p.zonasEnvio &&
          (p.zonasEnvio.incluida?.includes(filtroGuardado.zona) ||
          p.zonasEnvio.adicional?.includes(filtroGuardado.zona))
        );
      }
      // Orden
      if (filtroGuardado.orden === "asc") lista.sort((a,b)=>a.precio.usd-b.precio.usd);
      if (filtroGuardado.orden === "desc") lista.sort((a,b)=>b.precio.usd-a.precio.usd);

      listaFiltrada = lista;
      productosVisibles = ITEMS_POR_PAGINA;
      renderParcial();
      actualizarBtnCargarMas();

      if (resultadosMsg) {
        resultadosMsg.textContent =
        listaFiltrada.length === 0
        ? "No se encontraron productos con esos filtros."
        : `Se encontraron ${listaFiltrada.length} productos.`;
      }
    };

    const actualizarBtnCargarMas = () => {
      if (!btnCargarMas) return;
      btnCargarMas.classList.toggle("hidden", productosVisibles >= listaFiltrada.length);
    };

    if (btnCargarMas) btnCargarMas.addEventListener("click", () => {
      productosVisibles += ITEMS_POR_PAGINA;
      renderParcial();
      actualizarBtnCargarMas();
    });

    if (searchInput) {
      searchInput.addEventListener("change", () => {
        filtroGuardado.search = searchInput.value.trim();
        guardarFiltros();
        aplicarFiltros();
        toggleBtnLimpiar();
      });
      searchInput.addEventListener("search", () => {
        filtroGuardado.search = searchInput.value.trim();
        guardarFiltros();
        aplicarFiltros();
        toggleBtnLimpiar();
      });
      searchInput.addEventListener("input", toggleBtnLimpiar);
    }

    [categoriaSelect, zonaSelect, ordenSelect].forEach(el => {
      if (el) el.addEventListener("change", () => {
        filtroGuardado[el.id] = el.value;
        guardarFiltros();
        aplicarFiltros();
        toggleBtnLimpiar();
      });
    });

    if (btnBuscar) btnBuscar.addEventListener("click", () => {
      filtroGuardado.search = searchInput.value.trim();
      guardarFiltros();
      aplicarFiltros();
      toggleBtnLimpiar();
    });

    if (btnLimpiar) btnLimpiar.addEventListener("click", () => {
      filtroGuardado = { search:"", categoria:"todas", zona:"todas", orden:"default" };
      if (searchInput) searchInput.value = "";
      if (categoriaSelect) categoriaSelect.value = "todas";
      if (zonaSelect) zonaSelect.value = "todas";
      if (ordenSelect) ordenSelect.value = "default";
      productosVisibles = ITEMS_POR_PAGINA;
      guardarFiltros();
      aplicarFiltros();
      toggleBtnLimpiar();
    });

    // Inicializar filtros al cargar
    aplicarFiltros();
    toggleBtnLimpiar();
  }
  
  // BLINDAJE
  if (PAGE.isProducto && typeof PRODUCTS !== "undefined") {
    // ======================
    // PRODUCTO.HTML – DETALLE INDIVIDUAL
    // ======================
    let productId = new URLSearchParams(location.search).get("id");

    if (!productId) {
      const match = location.pathname.match(/producto-(.+)\.html$/);
      if (match) productId = match[1];
    }

    const productSection = document.querySelector(".producto-detalle");
    const noProductMsg = document.querySelector(".no-product");

    if (!productId) {
      if (productSection) productSection.style.display = "none";
      if (noProductMsg) noProductMsg.style.display = "block";
      return;
    }
  
    if (productId && typeof PRODUCTS !== "undefined") {
      const product = PRODUCTS.find(p => p.id === productId);
    
      if (!product) {
        if (productSection) productSection.style.display = "none";
        if (noProductMsg) noProductMsg.style.display = "block";
        return;
      }
      if (product) {
        // Elementos DOM
        const img = document.getElementById("productImage");
        const nameEl = document.getElementById("productName");
        const priceEl = document.getElementById("productPrice");
        const oldPriceEl = document.getElementById("oldPrice");
        const desc = document.getElementById("productDescription");
        const details = document.getElementById("productDetails");
        const shipping = document.getElementById("shippingInfo");
        const whatsappBtn = document.getElementById("whatsappBtn");
        const callBtn = document.getElementById("callBtn");
        const badgeOferta = document.getElementById("badgeOferta");

        // Datos principales
        if (img) { img.src = product.imagen; img.alt = product.nombre; }
        if (nameEl) nameEl.textContent = product.nombre;
        if (priceEl) priceEl.textContent = product.precio?.usd ? `USD ${product.precio.usd}` : "Consultar";
        if (desc) desc.textContent = product.descripcion || "Descripción no disponible";

        // Oferta
        // Badges dinámicos
        if (badgeOferta) badgeOferta.style.display = "none"; // reset
        if (badgeOferta) {
          if (product.oferta && product.precioAnterior) {
            badgeOferta.textContent = "OFERTA";
            badgeOferta.style.display = "inline-block";
          } else if (product.nuevo) {
            badgeOferta.textContent = "NUEVO";
            badgeOferta.style.display = "inline-block";
          } else if (!product.disponible) {
            badgeOferta.textContent = "AGOTADO";
            badgeOferta.style.display = "inline-block";
          }
        }

        // Precio anterior
        if (oldPriceEl) {
          if (product.oferta && product.precioAnterior) {
            oldPriceEl.textContent = `USD ${product.precioAnterior}`;
            oldPriceEl.style.display = "inline";
          } else {
            oldPriceEl.style.display = "none";
          }
        }
        // Especificaciones
        if (details) details.innerHTML = (product.especificaciones || []).map(e=>`<li>✔ ${e}</li>`).join("");

        // Mensajería y extras
        if (shipping) {
          let html = "";
          if (product.zonasEnvio?.incluida?.length)
          html += `<h4>Mensajería incluida</h4><ul class="zonas incluida">${product.zonasEnvio.incluida.map(z=>`<li>${z}</li>`).join("")}</ul>`;
          else html += `<p><strong>Mensajería incluida:</strong> No disponible</p>`;
          if (product.zonasEnvio?.adicional?.length)
          html += `<h4>Mensajería adicional</h4><ul class="zonas adicional">${product.zonasEnvio.adicional.map(z=>`<li>${z}</li>`).join("")}</ul>`;
          if (product.monedas?.length) html += `<p><strong>Monedas aceptadas:</strong> ${product.monedas.join(", ")}</p>`;
          if (product.garantia) html += `<p><strong>Garantía:</strong> ${product.garantia}</p>`;
          if (product.extras?.length) html += `<p><strong>Extras:</strong> ${product.extras.join(", ")}</p>`;
          shipping.innerHTML = html;
        }

        // Contacto y bloqueo si AGOTADO
        if (!product.disponible) {
          // 1️⃣ Cambiar texto de badge
          if (badgeOferta) {
            badgeOferta.textContent = "AGOTADO";
            badgeOferta.style.display = "inline-block";
          }

          // 2️⃣ Bloquear botones
          if (whatsappBtn) {
            whatsappBtn.removeAttribute("href");
            whatsappBtn.classList.add("disabled");
            whatsappBtn.textContent = "Agotado";
            whatsappBtn.setAttribute("aria-disabled", "true");
          }
          if (callBtn) {
            callBtn.removeAttribute("href");
            callBtn.classList.add("disabled");
            callBtn.setAttribute("aria-disabled", "true");
          }

          // 3️⃣ Opcional: efecto visual para todo el producto
          if (productSection) productSection.classList.add("product-soldout");
        } else {
          // Producto disponible → inicializar botones normales
          initContactButtons(whatsappBtn, callBtn);
        }
        // SEO dinámico y Open Graph
        if (!isStaticOGProduct) {
        const seoTitle = document.getElementById("seoTitle");
        const seoDescription = document.getElementById("seoDescription");
        const ogTitle = document.getElementById("ogTitle");
        const ogDescription = document.getElementById("ogDescription");
        const ogImage = document.getElementById("ogImage");
        const preloadImg = document.getElementById("preloadOgImage");
        const ogUrl = document.getElementById("ogUrl");

        const priceText = product.precio?.usd ? `USD ${product.precio.usd}` : "Consultar precio";
        const seoText = `${product.nombre} en venta en Makro VC. ${product.descripcion || ""} Precio: ${priceText}. Mensajería incluida en Cuba.`;
        const canonical = document.getElementById("canonicalLink");
      
        if (seoTitle) seoTitle.textContent = `${product.nombre} | Makro VC`;
        if (seoDescription) seoDescription.setAttribute("content", seoText);

        if (ogTitle) ogTitle.content = product.nombre + " | Makro VC";
        if (ogDescription) ogDescription.content = product.descripcion || "Producto disponible en Makro VC";
        if (ogImage) ogImage.content = product.imagen;
        if (preloadImg) preloadImg.href = product.imagen;
        if (ogUrl) ogUrl.content = `https://makrovc.net/producto-${product.id}.html`;
        if (canonical && product?.id) {canonical.href = `https://makrovc.net/producto-${product.id}.html`;
        }
      }
    }
  }
  } 
/* =========================
   Auto-scroll suave Testimonios (solo móvil)
========================= */
(function () {
  const scroller = document.querySelector('.testimonials-scroll');
  if (!scroller) return;

  if (window.innerWidth > 768) return;

  let userInteracted = false;

  scroller.addEventListener('touchstart', () => {
    userInteracted = true;
  }, { once: true });

const observer = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.disconnect();

      setTimeout(() => {
        if (userInteracted) return;
        if (scroller.scrollWidth <= scroller.clientWidth) return;
        
        scroller.scrollBy({
          left: 80,
          behavior: 'smooth'
        });
      }, 400);
    }
  });
}, {
  threshold: 0.4
});

observer.observe(scroller);
})(); 
  
/* =========================
   Animación slide-right en viewport (Testimonios)
========================= */
(function () {
  const items = document.querySelectorAll('.testimonial.slide-right');
  if (!items.length) return;

  const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('show');
      }
    });
  }, {
    threshold: 0.3
  });

  items.forEach(el => observer.observe(el));
})();  
}); // DOMContentLoaded fin

