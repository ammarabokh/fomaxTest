/* ==========================================================================
   فوميكس | FOMEX — منطق الصفحة
   يقرأ كل النصوص والإعدادات من content/site-content.js (window.FOMEX_CONTENT).
   لتعديل النصوص لا تحتاج هذا الملف.
   ========================================================================== */
(function () {
  'use strict';

  const C = window.FOMEX_CONTENT;
  if (!C) { console.error('لم يُحمَّل ملف المحتوى content/site-content.js'); return; }
  const S = C.settings, T = C.texts, CT = C.contact;

  /* ---------------- أدوات مساعدة ---------------- */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const get = (obj, path) => path.split('.').reduce((o, k) => (o == null ? o : o[k]), obj);
  const phoneLink = `<a href="tel:${CT.phone}" class="phone-num">${esc(CT.phoneDisplay)}</a>`;
  const rich = s => esc(s).split('{phone}').join(phoneLink);
  const PENDING_TAG = label => `<span class="pending-tag">${label}</span>`;

  /* ---------------- ربط النصوص الثابتة ----------------
     data-t="hero.title"  ← نص من texts
     data-tel             ← رابط اتصال؛ data-tel="text" يكتب الرقم أيضًا
     data-fb              ← رابط فيسبوك
     data-addr="full|short" ← العنوان */
  $$('[data-t]').forEach(el => {
    const v = get(T, el.dataset.t);
    if (typeof v === 'string') el.textContent = v;
  });
  $$('[data-tel]').forEach(el => {
    el.href = 'tel:' + CT.phone;
    if (el.dataset.tel === 'text') el.textContent = CT.phoneDisplay;
  });
  $$('[data-fb]').forEach(el => { el.href = CT.facebook; });
  $$('[data-addr]').forEach(el => { el.textContent = el.dataset.addr === 'short' ? CT.addressShort : CT.address; });

  /* ---------------- رسوم توضيحية متساوية القياس ---------------- */
  const K = 0.866, H = 0.5;
  const P = (x, y, z) => [(x - y) * K, (x + y) * H - z];
  const pts = a => a.map(p => P(...p).map(n => n.toFixed(1)).join(',')).join(' ');
  const SKINS = {
    pressed: { top: '#ECEBE6', front: '#D3D1CA', side: '#B9B6AE', pat: 'beads' },
    xps:     { top: '#F2A869', front: '#D98749', side: '#B96E36', pat: 'none' },
    carbon:  { top: '#4F545A', front: '#3A3D42', side: '#2D3034', pat: 'speck' },
    hourdi:  { top: '#A7ABB0', front: '#8D9196', side: '#767A80', pat: 'none' },
  };
  const defs = () => `<defs>
    <pattern id="beads" width="9" height="9" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1.6" fill="#C9C6BE"/><circle cx="6.5" cy="6.5" r="1.3" fill="#D8D6CF"/></pattern>
    <pattern id="speck" width="11" height="11" patternUnits="userSpaceOnUse"><circle cx="2" cy="3" r=".9" fill="#7C8188"/><circle cx="8" cy="8" r=".7" fill="#686D73"/><circle cx="7" cy="2" r=".5" fill="#8A8F95"/></pattern>
  </defs>`;

  function box(o, w, d, h, s, opts = {}) {
    const [x, y, z] = o, st = 'stroke="rgba(0,0,0,.35)" stroke-width="1" stroke-linejoin="round"';
    const top = [[x, y, z + h], [x + w, y, z + h], [x + w, y + d, z + h], [x, y + d, z + h]];
    const front = [[x, y + d, z], [x + w, y + d, z], [x + w, y + d, z + h], [x, y + d, z + h]];
    const side = [[x + w, y, z], [x + w, y + d, z], [x + w, y + d, z + h], [x + w, y, z + h]];
    let g = `<polygon points="${pts(side)}" fill="${s.side}" ${st}/>` +
            `<polygon points="${pts(front)}" fill="${s.front}" ${st}/>` +
            `<polygon points="${pts(top)}" fill="${s.top}" ${st}/>`;
    if (s.pat !== 'none') g += `<polygon points="${pts(top)}" fill="url(#${s.pat})" opacity=".9"/><polygon points="${pts(front)}" fill="url(#${s.pat})" opacity=".45"/>`;
    g += `<polyline points="${pts([[x, y + d, z + h], [x + w, y + d, z + h], [x + w, y, z + h]])}" fill="none" stroke="rgba(255,255,255,.35)" stroke-width="1"/>`;
    if (opts.tongue) { // لسان جانبي (وصلة لسان وتجويف)
      const tw = 10, td = d * .82, th = h * .36, ty = y + (d - td) / 2, tz = z + (h - th) / 2;
      const tf = [[x + w, ty + td, tz], [x + w + tw, ty + td, tz], [x + w + tw, ty + td, tz + th], [x + w, ty + td, tz + th]];
      const ts = [[x + w + tw, ty, tz], [x + w + tw, ty + td, tz], [x + w + tw, ty + td, tz + th], [x + w + tw, ty, tz + th]];
      const tt = [[x + w, ty, tz + th], [x + w + tw, ty, tz + th], [x + w + tw, ty + td, tz + th], [x + w, ty + td, tz + th]];
      g += `<polygon points="${pts(ts)}" fill="${s.side}" ${st}/><polygon points="${pts(tf)}" fill="${s.front}" ${st}/><polygon points="${pts(tt)}" fill="${s.top}" ${st}/>`;
    }
    if (opts.cells) { // تجاويف بلوك الهوردي
      const n = opts.cells, pad = w * .07, gap = w * .06, cw = (w - pad * 2 - gap * (n - 1)) / n, cz0 = z + h * .2, cz1 = z + h * .8;
      for (let i = 0; i < n; i++) {
        const a = x + pad + i * (cw + gap);
        g += `<polygon points="${pts([[a, y + d, cz0], [a + cw, y + d, cz0], [a + cw, y + d, cz1], [a, y + d, cz1]])}" fill="#2A2D31" stroke="rgba(0,0,0,.4)"/>`;
        g += `<polygon points="${pts([[a, y + d, cz1], [a + cw, y + d, cz1], [a + cw, y + d - 14, cz1], [a, y + d - 14, cz1]])}" fill="#1E2023" opacity=".9"/>`;
      }
    }
    return g;
  }

  function productArt(kind) {
    const s = SKINS[kind], h = kind === 'pressed' ? 34 : 26, tongue = kind !== 'pressed';
    const body = kind === 'hourdi'
      ? box([0, 0, 0], 170, 120, 70, s, { cells: 3 })
      : box([0, 0, -48], 190, 130, h, s, { tongue }) + box([0, 0, 0], 190, 130, h, s, { tongue });
    return `<svg viewBox="-135 -110 320 230" aria-hidden="true">${defs()}${body}</svg>`;
  }

  function heroArt() {
    const W = 290, D = 180, Th = 26, layers = [['carbon', 0], ['xps', 76], ['pressed', 152]];
    const names = { pressed: 'فلين مضغوط', xps: 'فلين XPS', carbon: 'فلين كربوني' };
    const font = 'font-family="IBM Plex Sans Arabic, sans-serif" direction="rtl"';
    let g = '';
    layers.forEach(([k, z], i) => {
      const [ax, ay] = P(0, D, z + Th / 2);
      g += `<g class="layer layer-${i + 1}">${box([0, 0, z], W, D, Th, SKINS[k], { tongue: k !== 'pressed' })}
        <line x1="${ax.toFixed(1)}" y1="${ay.toFixed(1)}" x2="-215" y2="${ay.toFixed(1)}" stroke="#6B7077" stroke-width="1"/>
        <circle cx="${ax.toFixed(1)}" cy="${ay.toFixed(1)}" r="3" fill="#F47A20"/>
        <text x="-220" y="${(ay + 6).toFixed(1)}" fill="#F3F3F1" font-size="19" font-weight="600" text-anchor="start" ${font}>${names[k]}</text>
      </g>`;
    });
    // خط قياس السماكة
    const zt = 152, [x1, y1] = P(W + 16, 0, zt), [, y2] = P(W + 16, 0, zt + Th), xm = x1 + 24, ym = (y1 + y2) / 2;
    g += `<g class="dim" stroke="#F47A20" stroke-width="1.4" fill="none">
        <line x1="${xm.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${xm.toFixed(1)}" y2="${y2.toFixed(1)}"/>
        <line x1="${(xm - 8).toFixed(1)}" y1="${y1.toFixed(1)}" x2="${(xm + 8).toFixed(1)}" y2="${y1.toFixed(1)}"/>
        <line x1="${(xm - 8).toFixed(1)}" y1="${y2.toFixed(1)}" x2="${(xm + 8).toFixed(1)}" y2="${y2.toFixed(1)}"/>
        <line x1="${xm.toFixed(1)}" y1="${ym.toFixed(1)}" x2="${(xm + 36).toFixed(1)}" y2="${(ym - 34).toFixed(1)}" stroke-dasharray="3 4"/>
        <text x="${(xm + 40).toFixed(1)}" y="${(ym - 40).toFixed(1)}" fill="#F47A20" stroke="none" font-size="19" font-weight="600" text-anchor="end" ${font}>السماكة المناسبة؟</text>
      </g>`;
    return `<svg viewBox="-345 -215 830 470" aria-hidden="true">${defs()}${g}</svg>`;
  }

  const swatch = kind => {
    const s = SKINS[kind];
    return `<svg class="swatch" viewBox="-30 -26 60 52" aria-hidden="true">${defs()}${box([0, 0, -16], 30, 24, 10, s)}${box([0, 0, 0], 30, 24, 10, s)}</svg>`;
  };

  const USE_ART = {
    roof: `<svg viewBox="0 0 520 210" aria-hidden="true" font-family="IBM Plex Sans Arabic, sans-serif">
      <rect x="20" y="40" width="300" height="30" fill="#5C6066"/>
      <rect x="20" y="70" width="300" height="34" fill="#F2A869"/><rect x="20" y="70" width="300" height="34" fill="none" stroke="#F47A20" stroke-width="1.5" stroke-dasharray="5 4"/>
      <rect x="20" y="104" width="300" height="56" fill="#8D9196"/>
      <path d="M20 160h300" stroke="#3A3D42" stroke-width="2"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<path d="M${40 + i * 48} 104 l20 56" stroke="#7A7E83" stroke-width="1"/>`).join('')}
      <g fill="#B7BBC0" font-size="15" direction="rtl">
        <line x1="320" y1="55" x2="350" y2="55" stroke="#6B7077"/><text x="500" y="60" text-anchor="start">طبقة الإنهاء</text>
        <line x1="320" y1="87" x2="350" y2="87" stroke="#F47A20"/><text x="500" y="92" text-anchor="start" fill="#F3F3F1" font-weight="600">طبقة العزل</text>
        <line x1="320" y1="132" x2="350" y2="132" stroke="#6B7077"/><text x="500" y="137" text-anchor="start">البلاطة</text>
      </g></svg>`,
    wall: `<svg viewBox="0 0 520 210" aria-hidden="true" font-family="IBM Plex Sans Arabic, sans-serif">
      <rect x="60" y="20" width="70" height="170" fill="#8D9196"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M60 ${54 + i * 34}h70" stroke="#767A80"/>`).join('')}
      <rect x="130" y="20" width="44" height="170" fill="#F2A869"/><rect x="130" y="20" width="44" height="170" fill="none" stroke="#F47A20" stroke-width="1.5" stroke-dasharray="5 4"/>
      <rect x="174" y="20" width="70" height="170" fill="#8D9196"/>
      ${[0, 1, 2, 3, 4].map(i => `<path d="M174 ${38 + i * 34}h70" stroke="#767A80"/>`).join('')}
      <rect x="244" y="20" width="14" height="170" fill="#5C6066"/>
      <g fill="#B7BBC0" font-size="15" direction="rtl">
        <line x1="258" y1="50" x2="300" y2="50" stroke="#6B7077"/><text x="500" y="55" text-anchor="start">طبقة الإنهاء</text>
        <path d="M152 105 H300" stroke="#F47A20" fill="none"/><text x="500" y="110" text-anchor="start" fill="#F3F3F1" font-weight="600">طبقة العزل</text>
        <line x1="209" y1="160" x2="300" y2="160" stroke="#6B7077"/><text x="500" y="165" text-anchor="start">الجدار</text>
      </g></svg>`,
  };

  /* الصور المولّدة بالذكاء الاصطناعي تحمل وسم «صورة توضيحية» ظاهرًا للزوار،
     وتبقى معلّمة في وضع المراجعة حتى تُستبدل بصور حقيقية (settings.generatedImages). */
  const GEN = !!S.generatedImages;
  const IMG_NOTE = GEN ? '<span class="img-note">صورة توضيحية</span>' : '';
  const GEN_ATTR = GEN ? 'data-pending' : '';

  /* ---------------- الواجهة الرئيسية ---------------- */
  const heroBox = $('#heroArt');
  if (C.images.hero) {
    heroBox.outerHTML = `<div class="photo-wrap" ${GEN_ATTR}><img class="hero-photo" src="${esc(C.images.hero)}" alt="${esc(C.images.heroAlt)}" width="1600" height="1200" fetchpriority="high">${IMG_NOTE}</div>`;
    const note = $('.hero-visual .visual-note'); if (note) note.remove();
  } else {
    heroBox.innerHTML = heroArt();
  }

  /* ---------------- المنتجات ---------------- */
  const visible = C.products.filter(p => p.show);
  const ST = C.statusText;

  $('#strip').innerHTML = visible.map(p => `
    <li><a href="#p-${p.id}">${swatch(p.visual)}
      <span><span class="strip-name">${esc(p.name)}</span>
      <span class="status" data-status="${p.status}" ${p.status === 'pending' ? 'data-pending' : ''}>${ST[p.status]}</span></span>
    </a></li>`).join('');

  $('#productList').innerHTML = visible.map(p => {
    const specs = Object.entries(C.fieldLabels).map(([k, label]) => {
      const v = p.fields[k];
      return `<div ${v ? '' : 'data-pending'}><dt>${esc(label)}</dt><dd class="${v ? '' : 'empty'}">${v ? esc(v) : 'اسألنا عنها'}</dd></div>`;
    }).join('') +
      `<div ${p.status === 'pending' ? 'data-pending' : ''}><dt>حالة التوفر</dt><dd class="${p.status === 'pending' ? 'empty' : ''}">${ST[p.status]}</dd></div>`;
    const visual = p.image
      ? `<img src="${esc(p.image)}" alt="${esc(p.name)}" loading="lazy">${IMG_NOTE}`
      : productArt(p.visual);
    const visualAttrs = p.image
      ? `class="product-visual has-photo" ${GEN_ATTR}`
      : 'class="product-visual" data-pending title="رسم توضيحي — يُستبدل بصورة المنتج الحقيقية"';
    return `<article class="product" id="p-${p.id}" aria-labelledby="t-${p.id}">
      <div ${visualAttrs}>${visual}</div>
      <div class="product-body">
        <div class="product-top"><h3 id="t-${p.id}">${esc(p.name)}</h3>${p.image && !GEN ? '' : PENDING_TAG(p.image ? 'صورة مولّدة' : 'رسم توضيحي')}</div>
        <p class="product-desc" ${p.descApproved ? '' : 'data-pending'}>${esc(p.desc)}</p>
        <dl class="specs">${specs}</dl>
        <div class="product-cta">
          <a class="btn btn-primary btn-sm" href="#quote" data-pick="${p.id}">اطلب معلومات أو تسعيرة</a>
          <a class="btn btn-ghost btn-sm" href="tel:${CT.phone}">اتصل للاستفسار</a>
        </div>
      </div>
    </article>`;
  }).join('');

  /* ---------------- عن الشركة: صورة المقر (اختيارية) ---------------- */
  if (C.images.about) {
    const cap = C.images.aboutCaption ? `<figcaption>${esc(C.images.aboutCaption)}</figcaption>` : '';
    $('#aboutPhoto').innerHTML = `<figure class="about-photo photo-wrap" ${GEN_ATTR}><img src="${esc(C.images.about)}" alt="${esc(C.images.aboutAlt)}" loading="lazy">${IMG_NOTE}${cap}</figure>`;
  }

  /* ---------------- الاستخدامات ---------------- */
  $('#usesGrid').innerHTML = C.uses.map(u => {
    const names = u.productIds.map(id => C.products.find(p => p.id === id)).filter(Boolean).map(p => esc(p.name));
    const fig = u.image
      ? `<div class="photo-wrap" ${GEN_ATTR}><img src="${esc(u.image)}" alt="${esc(u.imageAlt || u.title)}" loading="lazy">${IMG_NOTE}</div>`
      : (USE_ART[u.id] || '');
    return `<article class="use">
      <figure${u.image ? ' class="has-photo"' : ''}>${fig}</figure>
      <div class="use-body">
        <h3>${esc(u.title)}</h3>
        <p>${esc(u.text)}</p>
        <p class="use-product" ${names.length ? '' : 'data-pending'}><span>المنتج المناسب:</span>${names.length ? names.join('، ') : '<a href="#quote" style="color:var(--orange-ink)">اسألنا عنه</a>'}</p>
      </div></article>`;
  }).join('');

  /* ---------------- الخطوات والأسئلة ---------------- */
  $('#steps').innerHTML = T.steps.items.map(s => `<li><h3>${esc(s.title)}</h3><p>${rich(s.text)}</p></li>`).join('');
  $('#faqList').innerHTML = C.faq.map((f, i) =>
    `<details ${i === 0 ? 'open' : ''}><summary>${esc(f.q)}</summary><div class="answer">${rich(f.a)}</div></details>`).join('');

  /* ---------------- قائمة المنتجات في النموذج ---------------- */
  const sel = $('#f-product');
  sel.innerHTML = `<option value="">اختر المنتج</option>` +
    visible.map(p => `<option value="${p.id}">${esc(p.name)}</option>`).join('') +
    `<option value="unsure">غير متأكد، أحتاج إلى استشارة</option>`;
  document.addEventListener('click', e => {
    const a = e.target.closest('[data-pick]');
    if (a) sel.value = a.dataset.pick;
  });

  /* ---------------- وضع المراجعة ---------------- */
  if (S.draftMode) {
    document.body.classList.add('is-draft', 'show-marks');
    $('#pendingCount').textContent = $$('[data-pending]').length;
    const t = $('#toggleMarks');
    t.addEventListener('click', () => {
      const on = document.body.classList.toggle('show-marks');
      t.setAttribute('aria-pressed', on);
      t.textContent = on ? 'إخفاء العلامات' : 'إظهار العلامات';
    });
  }

  /* ---------------- القائمة العلوية ---------------- */
  const header = $('.site-header'), menuBtn = $('.menu-btn');
  menuBtn.addEventListener('click', () => {
    const open = header.classList.toggle('open');
    menuBtn.setAttribute('aria-expanded', open);
    menuBtn.setAttribute('aria-label', open ? 'إغلاق القائمة' : 'فتح القائمة');
  });
  $$('.nav a').forEach(a => a.addEventListener('click', () => {
    header.classList.remove('open'); menuBtn.setAttribute('aria-expanded', false);
  }));
  const navLinks = $$('.nav a');
  const io = new IntersectionObserver(entries => entries.forEach(en => {
    if (en.isIntersecting) navLinks.forEach(a => a.setAttribute('aria-current', a.getAttribute('href') === '#' + en.target.id));
  }), { rootMargin: '-45% 0px -50% 0px' });
  ['home', 'products', 'about', 'faq', 'contact'].forEach(id => io.observe(document.getElementById(id)));

  /* ---------------- نموذج طلب التسعيرة ----------------
     بدون formEndpoint: لا يُرسل شيء عبر الإنترنت؛ يتحقق من الحقول ويجهّز نص الطلب،
     ثم يعرض: رسالة نصية SMS، اتصال مباشر، أو نسخ النص.
     مع formEndpoint: يُرسل JSON عبر POST ويعرض تأكيد الوصول عند نجاح الاستجابة. */
  const form = $('#quote'), result = $('#result'), submitBtn = $('#submitBtn'), hint = $('#formHint');
  if (!S.formEndpoint) {
    submitBtn.textContent = 'جهّز طلب التسعيرة';
    hint.textContent = 'سنجهّز نص طلبك لترسله برسالة نصية أو تقرأه علينا بالهاتف.';
  }
  const digits = v => v.replace(/[^\d]/g, '').length;
  const rules = {
    name:    v => v.trim().length >= 2 || 'اكتب اسمك.',
    phone:   v => (digits(v) >= 9 && digits(v) <= 15 && /^[\d\s+()-]+$/.test(v.trim())) || 'اكتب رقم هاتف صحيحًا، مثل 0958090258.',
    area:    v => v.trim().length >= 2 || 'اكتب المنطقة أو المدينة.',
    product: v => !!v || 'اختر المنتج، أو «غير متأكد» إن لم تكن تعرفه.',
  };
  function check(name) {
    const el = form.elements[name], r = rules[name](el.value), ok = r === true;
    el.setAttribute('aria-invalid', !ok);
    document.getElementById('e-' + name).textContent = ok ? '' : r;
    return ok;
  }
  Object.keys(rules).forEach(n => {
    form.elements[n].addEventListener('blur', () => { if (form.elements[n].value) check(n); });
    form.elements[n].addEventListener('input', () => { if (form.elements[n].getAttribute('aria-invalid') === 'true') check(n); });
  });

  function summary() {
    const f = form.elements, val = n => f[n].value.trim();
    return [
      'طلب تسعيرة — فوميكس',
      'الاسم: ' + val('name'),
      'الهاتف: ' + val('phone'),
      'المنطقة: ' + val('area'),
      'المنتج: ' + sel.options[sel.selectedIndex].text,
      val('thickness') && 'السماكة: ' + val('thickness'),
      val('quantity') && 'الكمية أو المساحة: ' + val('quantity'),
      val('notes') && 'ملاحظات: ' + val('notes'),
    ].filter(Boolean).join('\n');
  }

  form.addEventListener('submit', async e => {
    e.preventDefault();
    const bad = Object.keys(rules).filter(n => !check(n));
    if (bad.length) { form.elements[bad[0]].focus(); return; }
    const text = summary();

    if (S.formEndpoint) {
      submitBtn.disabled = true; submitBtn.textContent = 'جارٍ الإرسال…';
      try {
        const res = await fetch(S.formEndpoint, {
          method: 'POST', headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
          body: JSON.stringify(Object.fromEntries(new FormData(form))),
        });
        if (!res.ok) throw new Error(res.status);
        result.innerHTML = `<h4>وصل طلب التسعيرة</h4><p>سيتواصل معك فريق فوميكس على الرقم الذي كتبته. للاستفسار الآن اتصل على ${phoneLink}.</p>`;
        form.reset();
      } catch (_) {
        result.innerHTML = `<h4>لم يُرسل الطلب</h4><p>تعذّر الاتصال بالخادم. بياناتك ما زالت في النموذج؛ أعد المحاولة أو اتصل على ${phoneLink}.</p>`;
      }
      submitBtn.disabled = false; submitBtn.textContent = 'أرسل طلب التسعيرة';
    } else {
      result.innerHTML = `
        <h4>طلبك جاهز، لكنه لم يُرسل بعد</h4>
        <p>أرسله لنا برسالة نصية، أو اتصل واقرأ التفاصيل.</p>
        <pre id="sumText">${esc(text)}</pre>
        <div class="row">
          <a class="btn btn-primary btn-sm" href="sms:${CT.phone}?body=${encodeURIComponent(text)}">أرسل كرسالة نصية</a>
          <a class="btn btn-ghost btn-sm" href="tel:${CT.phone}">اتصل الآن</a>
          <button class="btn btn-ghost btn-sm" type="button" id="copyBtn">انسخ التفاصيل</button>
        </div>`;
      $('#copyBtn').addEventListener('click', async ev => {
        try { await navigator.clipboard.writeText(text); }
        catch (_) {
          const r = document.createRange(); r.selectNodeContents($('#sumText'));
          getSelection().removeAllRanges(); getSelection().addRange(r); document.execCommand('copy');
        }
        ev.target.textContent = 'نُسخت التفاصيل';
      });
    }
    result.hidden = false; result.focus();
  });

  $('#year').textContent = new Date().getFullYear();
})();
