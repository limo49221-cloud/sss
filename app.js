/* =====================================================
   我的小站 · 完整版
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
    pokeBackProb: 50, pokeCardProb: 50,
    voiceProb: 15, imgProb: 15,
    callRejectProb: 50,
    moodProb: 30, intentProb: 30,
    taMomentsProb: 30,
    taCommentProb: 50,
    searchLinkProb: 10,
    letterReplyProb: 50,
    surveyProb: 5,
    choiceProb: 5,
    checkinProb: 5
  }),
  cards: store.get("cards", { categories: [] }),
  pokeTexts: store.get("pokeTexts", ["拍了拍我的头", "拍了拍我的肩膀", "拍了拍我的脸"]),
  messages: store.get("messages", []),
  favoritesMine: store.get("favoritesMine", []),
  favoritesTa: store.get("favoritesTa", []),
  emojis: store.get("emojis", []),
  moments: store.get("moments", []),
  water: store.get("water", { date: "", count: 0, goal: 8 }),
  desktopIcons: store.get("desktopIcons", null)
};

function saveSettings() { store.set("settings", state.settings); }
function saveCards() { store.set("cards", state.cards); }
function savePokeTexts() { store.set("pokeTexts", state.pokeTexts); }
function saveMessages() { store.set("messages", state.messages); }
function saveFavMine() { store.set("favoritesMine", state.favoritesMine); }
function saveFavTa() { store.set("favoritesTa", state.favoritesTa); }
function saveEmojis() { store.set("emojis", state.emojis); }
function saveMoments() { store.set("moments", state.moments); }
function saveWater() { store.set("water", state.water); }
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
  t.style.cssText = "position:fixed;bottom:80px;left:50%;transform:translateX(-50%);background:rgba(0,0,0,0.75);color:#fff;padding:8px 16px;border-radius:20px;font-size:14px;z-index:9999;pointer-events:none;";
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 1500);
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
  { id: "chat",      name: "聊天",     icon: "💬", action: "chat" },
  { id: "cards",     name: "字卡管理", icon: "🎴", action: "cards" },
  { id: "paper",     name: "论文",     icon: "📄", action: "paper" },
  { id: "tarot",     name: "塔罗",     icon: "🔮", action: "tarot" },
  { id: "moments",   name: "朋友圈",   icon: "🌿", action: "moments" },
  { id: "choice",    name: "抉择",     icon: "⚖️", action: "choice" },
  { id: "survey",    name: "问卷",     icon: "📋", action: "survey" },
  { id: "letters",   name: "信件",     icon: "✉️", action: "letters" },
  { id: "shopping",  name: "购物",     icon: "🛒", action: "shopping" },
  { id: "water",     name: "喝水",     icon: "💧", action: "water" },
  { id: "eat",       name: "吃什么",   icon: "🍽️", action: "eat" },
  { id: "checkin",   name: "查岗",     icon: "🔔", action: "checkin" },
  { id: "pomodoro",  name: "番茄钟",   icon: "🍅", action: "pomodoro" },
  { id: "music",     name: "音乐",     icon: "🎵", action: "music" },
  { id: "books",     name: "推书",     icon: "📚", action: "books" },
  { id: "search",    name: "搜索",     icon: "🔍", action: "search" },
  { id: "settings",  name: "设置",     icon: "⚙️", action: "settings" }
];

function renderDesktop() {
  if (!state.desktopIcons || !state.desktopIcons.length) {
    state.desktopIcons = JSON.parse(JSON.stringify(DEFAULT_ICONS));
    saveDesktopIcons();
  }
  // 确保设置图标存在
  if (!state.desktopIcons.some(i => i.action === "settings")) {
    state.desktopIcons.push({ id: "settings", name: "设置", icon: "⚙️", action: "settings" });
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
        const map = {
          chat: openChat, cards: openCards, paper: openPaper, tarot: openTarot,
          moments: openMoments, choice: openChoice, survey: openSurvey,
          letters: openLetters, shopping: openShopping, water: openWater,
          eat: openEat, checkin: openCheckin, pomodoro: openPomodoro,
          music: openMusic, books: openBooks, search: openSearch, settings: openSettings
        };
        const fn = map[ic.action];
        if (fn) fn();
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

const SEARCH_PLATFORMS = [
  { name: "小红书", icon: "📕", url: "https://www.xiaohongshu.com/search_result?keyword=" },
  { name: "B站",   icon: "📺", url: "https://search.bilibili.com/all?keyword=" },
  { name: "微博",   icon: "🔴", url: "https://s.weibo.com/weibo?q=" },
  { name: "知乎",   icon: "🔵", url: "https://www.zhihu.com/search?type=content&q=" },
  { name: "豆瓣",   icon: "🟢", url: "https://www.douban.com/search?q=" },
  { name: "淘宝",   icon: "🛒", url: "https://s.taobao.com/search?q=" },
  { name: "百度",   icon: "🔍", url: "https://www.baidu.com/s?wd=" },
  { name: "百度图片", icon: "🖼️", url: "https://image.baidu.com/search?word=" },
  { name: "抖音",   icon: "🎵", url: "https://www.douyin.com/search/" }
];

function getCardsByCat(catName) {
  const cat = state.cards.categories.find(c => c.name === catName && c.enabled !== false);
  if (!cat) return [];
  return cat.cards.map(c => c.text);
}
function drawFromCat(catName) {
  const list = getCardsByCat(catName);
  return list.length ? pick(list) : null;
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
    row.appendChild(avatar); row.appendChild(bubble);
    wrapper.appendChild(row); body.appendChild(wrapper); return;
  }
  let inner = "";
  if (m.quote) inner += `<div class="quote" data-quote="${m.quote.id}">${esc(m.quote.text)}</div>`;
  if (m.image) inner += `<img class="msg-img" src="${m.image}">`;
  else if (m.searchLink) {
    inner += `<div style="padding:8px;background:#f0f0f0;border-radius:6px;cursor:pointer;" class="search-link">🔍 点击搜索「${esc(m.searchLink.kw)}」· ${esc(m.searchLink.platform.name)}</div>`;
  } else if (m.baiduImg) {
    inner += `<div style="padding:8px;background:#f0f0f0;border-radius:6px;cursor:pointer;" class="baidu-img">🔗 点击查看百度图片：${esc(m.baiduImg)}</div>`;
  } else if (m.isVoice) {
    bubble.classList.add("voice");
    inner += `<span class="wave">🔊</span><span class="dur">${m.voiceDur}"</span>`;
  } else if (m.words && m.words.length) {
    m.words.forEach((w, i) => {
      if (m.hiddenWords && m.hiddenWords.includes(i)) return;
      inner += `<span class="word-chip" data-wi="${i}">${esc(w)}</span>`;
    });
  } else inner += `<div>${esc(m.text)}</div>`;
  bubble.innerHTML = inner;
  if (m.time) {
    const t = document.createElement("div");
    t.className = "msg-time"; t.textContent = m.time;
    bubble.appendChild(t);
  }
  if (m.mood || m.intent) {
    const tag = document.createElement("div");
    tag.className = "msg-tag";
    let html = "";
    if (m.mood) html += `心情：${esc(m.mood)}`;
    if (m.intent) html += `${m.mood ? "<br>" : ""}意图：${esc(m.intent)}`;
    tag.innerHTML = html;
    bubble.appendChild(tag);
  }
  if (m.searchLink) {
    bubble.addEventListener("click", (e) => {
      if (e.target.classList.contains("search-link") || e.target.closest(".search-link")) {
        const p = m.searchLink.platform;
        window.open(p.url + encodeURIComponent(m.searchLink.kw), "_blank");
      }
    });
  }
  if (m.baiduImg) {
    bubble.addEventListener("click", (e) => {
      if (e.target.classList.contains("baidu-img") || e.target.closest(".baidu-img")) {
        window.open(`https://image.baidu.com/search?word=${encodeURIComponent(m.baiduImg)}`, "_blank");
      }
    });
  }
  if (m.isVoice) {
    bubble.addEventListener("click", (e) => {
      if (e.target.classList.contains("word-chip")) return;
      alert("语音内容：\n\n" + m.text);
    });
  }
  bubble.querySelectorAll(".quote").forEach(q => {
    q.addEventListener("click", (e) => {
      e.stopPropagation();
      const target = document.getElementById("msg-" + q.dataset.quote);
      if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "center" });
        const rowEl = target.querySelector(".msg-row") || target;
        rowEl.style.transition = "background 0.3s";
        rowEl.style.background = "rgba(255,235,59,0.4)";
        setTimeout(() => { rowEl.style.background = ""; }, 1200);
      }
    });
  });
  bubble.querySelectorAll(".word-chip").forEach(chip => {
    chip.addEventListener("click", (e) => {
      if (m.from !== "me") return;
      if (confirm("撤回这个词？")) {
        const wi = Number(chip.dataset.wi);
        if (!m.hiddenWords) m.hiddenWords = [];
        if (!m.hiddenWords.includes(wi)) m.hiddenWords.push(wi);
        saveMessages(); renderMessages(); toast("已撤回该词");
      }
    });
  });
  bubble.addEventListener("contextmenu", e => {
    if (e.target.classList.contains("word-chip") || e.target.closest(".quote")) return;
    e.preventDefault(); openMsgMenu(m);
  });
  let pressTimer;
  bubble.addEventListener("touchstart", () => { pressTimer = setTimeout(() => openMsgMenu(m), 600); }, { passive: true });
  bubble.addEventListener("touchend", () => clearTimeout(pressTimer));
  bubble.addEventListener("touchmove", () => clearTimeout(pressTimer));
  row.appendChild(avatar); row.appendChild(bubble);
  wrapper.appendChild(row); body.appendChild(wrapper);
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
    if (["问卷","抉择","吃什么","查岗","音乐","心情","意图"].includes(cat.name)) return;
    cat.cards.forEach(c => list.push(c.text));
  });
  return list;
}
function drawCard() { const l = getAllCards(); return l.length ? pick(l) : null; }
function drawMood() { const l = getCardsByCat("心情"); return l.length ? pick(l) : null; }
function drawIntent() { const l = getCardsByCat("意图"); return l.length ? pick(l) : null; }

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
    const r = Math.random() * 100;
    const searchP = state.settings.searchLinkProb || 0;
    const voiceP = state.settings.voiceProb || 0;
    const imgP = state.settings.imgProb || 0;
    const moodP = state.settings.moodProb || 0;
    const intentP = state.settings.intentProb || 0;
    const surveyP = state.settings.surveyProb || 0;
    const choiceP = state.settings.choiceProb || 0;
    const checkinP = state.settings.checkinProb || 0;

    const card = drawCard();
    if (!card) { addBotMessage("（字卡库是空的，去字卡管理加几张吧）"); return; }

    const opts = {
      isCard: true,
      mood: Math.random() * 100 < moodP ? drawMood() : null,
      intent: Math.random() * 100 < intentP ? drawIntent() : null
    };

    if (r < checkinP) {
      const c = drawFromCat("查岗");
      if (c) { addBotMessage(`【查岗】${c}`, opts); return; }
    } else if (r < checkinP + surveyP) {
      const q = drawFromCat("问卷");
      if (q) { addBotMessage(`【TA 问你】${q}`, opts); return; }
    } else if (r < checkinP + surveyP + choiceP) {
      const a = drawFromCat("抉择");
      const b = drawFromCat("抉择");
      if (a && b && a !== b) { addBotMessage(`【让 TA 选】${a} / ${b}`, opts); return; }
    }

    if (r < searchP) {
      const kwFixed = card.split(/\s+/)[0].slice(0, 10);
      const platform = SEARCH_PLATFORMS[Math.floor(Math.random() * SEARCH_PLATFORMS.length)];
      addBotMessage("", { ...opts, searchLink: { kw: kwFixed, platform } });
    } else if (r < searchP + imgP) {
      const kwFixed = card.split(/\s+/)[0].slice(0, 10);
      addBotMessage("", { ...opts, baiduImg: kwFixed });
    } else if (r < searchP + imgP + voiceP) {
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
    searchLink: opts.searchLink || null,
    words: opts.words || null
  };
  state.messages.push(msg);
  saveMessages(); renderMessages();
  showNotification(msg);
}

function showNotification(msg) {
  const chatScreen = document.getElementById("chatApp");
  if (chatScreen && chatScreen.classList.contains("active")) return;
  const n = document.createElement("div");
  n.style.cssText = "position:fixed;top:calc(8px + env(safe-area-inset-top));left:50%;transform:translateX(-50%) translateY(-120%);background:rgba(255,255,255,0.97);border-radius:12px;box-shadow:0 4px 16px rgba(0,0,0,0.15);padding:10px 14px;display:flex;align-items:center;gap:10px;max-width:90%;min-width:240px;z-index:9999;transition:transform 0.3s ease;cursor:pointer;";
  const av = state.settings.taAvatar
    ? `<img src="${state.settings.taAvatar}" style="width:36px;height:36px;border-radius:6px;object-fit:cover;flex-shrink:0;">`
    : `<div style="width:36px;height:36px;border-radius:6px;background:#07c160;color:#fff;display:flex;align-items:center;justify-content:center;font-size:14px;flex-shrink:0;">TA</div>`;
  n.innerHTML = `${av}<div style="flex:1;min-width:0;"><div style="font-size:13px;font-weight:600;color:#333;margin-bottom:2px;">${esc(state.settings.taName)}</div><div style="font-size:13px;color:#666;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">${esc(msg.text || "[消息]").slice(0, 40)}</div></div>`;
  document.body.appendChild(n);
  requestAnimationFrame(() => { n.style.transform = "translateX(-50%) translateY(0)"; });
  n.addEventListener("click", () => { openChat(); n.remove(); });
  setTimeout(() => {
    n.style.transform = "translateX(-50%) translateY(-120%)";
    setTimeout(() => n.remove(), 400);
  }, 3000);
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
      wrap.innerHTML = `<div class="row"><input class="input" id="emojiInput" placeholder="emoji 或文字"><button class="btn" id="emojiAddBtn">添加</button></div><div class="row"><input type="file" id="emojiFile" accept="image/*" hidden><button class="btn secondary" id="emojiImgBtn" style="width:100%">上传图片</button></div><div id="emojiList"></div>`;
      const list = wrap.querySelector("#emojiList");
      function render() {
        list.innerHTML = "";
        if (!state.emojis.length) { list.innerHTML = `<div class="empty">还没有表情</div>`; return; }
        state.emojis.forEach((e, i) => {
          const item = document.createElement("div");
          item.className = "list-item";
          const isImg = e.startsWith("data:");
          item.innerHTML = `<div class="name" style="font-size:${isImg ? "0" : "22px"};">${isImg ? `<img src="${e}" style="width:40px;height:40px;object-fit:cover;border-radius:4px;">` : esc(e)}</div><div class="actions"><button data-send>发送</button><button class="danger" data-del>删除</button></div>`;
          item.querySelector("[data-send]").addEventListener("click", () => {
            if (isImg) sendMessage("", { image: e }); else sendMessage(e);
            modal.classList.remove("open");
          });
          item.querySelector("[data-del]").addEventListener("click", () => { state.emojis.splice(i, 1); saveEmojis(); render(); });
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
      wrap.innerHTML = `<div class="row"><input class="input" id="voiceText" placeholder="语音内容"></div><div class="row"><input class="input" id="voiceDurInput" type="number" value="5"></div><button class="btn" id="voiceSendBtn" style="width:100%">发送</button>`;
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
    wrap.innerHTML = `<div class="row"><input class="input" id="searchKw" placeholder="关键词（可空）"></div><div class="row"><input class="input" type="date" id="searchDate"></div><button class="btn" id="searchBtn" style="width:100%">搜索</button><div id="searchResults" style="margin-top:12px;"></div>`;
    const results = wrap.querySelector("#searchResults");
    wrap.querySelector("#searchBtn").addEventListener("click", () => {
      const kw = wrap.querySelector("#searchKw").value.trim();
      const dateStr = wrap.querySelector("#searchDate").value;
      let hits = state.messages.filter(m => m.text && !m.recalled);
      if (kw) hits = hits.filter(m => m.text.includes(kw));
      if (dateStr) hits = hits.filter(m => fmtDate(new Date(m.ts)) === dateStr);
      results.innerHTML = "";
      if (!hits.length) { results.innerHTML = `<div class="empty">没找到</div>`; return; }
      hits.forEach(m => {
        const item = document.createElement("div");
        item.className = "list-item"; item.style.cursor = "pointer";
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
    wrap.innerHTML = `<div class="fav-tabs"><div class="fav-tab active" data-tab="mine">我的收藏</div><div class="fav-tab" data-tab="ta">TA的收藏</div></div><div id="favList"></div>`;
    const list = wrap.querySelector("#favList");
    function render() {
      const arr = currentTab === "mine" ? state.favoritesMine : state.favoritesTa;
      list.innerHTML = "";
      if (!arr.length) { list.innerHTML = `<div class="empty">还没有收藏</div>`; return; }
      arr.forEach((f, i) => {
        const item = document.createElement("div");
        item.className = "fav-item";
        item.innerHTML = `<div class="fav-text">${esc(f.text)}</div><div class="fav-time">${f.from === "me" ? "我" : "TA"} · ${f.time}</div><div class="actions" style="margin-top:6px;"><button class="danger" data-del>删除</button></div>`;
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
  const pokeText = pick(state.pokeTexts) || "拍了拍";
  state.messages.push({ id: uid(), type: "poke", text: `我${pokeText}`, ts: Date.now() });
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
  if (Math.random() * 100 < state.settings.callRejectProb) {
    state.messages.push({ id: uid(), type: "system", text: `对方已拒绝通话`, ts: Date.now() });
    saveMessages(); renderMessages(); toast("对方已拒绝");
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

/* ========== 字卡管理 ========== */
let batchMode = false;
let selectedCards = new Set();

function openCards() {
  showScreen("cardsApp");
  batchMode = false; selectedCards.clear();
  document.getElementById("batchBar").style.display = "none";
  renderCardsPage();
}

document.getElementById("batchToggleBtn").addEventListener("click", () => {
  batchMode = !batchMode; selectedCards.clear();
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
    div.innerHTML = `<div class="name">${esc(cat.name)}<span style="color:#999;font-size:13px;">（${cat.cards.length} 张）</span></div><div class="actions"><button data-toggle>${cat.enabled === false ? "启用" : "停用"}</button><button data-open>打开</button><button class="danger" data-del>删除</button></div>`;
    div.querySelector("[data-toggle]").addEventListener("click", () => { cat.enabled = cat.enabled === false ? true : false; saveCards(); renderCardsPage(); });
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
        item.innerHTML = `<div class="name" style="display:flex;align-items:center;"><input type="checkbox" class="card-check" ${checked} data-id="${c.id}">${esc(c.text)}</div>`;
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
    wrap.innerHTML = `<textarea class="input" id="newCardInput" placeholder="输入字卡内容（可一次粘贴多行/空格分隔）" style="height:120px;padding:8px;font-family:inherit;resize:vertical;"></textarea><div class="row" style="margin-top:8px;"><button class="btn" id="addCardBtn" style="width:100%">添加</button></div><div id="cardList"></div>`;
    const list = wrap.querySelector("#cardList");
    function renderList() {
      list.innerHTML = "";
      if (!cat.cards.length) { list.innerHTML = `<div class="empty">还没有字卡</div>`; return; }
      cat.cards.forEach((c, i) => {
        const item = document.createElement("div");
        item.className = "list-item";
        item.innerHTML = `<div class="name">${esc(c.text)}</div><div class="actions"><button data-edit>编辑</button><button class="danger" data-del>删除</button></div>`;
        item.querySelector("[data-edit]").addEventListener("click", () => {
          const v = prompt("编辑字卡内容：", c.text);
          if (v === null) return;
          c.text = v.trim(); saveCards(); renderList(); toast("已保存");
        });
        item.querySelector("[data-del]").addEventListener("click", () => { cat.cards.splice(i, 1); saveCards(); renderList(); });
        list.appendChild(item);
      });
    }
    renderList();
    const inp = wrap.querySelector("#newCardInput");
    wrap.querySelector("#addCardBtn").addEventListener("click", () => {
      const text = inp.value;
      if (!text.trim()) return;
      text.split(/[\n\s]+/).map(s => s.trim()).filter(Boolean).forEach(t => {
        cat.cards.push({ id: uid(), text: t });
      });
      saveCards(); inp.value = ""; renderList(); toast("已添加");
    });
    return wrap;
  });
}
document.getElementById("newCatBtn").addEventListener("click", () => {
  const name = prompt("分类名称（如：日常 / 心情 / 意图 / 问卷 / 抉择 / 吃什么 / 查岗 / 音乐）");
  if (!name) return;
  state.cards.categories.push({ id: uid(), name: name.trim(), enabled: true, cards: [] });
  saveCards(); renderCardsPage();
});
/* ========== 抉择 ========== */
function openChoice() {
  showScreen("choiceApp");
  renderChoice();
}
function renderChoice() {
  const body = document.getElementById("choiceBody");
  const choices = getCardsByCat("抉择");
  body.innerHTML = `
    <div class="paper-box">
      <button class="paper-btn" id="choiceSelfBtn">我自己随机选</button>
      <button class="paper-btn" id="choiceTaBtn" style="background:#576b95;">让 TA 随机选</button>
      <div class="paper-tag">选项库（${choices.length} 个，在字卡管理「抉择」分类里加）</div>
      <div id="choiceResult" class="paper-result" style="text-align:center;font-size:22px;font-weight:600;color:#07c160;display:none;"></div>
      <button class="btn secondary" id="choiceSendBtn" style="width:100%;margin-top:12px;display:none;">发到聊天</button>
    </div>
  `;
  let lastResult = null;
  const res = body.querySelector("#choiceResult");
  const sendBtn = body.querySelector("#choiceSendBtn");
  body.querySelector("#choiceSelfBtn").addEventListener("click", () => {
    if (choices.length < 2) return toast("去字卡管理「抉择」分类至少加 2 个选项");
    const picked = choices[Math.floor(Math.random() * choices.length)];
    lastResult = { picked, who: "me" };
    res.style.display = "block";
    res.textContent = `你选了：${picked}`;
    sendBtn.style.display = "block";
  });
  body.querySelector("#choiceTaBtn").addEventListener("click", () => {
    if (choices.length < 2) return toast("去字卡管理「抉择」分类至少加 2 个选项");
    const picked = choices[Math.floor(Math.random() * choices.length)];
    lastResult = { picked, who: "ta" };
    res.style.display = "block";
    res.textContent = `${state.settings.taName} 选了：${picked}`;
    sendBtn.style.display = "block";
  });
  sendBtn.addEventListener("click", () => {
    if (!lastResult) return;
    if (lastResult.who === "me") sendMessage(`【抉择】我选了：${lastResult.picked}`);
    else sendMessage(`【抉择】${state.settings.taName} 选了：${lastResult.picked}`);
    toast("已发到聊天");
  });
}

/* ========== 喝水 ========== */
function openWater() {
  showScreen("waterApp");
  renderWater();
}
function renderWater() {
  const body = document.getElementById("waterBody");
  const today = fmtDate(nowBeijing());
  if (state.water.date !== today) {
    state.water.date = today;
    state.water.count = 0;
    saveWater();
  }
  const w = state.water;
  body.innerHTML = `
    <div class="water-circle">
      <div class="water-count">${w.count}</div>
      <div class="water-label">/ ${w.goal} 杯</div>
    </div>
    <div class="row" style="justify-content:center;">
      <button class="btn" id="waterAddBtn">+1 杯</button>
      <button class="btn secondary" id="waterMinusBtn">-1 杯</button>
    </div>
    <div class="row" style="justify-content:center;">
      <button class="btn secondary" id="waterGoalBtn">设置目标（当前 ${w.goal} 杯）</button>
    </div>
  `;
  body.querySelector("#waterAddBtn").addEventListener("click", () => { w.count++; saveWater(); renderWater(); });
  body.querySelector("#waterMinusBtn").addEventListener("click", () => { if (w.count > 0) w.count--; saveWater(); renderWater(); });
  body.querySelector("#waterGoalBtn").addEventListener("click", () => {
    const v = prompt("每天目标杯数：", w.goal);
    if (!v) return;
    const n = Number(v);
    if (n > 0) { w.goal = n; saveWater(); renderWater(); }
  });
}

/* ========== 搜索 ========== */
function openSearch() {
  showScreen("searchApp");
  const body = document.getElementById("searchBody");
  body.innerHTML = `
    <div class="search-box">
      <div class="search-input-wrap">
        <input id="searchKw" placeholder="输入关键词，选平台跳转" autocomplete="off">
      </div>
      <div class="search-platforms">
        ${SEARCH_PLATFORMS.map((p, i) =>
          `<button class="search-platform-btn" data-i="${i}"><span class="pf-icon">${p.icon}</span>${p.name}</button>`
        ).join("")}
      </div>
    </div>
  `;
  body.querySelectorAll(".search-platform-btn").forEach(btn => {
    btn.addEventListener("click", () => {
      const kw = body.querySelector("#searchKw").value.trim();
      if (!kw) { toast("先输入关键词"); return; }
      const p = SEARCH_PLATFORMS[Number(btn.dataset.i)];
      window.open(p.url + encodeURIComponent(kw), "_blank");
    });
  });
}

/* ========== 问卷 ========== */
function openSurvey() {
  showScreen("surveyApp");
  renderSurvey();
}
function renderSurvey() {
  const body = document.getElementById("surveyBody");
  const questions = getCardsByCat("问卷");
  const answers = store.get("surveyAs", []);
  body.innerHTML = `
    <div class="paper-box">
      <button class="paper-btn" id="surveyTaBtn" style="background:#576b95;">让 TA 随机问我</button>
      <div class="paper-tag">问卷库（${questions.length} 题，在字卡管理「问卷」分类里加）</div>
      <div id="surveyQList"></div>
      <div class="paper-tag" style="margin-top:16px;">作答记录（${answers.length} 条）</div>
      <div id="surveyAList"></div>
    </div>
  `;
  const qList = body.querySelector("#surveyQList");
  if (!questions.length) qList.innerHTML = `<div class="empty">还没有题，去字卡管理加「问卷」分类</div>`;
  else questions.forEach(q => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<div class="name">${esc(q)}</div><div class="actions"><button data-ask>问 TA</button></div>`;
    item.querySelector("[data-ask]").addEventListener("click", () => {
      const card = drawCard();
      const ans = card || "……";
      answers.push({ q, a: ans, who: "ta", time: fmtFull(nowBeijing()) });
      store.set("surveyAs", answers);
      sendMessage(`【问卷】${q}\nTA 答：${ans}`);
      renderSurvey();
    });
    qList.appendChild(item);
  });
  const aList = body.querySelector("#surveyAList");
  if (!answers.length) aList.innerHTML = `<div class="empty">还没有记录</div>`;
  else [...answers].reverse().forEach(a => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<div class="name"><b>${esc(a.q)}</b><br>答：${esc(a.a)}<br><span style="font-size:12px;color:#999;">${esc(a.time)}</span></div>`;
    aList.appendChild(item);
  });
  body.querySelector("#surveyTaBtn").addEventListener("click", () => {
    const q = drawFromCat("问卷");
    if (!q) return toast("问卷库空了，去加几张");
    const pf = SEARCH_PLATFORMS[Math.floor(Math.random() * SEARCH_PLATFORMS.length)];
    if (confirm(`TA 问你：${q}\n\n（点确定用 ${pf.name} 搜索）`)) {
      window.open(pf.url + encodeURIComponent(q), "_blank");
    }
  });
}

/* ========== 信件 ========== */
function openLetters() {
  showScreen("lettersApp");
  renderLetters();
}
function renderLetters() {
  const body = document.getElementById("lettersBody");
  const letters = store.get("letters", []);
  body.innerHTML = `<div class="paper-box"><div class="paper-tag">信件（${letters.length} 封）</div><div id="letterList"></div></div>`;
  const list = body.querySelector("#letterList");
  if (!letters.length) list.innerHTML = `<div class="empty">还没有信件，点右上角“+ 写信”</div>`;
  else [...letters].reverse().forEach(l => {
    const item = document.createElement("div");
    item.className = "letter-item" + (l.from === "ta" ? " from-ta" : "");
    item.innerHTML = `<div class="letter-subject">${l.from === "me" ? "我 → TA" : "TA → 我"}</div><div class="letter-body">${esc(l.text)}</div><div class="letter-time">${esc(l.time)}</div>`;
    list.appendChild(item);
  });
}
document.getElementById("lettersNewBtn").addEventListener("click", () => {
  openModal("写信给 TA", () => {
    const wrap = document.createElement("div");
    wrap.innerHTML = `<div class="row"><textarea class="input" id="letterText" style="height:120px;padding:8px;font-family:inherit;resize:vertical;" placeholder="写点什么…"></textarea></div><button class="btn" id="letterSendBtn" style="width:100%">寄出</button>`;
    wrap.querySelector("#letterSendBtn").addEventListener("click", () => {
      const t = wrap.querySelector("#letterText").value.trim();
      if (!t) return;
      const letters = store.get("letters", []);
      letters.push({ id: uid(), from: "me", text: t, time: fmtFull(nowBeijing()) });
      store.set("letters", letters);
      modal.classList.remove("open"); renderLetters(); toast("已寄出");
      const replyProb = state.settings.letterReplyProb || 50;
      if (Math.random() * 100 < replyProb) {
        setTimeout(() => {
          const card = drawCard();
          if (!card) return;
          const ls = store.get("letters", []);
          ls.push({ id: uid(), from: "ta", text: card, time: fmtFull(nowBeijing()) });
          store.set("letters", ls);
          const letterScreen = document.getElementById("lettersApp");
          if (letterScreen && letterScreen.classList.contains("active")) renderLetters();
          toast(`${state.settings.taName} 回信了`);
        }, rand(3000, 6000));
      }
    });
    return wrap;
  });
});

/* ========== 购物 ========== */
function openShopping() {
  showScreen("shoppingApp");
  renderShopping();
}
function renderShopping() {
  const body = document.getElementById("shoppingBody");
  const items = store.get("shopItems", []);
  body.innerHTML = `<div class="paper-box"><div class="paper-tag">商品（${items.length} 个）</div><div id="shopList"></div></div>`;
  const list = body.querySelector("#shopList");
  if (!items.length) list.innerHTML = `<div class="empty">还没有商品，点右上角“+ 添加”</div>`;
  else items.forEach((it, i) => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<div class="name">${esc(it.name)}</div><div class="actions"><button data-go>去淘宝</button><button data-fav>收藏</button><button class="danger" data-del>删除</button></div>`;
    item.querySelector("[data-go]").addEventListener("click", () => {
      window.open(`https://s.taobao.com/search?q=${encodeURIComponent(it.name)}`, "_blank");
    });
    item.querySelector("[data-fav]").addEventListener("click", () => {
      const favs = store.get("shopFavs", []);
      favs.push({ id: uid(), name: it.name, time: fmtFull(nowBeijing()) });
      store.set("shopFavs", favs);
      toast("已收藏");
    });
    item.querySelector("[data-del]").addEventListener("click", () => {
      items.splice(i, 1); store.set("shopItems", items); renderShopping();
    });
    list.appendChild(item);
  });
}
document.getElementById("shoppingAddBtn").addEventListener("click", () => {
  const name = prompt("商品名（会跳转淘宝搜索）：");
  if (!name) return;
  const items = store.get("shopItems", []);
  items.push({ id: uid(), name: name.trim() });
  store.set("shopItems", items);
  renderShopping();
});

/* ========== 吃什么 ========== */
function openEat() {
  showScreen("eatApp");
  renderEat();
}
function renderEat() {
  const body = document.getElementById("eatBody");
  const menu = getCardsByCat("吃什么");
  body.innerHTML = `
    <div class="eat-result" id="eatResult">今天吃什么呢？</div>
    <button class="paper-btn" id="eatBtn">随机抽一个</button>
    <div class="paper-tag">菜单库（${menu.length} 个，在字卡管理「吃什么」分类里加）</div>
  `;
  body.querySelector("#eatBtn").addEventListener("click", () => {
    const list = menu.length ? menu : ["火锅","麻辣烫","烤肉","日料","寿司","拉面","汉堡","披萨","炸鸡","沙拉","川菜","粤菜","湘菜","东北菜","泰餐","韩餐","意大利面","牛排","甜品","蛋糕","冰淇淋","奶茶","咖啡","小笼包","煎饺","馄饨","炒饭","拌面"];
    const f = list[Math.floor(Math.random() * list.length)];
    body.querySelector("#eatResult").textContent = f;
    const pf = SEARCH_PLATFORMS[Math.floor(Math.random() * SEARCH_PLATFORMS.length)];
    setTimeout(() => {
      if (confirm(`吃「${f}」？\n\n点确定用 ${pf.name} 搜索`)) {
        window.open(pf.url + encodeURIComponent(f), "_blank");
      }
    }, 300);
  });
}

/* ========== 查岗 ========== */
function openCheckin() {
  showScreen("checkinApp");
  renderCheckin();
}
function renderCheckin() {
  const body = document.getElementById("checkinBody");
  const records = store.get("checkinRecords", []);
  body.innerHTML = `
    <div class="checkin-result" id="checkinResult">点下方按钮，看 TA 在干嘛</div>
    <button class="paper-btn" id="checkinBtn">查岗</button>
    <div class="paper-tag" style="margin-top:16px;">查岗记录（${records.length} 条）</div>
    <div id="checkinList"></div>
  `;
  const list = body.querySelector("#checkinList");
  if (!records.length) list.innerHTML = `<div class="empty">还没有记录</div>`;
  else [...records].reverse().slice(0, 20).forEach(r => {
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<div class="name">${esc(r.text)}<br><span style="font-size:12px;color:#999;">${esc(r.time)}</span></div>`;
    list.appendChild(item);
  });
  body.querySelector("#checkinBtn").addEventListener("click", () => {
    const card = drawFromCat("查岗") || drawCard();
    if (!card) return toast("字卡库空了");
    body.querySelector("#checkinResult").textContent = card;
    records.push({ text: card, time: fmtFull(nowBeijing()) });
    store.set("checkinRecords", records);
    renderCheckin();
  });
}

/* ========== 番茄钟 ========== */
let pomoTimer = null;
let pomoRemain = 25 * 60;
let pomoMode = "专注";
function openPomodoro() {
  showScreen("pomodoroApp");
  renderPomodoro();
}
function fmtPomoTime(s) {
  const m = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(m).padStart(2,"0")}:${String(ss).padStart(2,"0")}`;
}
function renderPomodoro() {
  const body = document.getElementById("pomodoroBody");
  const done = store.get("pomoDone", 0);
  body.innerHTML = `
    <div class="paper-box" style="text-align:center;">
      <div class="paper-tag">${pomoMode}</div>
      <div class="pomo-timer" id="pomoTimer">${fmtPomoTime(pomoRemain)}</div>
      <div class="pomo-actions">
        <button class="btn" id="pomoStartBtn">开始</button>
        <button class="btn secondary" id="pomoPauseBtn">暂停</button>
        <button class="btn secondary" id="pomoResetBtn">重置</button>
      </div>
      <div class="row" style="justify-content:center;gap:8px;">
        <button class="btn secondary" data-mode="专注">专注 25</button>
        <button class="btn secondary" data-mode="小憩">小憩 5</button>
        <button class="btn secondary" data-mode="长休">长休 15</button>
      </div>
      <div class="paper-tag" style="margin-top:16px;">今日完成：${done} 个 🍅</div>
    </div>
  `;
  body.querySelector("#pomoStartBtn").addEventListener("click", () => {
    if (pomoTimer) return;
    pomoTimer = setInterval(() => {
      pomoRemain--;
      const el = document.getElementById("pomoTimer");
      if (el) el.textContent = fmtPomoTime(pomoRemain);
      if (pomoRemain <= 0) {
        clearInterval(pomoTimer); pomoTimer = null;
        if (pomoMode === "专注") {
          const d = store.get("pomoDone", 0) + 1;
          store.set("pomoDone", d);
        }
        alert(`${pomoMode}结束！`);
        renderPomodoro();
      }
    }, 1000);
  });
  body.querySelector("#pomoPauseBtn").addEventListener("click", () => {
    if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
  });
  body.querySelector("#pomoResetBtn").addEventListener("click", () => {
    if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
    pomoRemain = pomoMode === "专注" ? 25*60 : pomoMode === "小憩" ? 5*60 : 15*60;
    renderPomodoro();
  });
  body.querySelectorAll("[data-mode]").forEach(btn => {
    btn.addEventListener("click", () => {
      if (pomoTimer) { clearInterval(pomoTimer); pomoTimer = null; }
      pomoMode = btn.dataset.mode;
      pomoRemain = pomoMode === "专注" ? 25*60 : pomoMode === "小憩" ? 5*60 : 15*60;
      renderPomodoro();
    });
  });
}

/* ========== 音乐 ========== */
function openMusic() {
  showScreen("musicApp");
  renderMusic();
}
function renderMusic() {
  const body = document.getElementById("musicBody");
  const songs = getCardsByCat("音乐");
  body.innerHTML = `
    <div class="paper-box">
      <button class="paper-btn" id="musicRandomBtn">随机播放一首</button>
      <div class="paper-tag">歌单（${songs.length} 首，在字卡管理「音乐」分类里加，格式：歌名|链接）</div>
      <div id="songList"></div>
    </div>
  `;
  const list = body.querySelector("#songList");
  if (!songs.length) list.innerHTML = `<div class="empty">还没有歌</div>`;
  else songs.forEach(s => {
    const parts = s.split("|");
    const name = parts[0], url = parts[1] || "";
    const item = document.createElement("div");
    item.className = "list-item";
    item.innerHTML = `<div class="name">${esc(name)}</div><div class="actions"><button data-go>播放</button></div>`;
    item.querySelector("[data-go]").addEventListener("click", () => {
      if (url) window.open(url, "_blank");
      else toast("没有链接");
    });
    list.appendChild(item);
  });
  body.querySelector("#musicRandomBtn").addEventListener("click", () => {
    if (!songs.length) return toast("还没有歌");
    const s = songs[Math.floor(Math.random() * songs.length)];
    const parts = s.split("|");
    if (parts[1]) window.open(parts[1], "_blank");
    toast(`播放：${parts[0]}`);
  });
}

/* ========== 推书 ========== */
function openBooks() {
  showScreen("booksApp");
  renderBooks();
}
function renderBooks() {
  const body = document.getElementById("booksBody");
  body.innerHTML = `
    <div class="paper-box">
      <button class="paper-btn" id="bookBtn">随机推一本</button>
      <div class="card-result" id="bookResult">点上方按钮，随机推书</div>
    </div>
  `;
  body.querySelector("#bookBtn").addEventListener("click", () => {
    const cards = getAllCards();
    if (!cards.length) return toast("先加字卡");
    const kw = cards[Math.floor(Math.random() * cards.length)].split(/\s+/)[0].slice(0, 10);
    const url = `https://search.douban.com/book/subject_search?search_text=${encodeURIComponent(kw)}`;
    body.querySelector("#bookResult").innerHTML = `关键词：<b>${esc(kw)}</b><br><a href="${url}" target="_blank" style="color:#07c160;">去豆瓣搜索 →</a>`;
  });
}

/* ========== 弹窗 ========== */
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

/* ========== 设置 ========== */
function openSettings() {
  showScreen("settingsApp");
  renderSettingsPage();
}
function renderSettingsPage() {
  const body = document.getElementById("settingsBody");
  const s = state.settings;
  body.innerHTML = `
    <div class="list-item"><div class="name">我的昵称</div><div class="actions"><button data-edit="myName">${esc(s.myName)}</button></div></div>
    <div class="list-item"><div class="name">对方昵称</div><div class="actions"><button data-edit="taName">${esc(s.taName)}</button></div></div>
    <div class="list-item"><div class="name">聊天背景色</div><div class="actions"><input type="color" value="${s.bgColor}" data-color="bgColor"></div></div>
    <div class="list-item"><div class="name">聊天背景图</div><div class="actions"><button data-bgimg>上传</button>${s.bgImage ? `<button class="danger" data-bgclear>清除</button>` : ""}</div></div>
    <div class="list-item"><div class="name">我的气泡颜色</div><div class="actions"><input type="color" value="${s.myBubbleColor}" data-color="myBubbleColor"></div></div>
    <div class="list-item"><div class="name">对方气泡颜色</div><div class="actions"><input type="color" value="${s.taBubbleColor}" data-color="taBubbleColor"></div></div>
    <div class="list-item"><div class="name">字体大小（${s.fontSize}px）</div><div class="actions"><input type="range" min="12" max="22" value="${s.fontSize}" data-range="fontSize"></div></div>
    <div class="list-item"><div class="name">已读不回（${s.readNoReplyProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.readNoReplyProb}" data-range="readNoReplyProb"></div></div>
    <div class="list-item"><div class="name">语音概率（${s.voiceProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.voiceProb}" data-range="voiceProb"></div></div>
    <div class="list-item"><div class="name">图片概率（${s.imgProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.imgProb}" data-range="imgProb"></div></div>
    <div class="list-item"><div class="name">随机搜索链接（${s.searchLinkProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.searchLinkProb}" data-range="searchLinkProb"></div></div>
    <div class="list-item"><div class="name">问卷触发（${s.surveyProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.surveyProb}" data-range="surveyProb"></div></div>
    <div class="list-item"><div class="name">抉择触发（${s.choiceProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.choiceProb}" data-range="choiceProb"></div></div>
    <div class="list-item"><div class="name">查岗触发（${s.checkinProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.checkinProb}" data-range="checkinProb"></div></div>
    <div class="list-item"><div class="name">拍一拍回拍（${s.pokeBackProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.pokeBackProb}" data-range="pokeBackProb"></div></div>
    <div class="list-item"><div class="name">拍一拍触发字卡（${s.pokeCardProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.pokeCardProb}" data-range="pokeCardProb"></div></div>
    <div class="list-item"><div class="name">通话拒绝（${s.callRejectProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.callRejectProb}" data-range="callRejectProb"></div></div>
    <div class="list-item"><div class="name">心情触发（${s.moodProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.moodProb}" data-range="moodProb"></div></div>
    <div class="list-item"><div class="name">意图触发（${s.intentProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.intentProb}" data-range="intentProb"></div></div>
    <div class="list-item"><div class="name">对方发朋友圈（${s.taMomentsProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.taMomentsProb}" data-range="taMomentsProb"></div></div>
    <div class="list-item"><div class="name">对方评论（${s.taCommentProb}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.taCommentProb}" data-range="taCommentProb"></div></div>
    <div class="list-item"><div class="name">对方回信概率（${s.letterReplyProb || 50}%）</div><div class="actions"><input type="range" min="0" max="100" value="${s.letterReplyProb || 50}" data-range="letterReplyProb"></div></div>
    <div class="list-item"><div class="name">拍一拍文案库</div><div class="actions"><button data-pokemgr>管理（${state.pokeTexts.length}）</button></div></div>`;
  body.querySelectorAll("[data-edit]").forEach(btn => {
    btn.addEventListener("click", () => {
      const k = btn.dataset.edit;
      const v = prompt("修改为：", s[k]);
      if (v === null) return;
      s[k] = v.trim() || s[k];
      saveSettings(); renderSettingsPage();
      if (k === "taName") document.getElementById("chatTitle").textContent = s.taName;
    });
  });
  body.querySelectorAll("[data-color]").forEach(inp => {
    inp.addEventListener("input", () => { s[inp.dataset.color] = inp.value; saveSettings(); applyAppearance(); });
  });
  body.querySelectorAll("[data-range]").forEach(inp => {
    inp.addEventListener("input", () => {
      s[inp.dataset.range] = Number(inp.value);
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
      s.bgImage = data; saveSettings(); renderSettingsPage(); applyChatBackground();
    };
    f.click();
  });
  const bgClear = body.querySelector("[data-bgclear]");
  if (bgClear) bgClear.addEventListener("click", () => {
    s.bgImage = ""; saveSettings(); renderSettingsPage(); applyChatBackground();
  });
  const pokeMgr = body.querySelector("[data-pokemgr]");
  if (pokeMgr) pokeMgr.addEventListener("click", () => {
    openModal("拍一拍文案库", () => {
      const wrap = document.createElement("div");
      wrap.innerHTML = `<div class="row"><input class="input" id="pokeInput" placeholder="输入拍一拍文案"><button class="btn" id="pokeAddBtn">添加</button></div><div id="pokeList"></div>`;
      const list = wrap.querySelector("#pokeList");
      function render() {
        list.innerHTML = "";
        if (!state.pokeTexts.length) { list.innerHTML = `<div class="empty">还没有文案</div>`; return; }
        state.pokeTexts.forEach((t, i) => {
          const item = document.createElement("div");
          item.className = "list-item";
          item.innerHTML = `<div class="name">${esc(t)}</div><div class="actions"><button class="danger" data-del>删除</button></div>`;
          item.querySelector("[data-del]").addEventListener("click", () => { state.pokeTexts.splice(i, 1); savePokeTexts(); render(); });
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

/* ========== 初始化 ========== */
function init() {
  renderDesktop();
  tickDesktopTime();
  setInterval(tickDesktopTime, 1000 * 30);
  initInputBar();
  applyAppearance();

  document.querySelectorAll("[data-app]").forEach(el => {
    el.addEventListener("click", () => {
      const app = el.dataset.app;
      if (app === "settings") openSettings();
    });
  });

  if (state.cards.categories.length === 0) {
    state.cards.categories.push({
      id: uid(), name: "日常", enabled: true,
      cards: [
        { id: uid(), text: "在的" }, { id: uid(), text: "怎么啦" },
        { id: uid(), text: "我在想你" }, { id: uid(), text: "今天过得怎么样" },
        { id: uid(), text: "要好好吃饭哦" }, { id: uid(), text: "早点休息" }
      ]
    });
    state.cards.categories.push({ id: uid(), name: "心情", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "意图", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "问卷", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "抉择", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "吃什么", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "查岗", enabled: true, cards: [] });
    state.cards.categories.push({ id: uid(), name: "音乐", enabled: true, cards: [] });
    saveCards();
  }
}

init();