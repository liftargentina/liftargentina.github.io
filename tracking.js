/* Medición de Lift Argentina: Meta Pixel + Google Analytics 4.
   Para activar, completar los dos IDs. Si un ID queda vacío, esa herramienta no se carga.
   Si los dos están vacíos, este archivo no hace nada (ni muestra el aviso de cookies). */
(function () {
  var META_PIXEL_ID = "";   // ej: "123456789012345"  (Meta Business > Administrador de eventos)
  var GA4_ID = "";          // ej: "G-XXXXXXXXXX"     (Google Analytics > Flujo de datos web)

  if (!META_PIXEL_ID && !GA4_ID) return;

  var KEY = "lift_cookies";
  function getChoice() { try { return localStorage.getItem(KEY); } catch (e) { return null; } }
  function setChoice(v) { try { localStorage.setItem(KEY, v); } catch (e) {} }

  var loaded = false;
  function load() {
    if (loaded) return; loaded = true;
    if (META_PIXEL_ID) {
      !function (f, b, e, v, n, t, s) { if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments) }; if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = []; t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s) }(window, document, 'script', 'https://connect.facebook.net/en_US/fbevents.js');
      fbq('init', META_PIXEL_ID);
      fbq('track', 'PageView');
    }
    if (GA4_ID) {
      var s = document.createElement('script'); s.async = true;
      s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
      document.head.appendChild(s);
      window.dataLayer = window.dataLayer || [];
      window.gtag = function () { dataLayer.push(arguments); };
      gtag('js', new Date());
      gtag('config', GA4_ID);
    }
  }

  function meta(ev, params, custom) { if (window.fbq) fbq(custom ? 'trackCustom' : 'track', ev, params || {}); }
  function ga(ev, params) { if (window.gtag) gtag('event', ev, params || {}); }
  var isSocios = /socios/.test(location.pathname);

  // Eventos: se escuchan los clics sin tocar el código de la página
  document.addEventListener('click', function (e) {
    if (!loaded) return;
    var t = e.target.closest && e.target.closest('button,a'); if (!t) return;
    var d = t.dataset || {};
    if (t.id === 'sendBtn' && !t.disabled) {
      var v = 0; try { v = typeof total === 'function' ? total() : 0; } catch (x) {}
      meta('Lead', { value: v, currency: 'USD', content_name: 'Pedido por WhatsApp' });
      ga('generate_lead', { value: v, currency: 'USD', method: 'pedido_whatsapp' });
    } else if (t.href && t.href.indexOf('wa.me') > -1) {
      if (isSocios) { meta('SolicitudSocio', {}, true); ga('partner_request'); }
      else { meta('Contact', { content_name: 'WhatsApp' }); ga('contact_whatsapp'); }
    } else if (d.add) {
      meta('AddToCart', { content_ids: [d.add], content_type: 'product' });
      ga('add_to_cart', { items: [{ item_id: d.add }] });
    } else if (d.goline || d.line) {
      var line = d.goline || d.line;
      meta('ViewContent', { content_ids: [line], content_type: 'product' });
      ga('view_item', { items: [{ item_id: line }] });
    }
  }, true);

  // Aviso de cookies (informativo, con opción de rechazar)
  var choice = getChoice();
  if (choice === 'no') return;
  load();
  if (choice === 'si') return;
  function banner() {
    var b = document.createElement('div');
    b.setAttribute('role', 'region'); b.setAttribute('aria-label', 'Aviso de cookies');
    b.style.cssText = 'position:fixed;left:12px;right:12px;bottom:12px;z-index:9999;max-width:560px;margin:0 auto;background:#0E2433;color:#fff;border-radius:14px;padding:12px 14px;font:14px/1.4 Archivo,system-ui,sans-serif;display:flex;gap:10px;align-items:center;flex-wrap:wrap;box-shadow:0 6px 24px rgba(0,0,0,.25)';
    b.innerHTML = '<span style="flex:1 1 220px">Usamos cookies para medir las visitas y mejorar nuestros anuncios.</span>' +
      '<button type="button" data-ck="no" style="background:transparent;color:#fff;border:1px solid rgba(255,255,255,.5);border-radius:999px;padding:6px 14px;font:inherit;cursor:pointer">Rechazar</button>' +
      '<button type="button" data-ck="si" style="background:#fff;color:#0E2433;border:0;border-radius:999px;padding:7px 16px;font:inherit;font-weight:600;cursor:pointer">Aceptar</button>';
    b.addEventListener('click', function (e) {
      var c = e.target.getAttribute && e.target.getAttribute('data-ck'); if (!c) return;
      setChoice(c); b.remove();
      if (c === 'no') location.reload();
    });
    document.body.appendChild(b);
  }
  if (document.body) banner(); else document.addEventListener('DOMContentLoaded', banner);
})();
