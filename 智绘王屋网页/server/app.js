(function () {
  'use strict';

  // ---------- 汉堡菜单 ----------
  var navToggle = document.getElementById('nav-toggle');
  var mainNav = document.getElementById('main-nav');

  if (navToggle && mainNav) {
    navToggle.addEventListener('click', function () {
      var isOpen = mainNav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // 点击导航链接后关闭菜单
    mainNav.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });

    // 点击页面其他地方关闭菜单
    document.addEventListener('click', function (e) {
      if (!navToggle.contains(e.target) && !mainNav.contains(e.target)) {
        mainNav.classList.remove('open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ---------- 轮播图 ----------
  var slides = document.querySelectorAll('.hero .slide');
  var dotsContainer = document.querySelector('.hero .carousel-dots');
  var currentSlide = 0;
  var slideInterval;

  var dotInactiveSrc, dotActiveSrc, useDotUrlIcons;
  function goToSlide(index) {
    if (!slides.length) return;
    currentSlide = (index + slides.length) % slides.length;
    slides.forEach(function (s, i) {
      s.classList.toggle('active', i === currentSlide);
    });
    var dots = dotsContainer && dotsContainer.querySelectorAll('.dot');
    if (dots) {
      dots.forEach(function (d, i) {
        d.classList.toggle('active', i === currentSlide);
        var img = d.querySelector('.dot-icon-img');
        if (img && useDotUrlIcons && dotInactiveSrc && dotActiveSrc) img.src = i === currentSlide ? dotActiveSrc : dotInactiveSrc;
      });
    }
  }

  function nextSlide() {
    goToSlide(currentSlide + 1);
  }

  function prevSlide() {
    goToSlide(currentSlide - 1);
  }

  if (slides.length && dotsContainer) {
    var dotIcon = dotsContainer.getAttribute('data-dot-icon') || '';
    var dotIconActive = dotsContainer.getAttribute('data-dot-icon-active') || '';
    var defaultInactive = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="white" opacity="0.5"/></svg>');
    var defaultActive = 'data:image/svg+xml,' + encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 10 10"><circle cx="5" cy="5" r="4" fill="white"/></svg>');
    dotInactiveSrc = dotIcon || defaultInactive;
    dotActiveSrc = dotIconActive || defaultActive;
    useDotUrlIcons = !!(dotIcon || dotIconActive);
    slides.forEach(function (_, i) {
      var dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'dot' + (i === 0 ? ' active' : '');
      dot.setAttribute('aria-label', '第' + (i + 1) + '张');
      var img = document.createElement('img');
      img.src = i === 0 ? dotActiveSrc : dotInactiveSrc;
      img.alt = '';
      img.className = 'dot-icon-img';
      dot.appendChild(img);
      dot.addEventListener('click', function () { goToSlide(i); });
      dotsContainer.appendChild(dot);
    });
    document.querySelector('.hero .carousel-btn.next').addEventListener('click', nextSlide);
    document.querySelector('.hero .carousel-btn.prev').addEventListener('click', prevSlide);
    slideInterval = setInterval(nextSlide, 5000);
  }

  // ---------- 锚点跳转：滚动到内容标题居中 ----------
  document.addEventListener('click', function (e) {
    var a = e.target.closest('a[href^="#"]');
    if (!a || a.getAttribute('href') === '#') return;
    var id = a.getAttribute('href').slice(1);
    if (!id) return;
    var target = document.getElementById(id);
    if (!target) return;
    e.preventDefault();
    var titleEl = target.querySelector('.section-title') || target.querySelector('h2') || target.querySelector('h1') || target;
    var rect = titleEl.getBoundingClientRect();
    var currentScroll = window.scrollY || window.pageYOffset;
    var elementCenterY = currentScroll + rect.top + rect.height / 2;
    var viewportHalf = window.innerHeight / 2;
    var targetScroll = elementCenterY - viewportHalf;
    var maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    targetScroll = Math.max(0, Math.min(targetScroll, maxScroll));
    window.scrollTo({ top: targetScroll, behavior: 'smooth' });
    if (history.replaceState) history.replaceState(null, '', '#' + id);
    else location.hash = id;
  });

  // ---------- 济源特产：点击随机跳转指定淘宝商品链接 ----------
  var taobaoRandomLinks = [
    'https://item.taobao.com/item.htm?id=1020138422690&mi_id=0000wu0zFCa_kk2EnVlXEYLKKWI49r2JV9lW0MO66oe0cmE&spm=a21xtw.29178619.0.0&xxc=shop',
    'https://item.taobao.com/item.htm?id=1021229637317&mi_id=0000hbuiDnImgB6IlpULSdIOQWaxhJN4BeXtK5zmZyZ9nGg&spm=a21xtw.29178619.0.0&xxc=shop',
    'https://item.taobao.com/item.htm?id=1022010168148&mi_id=0000-dJgjV963-Rnl7qlACqGyA5gFomeMAj0ftskpi7uV7E&spm=a21xtw.29178619.0.0&xxc=shop'
  ];
  document.querySelectorAll('.taobao-random').forEach(function (el) {
    el.addEventListener('click', function (e) {
      e.preventDefault();
      var url = taobaoRandomLinks[Math.floor(Math.random() * taobaoRandomLinks.length)];
      window.open(url, '_blank', 'noopener,noreferrer');
    });
  });

  // ---------- 热销/文创横向滚动（支持多个轮播） ----------
  document.querySelectorAll('.featured-carousel').forEach(function (carousel) {
    var track = carousel.querySelector('.feat-track');
    var prevBtn = carousel.querySelector('.feat-btn.prev');
    var nextBtn = carousel.querySelector('.feat-btn.next');
    if (track && prevBtn) prevBtn.addEventListener('click', function () {
      track.scrollBy({ left: -220, behavior: 'smooth' });
    });
    if (track && nextBtn) nextBtn.addEventListener('click', function () {
      track.scrollBy({ left: 220, behavior: 'smooth' });
    });
  });

  // ---------- 淘宝店铺跳转（店铺未建好：显示提示弹窗） ----------
  var taobaoModal = document.getElementById('taobao-modal');
  var closeTaobaoModal = document.getElementById('close-taobao-modal');

  function openTaobaoModal() {
    if (taobaoModal) {
      taobaoModal.setAttribute('aria-hidden', 'false');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeTaobaoModalFn() {
    if (taobaoModal) {
      taobaoModal.setAttribute('aria-hidden', 'true');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('a[href="#taobao"]').forEach(function (a) {
    a.addEventListener('click', function (e) {
      e.preventDefault();
      openTaobaoModal();
    });
  });

  if (closeTaobaoModal) closeTaobaoModal.addEventListener('click', closeTaobaoModalFn);
  if (taobaoModal) {
    taobaoModal.addEventListener('click', function (e) {
      if (e.target === taobaoModal) closeTaobaoModalFn();
    });
  }

  // ---------- AI 智能咨询（支持图片） ----------
  var aiWidget = document.getElementById('ai-chat-widget');
  var aiMessages = document.getElementById('ai-messages');
  var aiForm = document.getElementById('ai-chat-form');
  var aiInput = document.getElementById('ai-input');
  var openAiChat = document.getElementById('open-ai-chat');
  var quickAi = document.getElementById('quick-ai');
  var footerAi = document.getElementById('footer-ai');
  var closeAiChat = document.getElementById('close-ai-chat');
  var aiFab = document.getElementById('ai-fab');
  var imageInput = document.getElementById('ai-image-input');
  var imagePreview = document.getElementById('ai-image-preview');
  var previewImg = document.getElementById('ai-preview-img');
  var previewRemove = document.getElementById('ai-preview-remove');

  var chatHistory = [];
  var pendingImage = null;

  function showImagePreview(dataUrl) {
    pendingImage = dataUrl;
    if (previewImg) previewImg.src = dataUrl;
    if (imagePreview) {
      imagePreview.removeAttribute('hidden');
      imagePreview.setAttribute('aria-hidden', 'false');
    }
  }

  function hideImagePreview() {
    pendingImage = null;
    if (previewImg) previewImg.src = '';
    if (imagePreview) {
      imagePreview.setAttribute('hidden', '');
      imagePreview.setAttribute('aria-hidden', 'true');
    }
    if (imageInput) imageInput.value = '';
  }

  function openAiWidget() {
    if (aiWidget) {
      aiWidget.setAttribute('aria-hidden', 'false');
      if (aiInput) aiInput.focus();
    }
  }

  function closeAiWidget() {
    if (aiWidget) aiWidget.setAttribute('aria-hidden', 'true');
  }

  [openAiChat, quickAi, footerAi, aiFab].forEach(function (el) {
    if (el) el.addEventListener('click', function (e) {
      e.preventDefault();
      openAiWidget();
    });
  });

  if (closeAiChat) closeAiChat.addEventListener('click', closeAiWidget);

  function appendMessage(isUser, content) {
    if (!aiMessages) return;
    var div = document.createElement('div');
    div.className = 'ai-msg ' + (isUser ? 'user' : 'bot');
    var p = document.createElement('p');
    p.textContent = content;
    div.appendChild(p);
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function appendImageMessage(imgSrc) {
    if (!aiMessages) return;
    var div = document.createElement('div');
    div.className = 'ai-msg user';
    var img = document.createElement('img');
    img.src = imgSrc;
    img.alt = '用户上传';
    img.style.cssText = 'max-width:100%;max-height:180px;border-radius:8px;display:block;margin-bottom:4px;';
    div.appendChild(img);
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function appendTypingIndicator() {
    if (!aiMessages) return;
    var div = document.createElement('div');
    div.className = 'ai-msg bot typing';
    div.id = 'ai-typing';
    div.innerHTML = '<p><span class="dot-anim"></span><span class="dot-anim"></span><span class="dot-anim"></span></p>';
    aiMessages.appendChild(div);
    aiMessages.scrollTop = aiMessages.scrollHeight;
  }

  function removeTypingIndicator() {
    var el = document.getElementById('ai-typing');
    if (el) el.parentNode.removeChild(el);
  }

  function compressImage(file, maxW, maxH, quality, callback) {
    var reader = new FileReader();
    reader.onload = function (e) {
      var img = new Image();
      img.onload = function () {
        var w = img.width, h = img.height;
        if (w > maxW || h > maxH) {
          var ratio = Math.min(maxW / w, maxH / h);
          w = Math.round(w * ratio);
          h = Math.round(h * ratio);
        }
        var canvas = document.createElement('canvas');
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, w, h);
        callback(canvas.toDataURL('image/jpeg', quality));
      };
      img.onerror = function () { callback(null); };
      img.src = e.target.result;
    };
    reader.onerror = function () { callback(null); };
    reader.readAsDataURL(file);
  }

  if (imageInput) {
    imageInput.addEventListener('change', function (e) {
      var file = e.target.files && e.target.files[0];
      if (!file) return;
      compressImage(file, 1024, 1024, 0.75, function (dataUrl) {
        if (!dataUrl) { alert('图片处理失败，请重试'); return; }
        showImagePreview(dataUrl);
      });
      imageInput.value = '';
    });
  }

  if (previewRemove) {
    previewRemove.addEventListener('click', function () {
      hideImagePreview();
    });
  }

  // 已改为你的自定义域名
  function getAiChatUrl() {
    return "https://xinyuzhilv.xzy/api/chat";
  }

  function callAiApi() {
    return fetch(getAiChatUrl(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ messages: chatHistory })
    })
      .then(function (res) {
        return res.json().then(function (data) {
          return { ok: res.ok, data: data };
        });
      })
      .then(function (result) {
        var data = result.data;
        if (data.error) {
          var msg = data.error;
          if (data.detail) msg += '：' + data.detail;
          return msg;
        }
        if (!result.ok) return '请求失败，请确认已运行：cd server 后执行 node server.js';
        return data.reply;
      })
      .catch(function (err) {
        console.error('API 请求失败:', err);
        return '无法连接 AI 服务。';
      });
  }

  if (aiForm && aiInput) {
    aiForm.addEventListener('submit', function (e) {
      e.preventDefault();
      var question = (aiInput.value || '').trim();
      if (!question && !pendingImage) return;

      var sentImage = pendingImage;

      if (sentImage) {
        appendImageMessage(sentImage);
      }
      if (question) {
        appendMessage(true, question);
      }

      var userContent = question || '请描述这张图片里的内容';
      var msgPayload;
      if (sentImage) {
        msgPayload = {
          role: 'user',
          content: [
            { type: 'text', text: userContent },
            { type: 'image_url', image_url: { url: sentImage } }
          ]
        };
      } else {
        msgPayload = { role: 'user', content: userContent };
      }
      chatHistory.push(msgPayload);

      aiInput.value = '';

      if (sentImage) {
        hideImagePreview();
      }

      appendTypingIndicator();

      callAiApi().then(function (reply) {
        removeTypingIndicator();
        appendMessage(false, reply);
        chatHistory.push({ role: 'assistant', content: reply });
      });
    });
  }
})();

(function () {
  'use strict';
  var LAT = 35.12;
  var LON = 112.32;
  var forecastUrl =
    'https://api.open-meteo.com/v1/forecast?latitude=' +
    LAT +
    '&longitude=' +
    LON +
    '&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m' +
    '&daily=temperature_2m_max,temperature_2m_min,uv_index_max' +
    '&timezone=Asia%2FShanghai&forecast_days=1';
  var airUrl =
    'https://air-quality-api.open-meteo.com/v1/air-quality?latitude=' +
    LAT +
    '&longitude=' +
    LON +
    '&current=us_aqi&timezone=Asia%2FShanghai';

  function wmoDesc(code) {
    var m = {
      0: '晴',
      1: '晴',
      2: '多云',
      3: '阴',
      45: '雾',
      48: '雾',
      51: '小毛毛雨',
      53: '毛毛雨',
      55: '大毛毛雨',
      61: '小雨',
      63: '中雨',
      65: '大雨',
      71: '小雪',
      73: '中雪',
      75: '大雪',
      80: '阵雨',
      81: '强阵雨',
      82: '暴雨',
      95: '雷暴',
      96: '雷阵雨',
      99: '强雷暴'
    };
    return m[code] != null ? m[code] : '多云';
  }

  function aqiCn(us) {
    if (us == null || us === '') return '—';
    var u = Number(us);
    if (u <= 50) return '优';
    if (u <= 100) return '良';
    if (u <= 150) return '轻度污染';
    if (u <= 200) return '中度污染';
    return '重度及以上';
  }

  function uvCn(u) {
    if (u == null || u === '') return '—';
    var x = Number(u);
    if (x <= 2) return '最弱';
    if (x <= 5) return '弱';
    if (x <= 7) return '中等';
    if (x <= 10) return '强';
    return '很强';
  }

  function dressCn(t) {
    if (t == null) return '—';
    if (t < 5) return '寒冷';
    if (t < 12) return '较冷';
    if (t < 18) return '较舒适';
    if (t < 26) return '舒适';
    return '偏热';
  }

  function windCn(ms) {
    if (ms == null) return '—';
    var w = Number(ms);
    if (w <= 1.5) return '1–2级';
    if (w <= 5.4) return '2–3级';
    if (w <= 10.7) return '4–5级';
    return '6级及以上';
  }

  function weekdayCn() {
    var d = new Date();
    var names = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
    return names[d.getDay()];
  }

  function iconSvgForCode(code) {
    var rain = [51, 53, 55, 61, 63, 65, 80, 81, 82, 95, 96, 99];
    var snow = [71, 73, 75];
    if (rain.indexOf(code) >= 0) {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 14a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4"/><path d="M8 18v2M12 17v3M16 18v2"/></svg>';
    }
    if (snow.indexOf(code) >= 0) {
      return '<svg width="20" height="20" viewBox="0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/><circle cx="12" cy="12" r="3"/></svg>';
    }
    if (code === 0 || code === 1) {
      return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2"/></svg>';
    }
    return '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M6 14a4 4 0 0 1 4-4h2a4 4 0 0 1 4 4"/></svg>';
  }

  var strip = document.getElementById('weather-strip');
  if (!strip) return;

  Promise.all([fetch(forecastUrl), fetch(airUrl)])
    .then(function (responses) {
      return Promise.all(responses.map(function (r) {
        return r.json();
      }));
    })
    .then(function (results) {
      var wx = results[0];
      var air = results[1];
      var cur = wx.current;
      var daily = wx.daily;
      var aqi = air.current && air.current.us_aqi;

      var code = cur.weather_code;
      var t = Math.round(cur.temperature_2m);
      var h = Math.round(cur.relative_humidity_2m);
      var wsp = cur.wind_speed_10m;
      var tmax = daily && daily.temperature_2m_max ? Math.round(daily.temperature_2m_max[0]) : '—';
      var tmin = daily && daily.temperature_2m_min ? Math.round(daily.temperature_2m_min[0]) : '—';
      var uv = daily && daily.uv_index_max ? daily.uv_index_max[0] : null;

      var main =
        t +
        '° ' +
        weekdayCn() +
        '，现在' +
        wmoDesc(code) +
        '，最高气温' +
        tmax +
        '°，最低气温' +
        tmin +
        '°，空气质量 (AQI)：' +
        aqiCn(aqi);

      var elMain = document.getElementById('weather-line-main');
      var elIco = document.getElementById('weather-ico-main');
      if (elMain) elMain.textContent = main;
      if (elIco) elIco.innerHTML = iconSvgForCode(code);

      var elUv = document.getElementById('weather-uv');
      var elDress = document.getElementById('weather-dress');
      var elWind = document.getElementById('weather-wind');
      var elHumid = document.getElementById('weather-humid');
      if (elUv) elUv.textContent = '紫外线指数：' + uvCn(uv);
      if (elDress) elDress.textContent = '穿衣指数：' + dressCn(cur.temperature_2m);
      if (elWind) elWind.textContent = '风力状况：' + windCn(wsp);
      if (elHumid) elHumid.textContent = '湿度：' + h + '%';
    })
    .catch(function () {
      var elMain = document.getElementById('weather-line-main');
      if (elMain) {
        elMain.textContent =
          '天气数据暂时无法获取，请稍后再试或点击右侧「更多天气」查看官方预报。';
      }
    });
})();