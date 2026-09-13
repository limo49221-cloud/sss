/* =====================================================
   我的小站 · 第二步修正版
   ===================================================== */

const store = {
  get(key, def) {
    try { const v = JSON.parse(localStorage.getItem(key)); return v === null ? def : v; }
    catch (e) { return def; }
  },
  set(key, val) {
    try { localStorage.setItem(key, JSON.stringify(val)); }
    catch (e) { console.warn("存储失败", e); }
  }
};

const state = {
  settings: store.get("settings", {
    myName: "我", taName: "TA",
    myAvatar: "", taAvatar: "",
    bgColor: "#ededed", bgImage: "",
    myBubbleColor: "#95ec69", taBubbleColor: "#ffffff",
    fontSize: 17,
    replyDelayMin: 1, replyDelayMax: 3,
    readNoReplyProb: 10,
    pokeBackProb: 50,
    pokeCardProb: 50,
    voiceProb: 15,
    imgProb: 15,
    cardProb: 70,
    callRejectProb: 50,
    moodProb: 30,
    intentProb: 30
  }),
  cards: store.get("cards", { categories: [] }),
  pokeTexts: store.get("pokeTexts", ["拍了拍我的头", "拍了拍我的肩膀", "拍了拍我的脸"]),
  imageUrls: store.get("imageUrls", []),
  messages: store.get("messages", []),
  favoritesMine: store.get("favoritesMine", []),
  favoritesTa: store.get("favoritesTa", []),
  emojis: store.get("emojis", []),
  desktopIcons: store.get("desktopIcons", null)
};

function saveSettings() { store.set("settings", state.settings); }
function saveCards() { store.set("cards", state.cards); }
function savePokeTexts() { store.set("pokeTexts", state.pokeTexts); }
function saveImageUrls() { store.set("imageUrls", state.imageUrls); }
function saveMessages() { store.set("messages", state.messages); }
function saveFavMine() { store.set("favoritesMine", state.favoritesMine); }
function saveFavTa() { store.set("favoritesTa", state.favoritesTa); }
function saveEmojis() { store.set("emojis", state.emojis); }
function saveDesktopIcons() { store.set("desktopIcons", state.desktopIcons); }

function uid() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function nowBeijing() {
  const d = new Date();
  return new Date(d.getTime() + d.getTimezoneOffset() * 60000 + 8 * 3600000);
}
function fmtTime(d) { return `${String(d.getHours()).padStart(2,"0")}:${String(d.getMinutes()).padStart(2,"0")}`; }
function fmtFull(d) { return `${d.getMonth()+1}月${d.getDate()}日 ${fmtTime(d)}`; }
function fmtDate(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function pick(arr) { if (!arr || !arr.length) return null; return arr[Math.floor(Math.random() * arr.length)]; }
function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}
function compressImage(file, maxW = 1000, quality = 0.8) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = e => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement("canvas");
        let w = img.width, h = img.height;
        if (w > maxW) { h = h * maxW / w; w = maxW; }
        canvas.width = w; canvas.height = h;
        canvas.getContext("2d").drawImage(img, 0, 0, w, h);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  });
}
function toast(msg) {
  const t = document.createElement("div");
  t.textContent = msg;
  t.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:8px 16px;border-radius:20px;font-size:14px;z-index:9999;pointer-events:none;transition:opacity 0.3s;";
  document.body.appendChild(t);
  setTimeout(() => { t.style.opacity = "0"; setTimeout(() => t.remove(), 300); }, 1500);
}

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
  const el = document.getElementById(id);
  if (el) el.classList.add("active");
}
document.querySelectorAll("[data-back]").forEach(btn => {
  btn.addEventListener("click", () => showScreen("desktop"));
});

const DEFAULT_ICONS = [
  { id: "chat", name: "聊天", icon: "💬", action: "chat" },
  { id: "cards", name: "字卡管理", icon: "🎴", action: "cards" },
  { id: "settings", name: "设置", icon: "⚙️", action: "settings" }
];

function renderDesktop() {
  if (!state.desktopIcons) {
    state.desktopIcons = JSON.parse(JSON.stringify(DEFAULT_ICONS));
    saveDesktopIcons();
  }
  const pagesEl = document.getElementById("desktopPages");
  const dotsEl = document.getElementById("desktopDots");
  pagesEl.innerHTML = ""; dotsEl.innerHTML = "";
  const icons = state.desktopIcons;
  const perPage = 15;
  const pageCount = Math.max(1, Math.ceil(icons.length / perPage));
  for (let p = 0; p < pageCount; p++) {
    const page = document.createElement("div");
    page.className = "desktop-page";
    icons.slice(p * perPage, (p + 1) * perPage).forEach(ic => {
      const item = document.createElement("div");
      item.className = "desktop-item";
      item.innerHTML = `
        <div class="desktop-icon">${ic.icon && ic.icon.startsWith("data:") ? `<img src="${ic.icon}">` : esc(ic.icon || "📱")}</div>
        <div class="desktop-name">${esc(ic.name)}</div>`;
      item.addEventListener("click", () => {
        if (ic.action === "chat") openChat();
        else if (ic.action === "cards") openCards();
        else if (ic.action === "settings") openSettings();
      });
      page.appendChild(item);
    });
    pagesEl.appendChild(page);
    const dot = document.createElement("div");
    dot.className = "dot" + (p === 0 ? " active" : "");
    dotsEl.appendChild(dot);
  }
  pagesEl.addEventListener("scroll", () => {
    const idx = Math.round(pagesEl.scrollLeft / pagesEl.clientWidth);
    dotsEl.querySelectorAll(".dot").forEach((d, i) => d.classList.toggle("active", i === idx));
  }, { passive: true });
}

function tickDesktopTime() {
  const d = nowBeijing();
  const t = document.getElementById("desktopTime");
  const dt = document.getElementById("desktopDate");
  if (t) t.textContent = fmtTime(d);
  if (dt) dt.textContent = `${d.getMonth()+1}/${d.getDate()}`;
}

let currentQuote = null;

function openChat() {
  showScreen("chatApp");
  document.getElementById("chatTitle").textContent = state.settings.taName;
  applyChatBackground();
  renderMessages();
}

function applyChatBackground() {
  const body = document.getElementById("chatBody");
  if (!body) return;
  if (state.settings.bgImage) {
    body.style.backgroundImage = `url(${state.settings.bgImage})`;
    body.style.backgroundSize = "cover";
    body.style.backgroundPosition = "center";
    body.style.backgroundColor = "transparent";
  } else {
    body.style.backgroundImage = "";
    body.style.backgroundColor = state.settings.bgColor;
  }
}

function renderMessages() {
  const body = document.getElementById("chatBody");
  body.innerHTML = "";
  if (state.messages.length === 0) {
    const sys = document.createElement("div");
    sys.className = "system";
    sys.innerHTML = `<span>发消息即可随机抽字卡</span>`;
    body.appendChild(sys);
  }
  state.messages.forEach(m => renderMessage(body, m));
  body.scrollTop = body.scrollHeight;
}

function renderMessage(body, m) {
  const wrapper = document.createElement("div");
  wrapper.id = "msg-" + m.id;

  if (m.type === "system") {
    wrapper.className = "system";
    wrapper.innerHTML = `<span>${esc(m.text)}</span>`;
    body.appendChild(wrapper); return;
  }
  if (m.type === "poke") {
    wrapper.className = "poke-tip";
    wrapper.innerHTML = `<span>${esc(m.text)}</span>`;
    body.appendChild(wrapper); return;
  }

  const row = document.createElement("div");
  row.className = "msg-row " + (m.from === "me" ? "me" : "bot");
  const avatar = document.createElement("div");
  avatar.className = "avatar " + (m.from === "me" ? "user" : "");
  const av = m.from === "me" ? state.settings.myAvatar : state.settings.taAvatar;
  if (av) avatar.innerHTML = `<img src="${av}">`;
  else avatar.textContent = m.from === "me" ? "我" : "TA";
  const bubble = document.createElement("div");
  bubble.className = "bubble";

  if (m.recalled) {
    bubble.classList.add("recalled");
    bubble.textContent = "撤回了一条消息（点击查看）";
    bubble.addEventListener("click", () => alert("撤回的内容是：\n\n" + (m.text || "[非文字]")));
    row.appendChild(avatar); row.appendChild(bubble); body.appendChild(row);
    wrapper.appendChild(row);
    body.appendChild(wrapper);
    return;
  }

  let inner = "";
  if (m.quote) {
    inner += `<div class="quote" data-quote="${m.quote.id}">${esc(m.quote.text)}</div>`;
  }
  if (m.image) {
    inner += `<img class="msg-img" src="${m.image}">`;
  } else if (m.baiduImg) {
    inner += `<div style="padding:8px;background:#f0f0f0;border-radius:6px;cursor:pointer;" class="baidu-img">🔗 点击查看百度图片：${esc(m.baiduImg)}</div>`;
    bubble.addEventListener("click", (e) => {
      if (e.target.classList.contains("baidu-img") || e.target.closest(".baidu-img")) {
        window.open(`https://image.baidu.com/search?word=${encodeURIComponent(m.baiduImg)}`, "_blank");
      }
    });
  } else if (m.isVoice) {
    bubble.classList.add("voice");
    inner += `<span class="wave">🔊</span><span class="dur">${m.voiceDur}"</span>`;
    bubble.addEventListener("click", (e) => {
      if (e.target.classList.contains("word-chip")) return;
      alert("语音内容：\n\n" + m.text);
    });
  } else if (m.words && m.words.length) {
    m.words.forEach((w, i) => {
      if (m.hiddenWords && m.hiddenWords.includes(i)) return;
      inner += `<span class="word-chip" data-wi="${i}">${esc(w)}</span>`;
    });
  } else {
    inner += `<div>${esc(m.text)}</div>`;
  }
  bubble.innerHTML = inner;

  if (m.time) {
    const t = document.createElement("div");
    t.className = "msg-time"; t.textContent = m.time;
    bubble.appendChild(t);
  }
  if (m.mood || m.intent) {
    const tag = document.createElement("div");
    tag.className = "msg-tag";
    let tagHtml = "";
    if (m.mood) tagHtml += `<span data-tag="mood">心情：${esc(m.mood)}</span>`;
    if (m.intent) tagHtml += `${m.mood ? "<br>" : ""}<span data-tag="intent">意图：${esc(m.intent)}</span>`;
    tag.innerHTML = tagHtml;
    bubble.appendChild(tag);
  }

  // 引用点击跳转
  bubble.querySelectorAll(".quote").forEach(q => {
    q.addEventListener("click", (e) => {
      e.stopPropagation();
      const targetId = q.dataset.quote;
      const target = document.getElementById("msg-" + targetId);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        target.style.transition = "background 0.3s";
        const rowEl = target.querySelector(".msg-row") || target;
        rowEl.style.background = "rgba(255,235,59,0.4)";
        setTimeout(() => { rowEl.style.background = ""; }, 1200);
      }
    });
  });

  // 词点击（撤回单个词）
  bubble.querySelectorAll(".word-chip").forEach(chip => {
    chip.addEventListener("contextmenu", (e) => {
      e.preventDefault();
      if (m.from !== "me") { toast("只能撤回自己的消息"); return; }
      const wi = Number(chip.dataset.wi);
      if (!m.hiddenWords) m.hiddenWords = [];
      if (!m.hiddenWords.includes(wi)) m.hiddenWords.push(wi);
      saveMessages(); renderMessages();
      toast("已撤回该词");
    });
    chip.addEventListener("click", (e) => {
      if (m.from !== "me") return;
      if (confirm("撤回这个词？")) {
        const wi = Number(chip.dataset.wi);
        if (!m.hiddenWords) m.hiddenWords = [];
        if (!m.hiddenWords.includes(wi)) m.hiddenWords.push(wi);
        saveMessages(); renderMessages();
        toast("已撤回该词");
      }
    });
  });

  // 长按菜单
  bubble.addEventListener("contextmenu", e => {
    if (e.target.classList.contains("word-chip") || e.target.closest(".quote")) return;
    e.preventDefault(); openMsgMenu(m);
  });
  let pressTimer;
  bubble.addEventListener("touchstart", () => {
    pressTimer = setTimeout(() => openMsgMenu(m), 600);
  }, { passive: true });
  bubble.addEventListener("touchend", () => clearTimeout(pressTimer));
  bubble.addEventListener("touchmove", () => clearTimeout(pressTimer));

  row.appendChild(avatar); row.appendChild(bubble);
  wrapper.appendChild(row);
  body.appendChild(wrapper);
}

function openMsgMenu(m) {
  openModal("消息操作", () => {
    const wrap = document.createElement("div");
    const items = [];
    if (!m.recalled) {
      if (m.from === "me") {
        items.push({ label: "撤回整条", fn: () => { m.recalled = true; saveMessages(); renderMessages(); toast("已撤回"); } });
        if (m.mood) items.push({ label: "撤回心情", fn: () => { m.mood = null; saveMessages(); renderMessages(); toast("已撤回心情"); } });
        if (m.intent) items.push({ label: "撤回意图", fn: () => { m.intent = null; saveMessages(); renderMessages(); toast("已撤回意图"); } });
        if (m.mood && m.intent) items.push({ label: "撤回心情+意图", fn: () => { m.mood = null; m.intent = null; saveMessages(); renderMessages(); toast("已撤回"); } });
      } else {
        items.push({ label: "收藏", fn: () => {
          state.favoritesMine.push({ id: uid(), text: m.text, from: m.from, ts: Date.now(), time: fmtFull(nowBeijing()) });
          saveFavMine(); toast("已收藏");
        }});
      }
      items.push({ label: "引用", fn: () => { currentQuote = m; updateQuoteBar(); renderMessages(); toast("已引用"); } });
    }
    items.forEach(it => {
      const div = document.createElement("div");
      div.className = "menu-item"; div.textContent = it.label;
      div.addEventListener("click", () => { it.fn(); modal.classList.remove("open"); });
      wrap.appendChild(div);
    });
    return wrap;
  });
}

function updateQuoteBar() {
  let bar = document.getElementById("quoteBar");
  if (!currentQuote) { if (bar) bar.remove(); return; }
  if (!bar) {
    bar = document.createElement("div");
    bar.id = "quoteBar";
    bar.style.cssText = "padding:6px 12px;background:#f0f0f0;font-size:13px;color:#666;border-top:0.5px solid #ddd;display:flex;justify-content:space-between;align-items:center;";
    const inputbar = document.querySelector(".chat-inputbar");
    if (inputbar) inputbar.parentNode.insertBefore(bar, inputbar);
  }
  bar.innerHTML = `<span>引用：${esc(currentQuote.text).slice(0,30)}</span><button style="background:none;border:none;color:#888;cursor:pointer;">✕</button>`;
  bar.querySelector("button").addEventListener("click", () => { currentQuote = null; updateQuoteBar(); });
}

function getAllCards() {
  const list = [];
  state.cards.categories.forEach(cat => {
    if (cat.enabled === false) return;
    cat.cards.forEach(c => list.push(c.text));
  });
  return list;
}
function drawCard() { const l = getAllCards(); return l.length ? pick(l) : null; }
function drawMood() {
  const l = (state.cards.categories.find(c => c.name === "心情") || {}).cards || [];
  return l.length ? pick(l).text : null;
}
function drawIntent() {
  const l = (state.cards.categories.find(c => c.name === "意图") || {}).cards || [];
  return l.length ? pick(l).text : null;
}

function sendMessage(text, opts = {}) {
  if (!text && !opts.image && !opts.isVoice) return;
  const d = nowBeijing();
  const words = text ? text.split(/\s+/).filter(Boolean) : null;
  const msg = {
    id: uid(), from: "me",
    text: text || (opts.image ? "[图片]" : ""),
    words: words && words.length > 1 ? words : null,
    time: fmtTime(d), ts: d.getTime(),
    isCard: false, image: opts.image || null,
    isVoice: opts.isVoice || false,
    voiceDur: opts.voiceDur || 0,
    quote: currentQuote ? { id: currentQuote.id, text: currentQuote.text, from: currentQuote.from } : null
  };
  state.messages.push(msg);
  saveMessages();
  currentQuote = null; updateQuoteBar();
  renderMessages();
  setTimeout(taReply, rand(state.settings.replyDelayMin * 1000, state.settings.replyDelayMax * 1000));
}

function taReply() {
  const body = document.getElementById("chatBody");
  if (Math.random() * 100 < state.settings.readNoReplyProb) return;
  const typing = document.createElement("div");
  typing.className = "typing"; typing.textContent = "对方正在输入…";
  body.appendChild(typing);
  body.scrollTop = body.scrollHeight;
  setTimeout(() => {
    typing.remove();
    const card = drawCard();
    if (!card) { addBotMessage("（字卡库是空的，去字卡管理加几张吧）"); return; }

    // 按概率选择类型
    const r = Math.random() * 100;
    const voiceP = state.settings.voiceProb || 0;
    const imgP = state.settings.imgProb || 0;
    const moodP = state.settings.moodProb || 0;
    const intentP = state.settings.intentProb || 0;

    const opts = {
      isCard: true,
      mood: Math.random() * 100 < moodP ? drawMood() : null,
      intent: Math.random() * 100 < intentP ? drawIntent() : null
    };

    if (r < imgP) {
      // 百度图片
      const kw = card;
      const kwFixed = kw.split(/\s+/)[0].slice(0, 10);
      addBotMessage("", { ...opts, baiduImg: kwFixed });
    } else if (r < imgP + voiceP) {
      const dur = rand(1, 15);
      addBotMessage(card, { ...opts, isVoice: true, voiceDur: dur });
    } else {
      const words = card.split(/\s+/).filter(Boolean);
      addBotMessage(card, { ...opts, words: words.length > 1 ? words : null });
    }
  }, rand(800, 1800));
}

function addBotMessage(text, opts = {}) {
  const d = nowBeijing();
  const msg = {
    id: uid(), from: "ta", text,
    time: fmtTime(d), ts: d.getTime(),
    isCard: !!opts.isCard,
    mood: opts.mood || null, intent: opts.intent || null,
    isVoice: opts.isVoice || false, voiceDur: opts.voiceDur || 0,
    baiduImg: opts.baiduImg || null,
    words: opts.words || null
  };
  state.messages.push(msg);
  saveMessages(); renderMessages();
}

function initInputBar() {
  const input = document.getElementById("chatInput");
  const send = document.getElementById("sendBtn");
  input.addEventListener("input", () => { send.disabled = !input.value.trim(); });
  input.addEventListener("keydown", e => {
    if (e.key === "Enter") {
      const v = input.value.trim();
      if (v) { input.value = ""; send.disabled = true; sendMessage(v); }
    }
  });
  send.addEventListener("click", () => {
    const v = input.value.trim();
    if (!v) return;
    input.value = ""; send.disabled = true; sendMessage(v);
  });
  document.getElementById("imgBtn").addEventListener("click", () => document.getElementById("imgFile").click());
  document.getElementById("imgFile").addEventListener("change", async () => {
    const f = document.getElementById("imgFile").files[0];
    if (!f) return;
    const data = await compressImage(f, 1000, 0.8);
    sendMessage("", { image: data });
    document.getElementById("imgFile").value = "";
  });
  document.getElementById("emojiBtn").addEventListener("click", () => {
    openModal("表情包", () => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="row">
          <input class="input" id="emojiInput" placeholder="输入 emoji 或文字">
          <button class="btn" id="emojiAddBtn">添加</button>
        </div>
        <div class="row">
          <input type="file" id="emojiFile" accept="image/*" hidden>
          <button class="btn secondary" id="emojiImgBtn" style="width:100%">上传图片</button>
        </div>
        <div id="emojiList"></div>`;
      const list = wrap.querySelector("#emojiList");
      function render() {
        list.innerHTML = "";
        if (!state.emojis.length) { list.innerHTML = `<div class="empty">还没有表情</div>`; return; }
        state.emojis.forEach((e, i) => {
          const item = document.createElement("div");
          item.className = "list-item";
          const isImg = e.startsWith("data:");
          item.innerHTML = `<div class="name" style="font-size:${isImg ? "0" : "22px"};">${isImg ? `<img src="${e}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">` : esc(e)}</div>
            <div class="actions"><button data-send>发送</button><button class="danger" data-del>删除</button></div>`;
          item.querySelector("[data-send]").addEventListener("click", () => {
            if (isImg) sendMessage("", { image: e });
            else sendMessage(e);
            modal.classList.remove("open");
          });
          item.querySelector("[data-del]").addEventListener("click", () => {
            state.emojis.splice(i, 1); saveEmojis(); render();
          });
          list.appendChild(item);
        });
      }
      render();
      wrap.querySelector("#emojiAddBtn").addEventListener("click", () => {
        const v = wrap.querySelector("#emojiInput").value.trim();
        if (!v) return;
        state.emojis.push(v); saveEmojis(); wrap.querySelector("#emojiInput").value = ""; render();
      });
      wrap.querySelector("#emojiImgBtn").addEventListener("click", () => wrap.querySelector("#emojiFile").click());
      wrap.querySelector("#emojiFile").addEventListener("change", async () => {
        const f = wrap.querySelector("#emojiFile").files[0];
        if (!f) return;
        const data = await compressImage(f, 300, 0.8);
        state.emojis.push(data); saveEmojis(); render();
      });
      return wrap;
    });
  });
  document.getElementById("voiceBtn").addEventListener("click", () => {
    openModal("发送语音", () => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="row"><input class="input" id="voiceText" placeholder="语音内容"></div>
        <div class="row"><input class="input" id="voiceDurInput" type="number" value="5"></div>
        <button class="btn" id="voiceSendBtn" style="width:100%">发送</button>`;
      wrap.querySelector("#voiceSendBtn").addEventListener("click", () => {
        const t = wrap.querySelector("#voiceText").value.trim();
        const d = Number(wrap.querySelector("#voiceDurInput").value) || 5;
        if (!t) return;
        sendMessage(t, { isVoice: true, voiceDur: d });
        modal.classList.remove("open");
      });
      return wrap;
    });
  });
}

document.getElementById("chatMenuBtn").addEventListener("click", () => {
  document.getElementById("chatMenuModal").classList.add("open");
});
document.getElementById("chatMenuClose").addEventListener("click", () => {
  document.getElementById("chatMenuModal").classList.remove("open");
});
document.querySelectorAll("#chatMenuModal .menu-item").forEach(item => {
  item.addEventListener("click", () => {
    const action = item.dataset.action;
    document.getElementById("chatMenuModal").classList.remove("open");
    if (action === "search") doSearch();
    if (action === "fav") showFavorites();
    if (action === "poke") doPoke();
    if (action === "call") doCall();
  });
});

function doSearch() {
  openModal("搜索聊天记录", () => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="row"><input class="input" id="searchKw" placeholder="关键词（可空）"></div>
      <div class="row"><input class="input" type="date" id="searchDate"></div>
      <button class="btn" id="searchBtn" style="width:100%">搜索</button>
      <div id="searchResults" style="margin-top:12px;"></div>`;
    const results = wrap.querySelector("#searchResults");
    wrap.querySelector("#searchBtn").addEventListener("click", () => {
      const kw = wrap.querySelector("#searchKw").value.trim();
      const dateStr = wrap.querySelector("#searchDate").value;
      let hits = state.messages.filter(m => m.text && !m.recalled);
      if (kw) hits = hits.filter(m => m.text.includes(kw));
      if (dateStr) {
        hits = hits.filter(m => {
          const d = new Date(m.ts);
          return fmtDate(d) === dateStr;
        });
      }
      results.innerHTML = "";
      if (!hits.length) { results.innerHTML = `<div class="empty">没找到</div>`; return; }
      hits.forEach(m => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.style.cursor = "pointer";
        item.innerHTML = `<div class="name">${m.from === "me" ? "我" : esc(state.settings.taName)}：${esc(m.text)}<br><span style="font-size:12px;color:#999;">${m.time || ""}</span></div>`;
        item.addEventListener("click", () => {
          modal.classList.remove("open");
          setTimeout(() => {
            const target = document.getElementById("msg-" + m.id);
            if (target) {
              target.scrollIntoView({ behavior: "smooth", block: "center" });
              const rowEl = target.querySelector(".msg-row") || target;
              rowEl.style.transition = "background 0.3s";
              rowEl.style.background = "rgba(255,235,59,0.4)";
              setTimeout(() => { rowEl.style.background = ""; }, 1200);
            }
          }, 200);
        });
        results.appendChild(item);
      });
    });
    return wrap;
  });
}

function showFavorites() {
  openModal("收藏", () => {
    const wrap = document.createElement("div");
    let currentTab = "mine";
    wrap.innerHTML = `
      <div class="fav-tabs">
        <div class="fav-tab active" data-tab="mine">我的收藏</div>
        <div class="fav-tab" data-tab="ta">TA的收藏</div>
      </div>
      <div id="favList"></div>`;
    const list = wrap.querySelector("#favList");
    function render() {
      const arr = currentTab === "mine" ? state.favoritesMine : state.favoritesTa;
      list.innerHTML = "";
      if (!arr.length) { list.innerHTML = `<div class="empty">还没有收藏</div>`; return; }
      arr.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "fav-item";
        item.innerHTML = `<div class="fav-text">${esc(f.text)}</div>
          <div class="fav-time">${f.from === "me" ? "我" : "TA"} · ${f.time}</div>
          <div class="actions" style="margin-top:6px;"><button class="danger" data-del>删除</button></div>`;
        item.querySelector("[data-del]").addEventListener("click", () => {
          if (currentTab === "mine") { state.favoritesMine.splice(i, 1); saveFavMine(); }
          else { state.favoritesTa.splice(i, 1); saveFavTa(); }
          render();
        });
        list.appendChild(item);
      });
    }
    render();
    wrap.querySelectorAll(".fav-tab").forEach(tab => {
      tab.addEventListener("click", () => {
        currentTab = tab.dataset.tab;
        wrap.querySelectorAll(".fav-tab").forEach(t => t.classList.toggle("active", t === tab));
        render();
      });
    });
    return wrap;
  });
}

function doPoke() {
  const d = nowBeijing();
  const pokeText = pick(state.pokeTexts) || "拍了拍";
  state.messages.push({ id: uid(), type: "poke", text: `我${pokeText}`, ts: d.getTime() });
  saveMessages(); renderMessages();
  if (Math.random() * 100 < state.settings.pokeBackProb) {
    setTimeout(() => {
      const backText = pick(state.pokeTexts) || "拍了拍";
      state.messages.push({ id: uid(), type: "poke", text: `${state.settings.taName}${backText}`, ts: Date.now() });
      saveMessages(); renderMessages();
      if (Math.random() * 100 < state.settings.pokeCardProb) {
        setTimeout(() => {
          const card = drawCard();
          if (card) addBotMessage(card, { isCard: true, mood: drawMood(), intent: drawIntent() });
        }, 800);
      }
    }, 1500);
  }
}

let callTimerId = null, callStartTs = 0;
function doCall() {
  // 先判定拒绝
  if (Math.random() * 100 < state.settings.callRejectProb) {
    const d = nowBeijing();
    state.messages.push({ id: uid(), type: "system", text: `对方已拒绝通话`, ts: d.getTime() });
    saveMessages(); renderMessages();
    toast("对方已拒绝");
    return;
  }
  document.getElementById("callName").textContent = state.settings.taName;
  const av = document.getElementById("callAvatar");
  if (state.settings.taAvatar) av.innerHTML = `<img src="${state.settings.taAvatar}">`;
  else av.textContent = "TA";
  document.getElementById("callTimer").textContent = "00:00:00";
  showScreen("callScreen");
  callStartTs = Date.now();
  callTimerId = setInterval(updateCallTimer, 1000);
}
function updateCallTimer() {
  const el = document.getElementById("callTimer");
  if (!el) return;
  const s = Math.floor((Date.now() - callStartTs) / 1000);
  el.textContent = `${String(Math.floor(s/3600)).padStart(2,"0")}:${String(Math.floor((s%3600)/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
}
document.getElementById("hangupBtn").addEventListener("click", () => {
  clearInterval(callTimerId);
  const s = Math.floor((Date.now() - callStartTs) / 1000);
  state.messages.push({ id: uid(), type: "system", text: `通话结束 · 时长 ${Math.floor(s/60)}分${s%60}秒`, ts: Date.now() });
  saveMessages(); showScreen("chatApp"); renderMessages();
});

let batchMode = false;
let selectedCards = new Set();

function openCards() {
  showScreen("cardsApp");
  batchMode = false; selectedCards.clear();
  document.getElementById("batchBar").style.display = "none";
  renderCardsPage();
}

document.getElementById("batchToggleBtn").addEventListener("click", () => {
  batchMode = !batchMode;
  selectedCards.clear();
  document.getElementById("batchBar").style.display = batchMode ? "flex" : "none";
  updateBatchCount(); renderCardsPage();
});

function updateBatchCount() { document.getElementById("batchCount").textContent = selectedCards.size; }

function renderCardsPage() {
  const body = document.getElementById("cardsBody");
  body.innerHTML = "";
  if (state.cards.categories.length === 0) {
    body.innerHTML = `<div class="empty">还没有分类，点右上角“+ 分类”新建</div>`;
    return;
  }
  state.cards.categories.forEach(cat => {
    const div = document.createElement("div");
    div.className = "list-item";
    div.innerHTML = `
      <div class="name">${esc(cat.name)}<span style="color:#999;font-size:13px;">（${cat.cards.length} 张）</span></div>
      <div class="actions">
        <button data-toggle>${cat.enabled === false ? "启用" : "停用"}</button>
        <button data-open>打开</button>
        <button class="danger" data-del>删除</button>
      </div>`;
    div.querySelector("[data-toggle]").addEventListener("click", () => {
      cat.enabled = cat.enabled === false ? true : false;
      saveCards(); renderCardsPage();
    });
    div.querySelector("[data-open]").addEventListener("click", () => openCategory(cat.id));
    div.querySelector("[data-del]").addEventListener("click", () => {
      if (confirm(`删除分类「${cat.name}」？`)) {
        state.cards.categories = state.cards.categories.filter(c => c.id !== cat.id);
        saveCards(); renderCardsPage();
      }
    });
    body.appendChild(div);
    if (batchMode) {
      cat.cards.forEach(c => {
        const item = document.createElement("div");
        item.className = "list-item"; item.style.paddingLeft = "30px";
        const checked = selectedCards.has(c.id) ? "checked" : "";
        item.innerHTML = `<div class="name" style="display:flex;align-items:center;">
            <input type="checkbox" class="card-check" ${checked} data-id="${c.id}">
            ${esc(c.text)}
          </div>`;
        item.querySelector("input").addEventListener("change", e => {
          if (e.target.checked) selectedCards.add(c.id); else selectedCards.delete(c.id);
          updateBatchCount();
        });
        body.appendChild(item);
      });
    }
  });
}

document.getElementById("selectAllBtn").addEventListener("click", () => {
  const all = [];
  state.cards.categories.forEach(cat => cat.cards.forEach(c => all.push(c.id)));
  if (selectedCards.size === all.length) selectedCards.clear();
  else all.forEach(id => selectedCards.add(id));
  updateBatchCount(); renderCardsPage();
});
document.getElementById("batchCancelBtn").addEventListener("click", () => {
  batchMode = false; selectedCards.clear();
  document.getElementById("batchBar").style.display = "none";
  renderCardsPage();
});
document.getElementById("batchDelBtn").addEventListener("click", () => {
  if (!selectedCards.size) return alert("还没选");
  if (!confirm(`删除选中的 ${selectedCards.size} 张？`)) return;
  state.cards.categories.forEach(cat => { cat.cards = cat.cards.filter(c => !selectedCards.has(c.id)); });
  selectedCards.clear(); saveCards(); updateBatchCount(); renderCardsPage();
});
document.getElementById("batchMoveBtn").addEventListener("click", () => {
  if (!selectedCards.size) return alert("还没选");
  const names = state.cards.categories.map(c => c.name).join(" / ");
  const target = prompt(`移动到哪个分类？\n可选：${names}`);
  if (!target) return;
  const cat = state.cards.categories.find(c => c.name === target);
  if (!cat) return alert("没找到这个分类");
  const moved = [];
  state.cards.categories.forEach(c => {
    c.cards = c.cards.filter(card => {
      if (selectedCards.has(card.id)) { moved.push(card); return false; }
      return true;
    });
  });
  moved.forEach(card => cat.cards.push(card));
  selectedCards.clear(); saveCards(); updateBatchCount(); renderCardsPage();
});
document.getElementById("batchExportBtn").addEventListener("click", () => {
  if (!selectedCards.size) return alert("还没选");
  const out = [];
  state.cards.categories.forEach(cat => cat.cards.forEach(c => { if (selectedCards.has(c.id)) out.push(c.text); }));
  const blob = new Blob([out.join("\n")], { type: "text/plain;charset=utf-8" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "字卡导出.txt"; a.click();
});

function openCategory(catId) {
  const cat = state.cards.categories.find(c => c.id === catId);
  if (!cat) return;
  openModal(`分类：${cat.name}`, () => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `
      <div class="row">
        <input class="input" id="newCardInput" placeholder="输入字卡内容，回车添加">
        <button class="btn" id="addCardBtn">添加</button>
      </div>
      <div class="row"><button class="btn secondary" id="batchBtn" style="width:100%">批量添加（一行一张）</button></div>
      <div id="cardList"></div>`;
    const list = wrap.querySelector("#cardList");
    function renderList() {
      list.innerHTML = "";
      if (!cat.cards.length) { list.innerHTML = `<div class="empty">还没有字卡</div>`; return; }
      cat.cards.forEach((c, i) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `<div class="name">${esc(c.text)}</div><div class="actions"><button class="danger" data-del>删除</button></div>`;
        item.querySelector("[data-del]").addEventListener("click", () => {
          cat.cards.splice(i, 1); saveCards(); renderList();
        });
        list.appendChild(item);
      });
    }
    renderList();
    const inp = wrap.querySelector("#newCardInput");
    function addOne() {
      const v = inp.value.trim(); if (!v) return;
      cat.cards.push({ id: uid(), text: v });
      saveCards(); inp.value = ""; renderList(); inp.focus();
    }
    wrap.querySelector("#addCardBtn").addEventListener("click", addOne);
    inp.addEventListener("keydown", e => { if (e.key === "Enter") addOne(); });
    wrap.querySelector("#batchBtn").addEventListener("click", () => {
      const text = prompt("批量添加：每行一张");
      if (!text) return;
      text.split("\n").map(s => s.trim()).filter(Boolean).forEach(t => {
        cat.cards.push({ id: uid(), text: t });
      });
      saveCards(); renderList();
    });
    return wrap;
  });
}

document.getElementById("newCatBtn").addEventListener("click", () => {
  const name = prompt("分类名称");
  if (!name) return;
  state.cards.categories.push({ id: uid(), name: name.trim(), enabled: true, cards: [] });
  saveCards(); renderCardsPage();
});

const modal = document.getElementById("modal");
function openModal(title, contentFn) {
  document.getElementById("modalTitle").textContent = title;
  const body = document.getElementById("modalBody");
  body.innerHTML = "";
  const content = contentFn();
  if (typeof content === "string") body.innerHTML = content;
  else if (content instanceof Node) body.appendChild(content);
  modal.classList.add("open");
}
document.getElementById("modalClose").addEventListener("click", () => modal.classList.remove("open"));
modal.addEventListener("click", e => { if (e.target === modal) modal.classList.remove("open"); });

function openSettings() {
  showScreen("settingsApp");
  renderSettingsPage();
}
function renderSettingsPage() {
  const body = document.getElementById("settingsBody");
  body.innerHTML = `
    <div class="list-item"><div class="name">我的昵称</div><div class="actions"><button data-edit="myName">${esc(state.settings.myName)}</button></div></div>
    <div class="list-item"><div class="name">对方昵称</div><div class="actions"><button data-edit="taName">${esc(state.settings.taName)}</button></div></div>
    <div class="list-item"><div class="name">聊天背景色</div><div class="actions"><input type="color" value="${state.settings.bgColor}" data-color="bgColor"></div></div>
    <div class="list-item"><div class="name">聊天背景图</div><div class="actions">
      <button data-bgimg>上传</button>
      ${state.settings.bgImage ? `<button class="danger" data-bgclear>清除</button>` : ""}
    </div></div>
    <div class="list-item"><div class="name">我的气泡颜色</div><div class="actions"><input type="color" value="${state.settings.myBubbleColor}" data-color="myBubbleColor"></div></div>
    <div class="list-item"><div class="name">对方气泡颜色</div><div class="actions"><input type="color" value="${state.settings.taBubbleColor}" data-color="taBubbleColor"></div></div>
    <div class="list-item"><div class="name">字体大小（${state.settings.fontSize}px）</div><div class="actions"><input type="range" min="12" max="22" value="${state.settings.fontSize}" data-range="fontSize"></div></div>
    <div class="list-item"><div class="name">已读不回（${state.settings.readNoReplyProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.readNoReplyProb}" data-range="readNoReplyProb"></div></div>
    <div class="list-item"><div class="name">语音概率（${state.settings.voiceProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.voiceProb}" data-range="voiceProb"></div></div>
    <div class="list-item"><div class="name">图片概率（${state.settings.imgProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.imgProb}" data-range="imgProb"></div></div>
    <div class="list-item"><div class="name">拍一拍回拍（${state.settings.pokeBackProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.pokeBackProb}" data-range="pokeBackProb"></div></div>
    <div class="list-item"><div class="name">拍一拍触发字卡（${state.settings.pokeCardProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.pokeCardProb}" data-range="pokeCardProb"></div></div>
    <div class="list-item"><div class="name">通话拒绝概率（${state.settings.callRejectProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.callRejectProb}" data-range="callRejectProb"></div></div>
    <div class="list-item"><div class="name">心情触发（${state.settings.moodProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.moodProb}" data-range="moodProb"></div></div>
    <div class="list-item"><div class="name">意图触发（${state.settings.intentProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${state.settings.intentProb}" data-range="intentProb"></div></div>
    <div class="list-item"><div class="name">拍一拍文案库</div><div class="actions"><button data-pokemgr>管理（${state.pokeTexts.length}）</button></div></div>`;
  body.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.edit;
      const v = prompt("修改为：", state.settings[k]);
      if (v === null) return;
      state.settings[k] = v.trim() || state.settings[k];
      saveSettings(); renderSettingsPage();
      if (k === "taName") document.getElementById("chatTitle").textContent = state.settings.taName;
    });
  });
  body.querySelectorAll("[data-color]").forEach(inp => {
    inp.addEventListener("input", () => {
      state.settings[inp.dataset.color] = inp.value;
      saveSettings(); applyAppearance();
    });
  });
  body.querySelectorAll("[data-range]").forEach(inp => {
    inp.addEventListener("input", () => {
      state.settings[inp.dataset.range] = Number(inp.value);
      saveSettings(); renderSettingsPage(); applyAppearance();
    });
  });
  const bgBtn = body.querySelector("[data-bgimg]");
  if (bgBtn) bgBtn.addEventListener("click", () => {
    const f = document.createElement("input");
    f.type = "file"; f.accept = "image/*";
    f.onchange = async () => {
      if (!f.files[0]) return;
      const data = await compressImage(f.files[0], 1200, 0.8);
      state.settings.bgImage = data;
      saveSettings(); renderSettingsPage(); applyChatBackground();
    };
    f.click();
  });
  const bgClear = body.querySelector("[data-bgclear]");
  if (bgClear) bgClear.addEventListener("click", () => {
    state.settings.bgImage = "";
    saveSettings(); renderSettingsPage(); applyChatBackground();
  });
  const pokeMgr = body.querySelector("[data-pokemgr]");
  if (pokeMgr) pokeMgr.addEventListener("click", () => {
    openModal("拍一拍文案库", () => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `
        <div class="row">
          <input class="input" id="pokeInput" placeholder="输入拍一拍文案">
          <button class="btn" id="pokeAddBtn">添加</button>
        </div>
        <div id="pokeList"></div>`;
      const list = wrap.querySelector("#pokeList");
      function render() {
        list.innerHTML = "";
        if (!state.pokeTexts.length) { list.innerHTML = `<div class="empty">还没有文案</div>`; return; }
        state.pokeTexts.forEach((t, i) => {
          const item = document.createElement("div");
          item.className = "list-item";
          item.innerHTML = `<div class="name">${esc(t)}</div><div class="actions"><button class="danger" data-del>删除</button></div>`;
          item.querySelector("[data-del]").addEventListener("click", () => {
            state.pokeTexts.splice(i, 1); savePokeTexts(); render();
          });
          list.appendChild(item);
        });
      }
      render();
      wrap.querySelector("#pokeAddBtn").addEventListener("click", () => {
        const v = wrap.querySelector("#pokeInput").value.trim();
        if (!v) return;
        state.pokeTexts.push(v); savePokeTexts(); wrap.querySelector("#pokeInput").value = ""; render();
      });
      return wrap;
    });
  });
}
function applyAppearance() {
  document.documentElement.style.fontSize = state.settings.fontSize + "px";
  document.querySelectorAll(".msg-row.me .bubble").forEach(b => b.style.background = state.settings.myBubbleColor);
  document.querySelectorAll(".msg-row.bot .bubble").forEach(b => b.style.background = state.settings.taBubbleColor);
  applyChatBackground();
}

function init() {
  renderDesktop();
  tickDesktopTime();
  setInterval(tickDesktopTime, 1000 * 30);
  initInputBar();
  applyAppearance();
  if (state.cards.categories.length === 0) {
    state.cards.categories.push({
      id: uid(), name: "日常", enabled: true,
      cards: [
        { id: uid(), text: "在的" },
        { id: uid(), text: "怎么啦" },
        { id: uid(), text: "我在想你" },
        { id: uid(), text: "今天过得怎么样" },
        { id: uid(), text: "要好好吃饭哦" },
        { id: uid(), text: "早点休息" }
      ]
    });
    state.cards.categories.push({ id: uid(), name: "心情", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "意图", enabled: true, cards: [] });
    saveCards();
  }
}

init();