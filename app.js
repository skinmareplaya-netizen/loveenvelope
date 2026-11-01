(() => {
  const $ = (s) => document.querySelector(s);
  const form = $("#letter-form");
  const message = $("#message");
  const title = $("#title");
  const to = $("#to");
  const from = $("#from");
  const signature = $("#signature");
  const music = $("#music");
  const stage = $("#preview-stage");
  const envelope = $("#preview-envelope");
  const status = $("#form-status");
  const toast = $("#toast");
  let kind = "sorry", theme = "noir", opened = false, audioCtx = null, ambientTimer = null;

  const presets = {
    sorry: { title:"Прости меня, пожалуйста", message:"Я понимаю, что мог(ла) сделать тебе больно, и мне искренне жаль. Я не хочу оправдываться — хочу услышать тебя и постараться всё исправить. Ты важен(важна) для меня, и я надеюсь, что однажды мы сможем спокойно поговорить. Прости меня, если сможешь.", sign:"С теплом и искренностью" },
    birthday: { title:"С днём рождения!", message:"Пусть в твоей жизни будет больше поводов улыбаться, людей, рядом с которыми спокойно, и мечт, которые становятся реальностью. Желаю тебе тепла, смелости, вдохновения и маленьких чудес каждый день. Сегодня твой день — сияй!", sign:"Обнимаю крепко" },
    date: { title:"У меня есть идея…", message:"Я хотел(а) бы пригласить тебя на маленькое свидание. Немного прогулки, что-нибудь вкусное и разговоры обо всём на свете. Как тебе идея провести этот вечер вместе? Если захочешь — выберем место и время вместе. ♡", sign:"Жду твоего ответа" },
    love: { title:"Есть кое-что важное", message:"Мне нравится, как меняется мой день, когда я слышу тебя. В твоём присутствии даже обычные моменты становятся особенными. Я не хочу торопить события — просто хочу честно сказать, что ты много для меня значишь.", sign:"От всего сердца" },
    support: { title:"Ты справишься. Я рядом.", message:"Я знаю, что сейчас может быть непросто. Необязательно быть сильным каждую минуту и не нужно со всем справляться в одиночку. Если захочешь поговорить, помолчать или просто отвлечься — я рядом. Ты важен(важна), и я верю в тебя.", sign:"Ты не один(одна)" },
    custom: { title:"Небольшое послание для тебя", message:"Здесь могут быть именно твои слова. Не обязательно писать идеально — главное, чтобы это было искренне.", sign:"С теплом" }
  };

  function toastMessage(text) {
    toast.textContent = text; toast.classList.add("show");
    window.setTimeout(() => toast.classList.remove("show"), 3200);
  }
  function updatePreview() {
    $("#preview-title").textContent = title.value.trim() || "Твоё послание";
    $("#preview-to").textContent = to.value.trim() ? "для " + to.value.trim() : "для особенного человека";
    stage.dataset.theme = theme;
  }
  function stopAmbient() {
    if (ambientTimer) window.clearInterval(ambientTimer);
    ambientTimer = null;
  }
  function playSound() {
    if (music.value === "off") return;
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      audioCtx = audioCtx || new AudioContext();
      if (audioCtx.state === "suspended") audioCtx.resume();
      const playTone = (freq, start, duration, volume = .045) => {
        const osc = audioCtx.createOscillator(), gain = audioCtx.createGain();
        osc.type = "sine"; osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(.0001, start);
        gain.gain.exponentialRampToValueAtTime(volume, start + .03);
        gain.gain.exponentialRampToValueAtTime(.0001, start + duration);
        osc.connect(gain); gain.connect(audioCtx.destination);
        osc.start(start); osc.stop(start + duration + .03);
      };
      const now = audioCtx.currentTime;
      if (music.value === "chime") { playTone(880, now, .5); playTone(1174, now + .13, .65); }
      else {
        stopAmbient();
        const notes = [392, 523.25, 659.25, 523.25, 440, 587.33, 659.25, 587.33];
        let i = 0;
        ambientTimer = window.setInterval(() => {
          if (!opened || music.value !== "ambient") { stopAmbient(); return; }
          playTone(notes[i % notes.length], audioCtx.currentTime, 1.15, .018);
          i++;
        }, 760);
        notes.slice(0, 3).forEach((n, i) => playTone(n, now + i * .16, .9, .018));
      }
    } catch (e) { /* Audio is optional and browser-controlled. */ }
  }
  function particles() {
    const chars = ["♡", "✦", "♥", "✧"];
    for (let i = 0; i < 12; i++) {
      const p = document.createElement("span");
      p.className = "particle"; p.textContent = chars[Math.floor(Math.random() * chars.length)];
      p.style.left = (20 + Math.random() * 60) + "%";
      p.style.top = (40 + Math.random() * 30) + "%";
      p.style.animationDelay = (Math.random() * .5) + "s";
      p.style.color = theme === "garden" ? "#d8df9b" : theme === "sky" ? "#d6dffb" : "#f1b4ca";
      stage.appendChild(p); window.setTimeout(() => p.remove(), 3000);
    }
  }

  document.querySelectorAll(".occasion").forEach(btn => btn.addEventListener("click", () => {
    kind = btn.dataset.kind;
    document.querySelectorAll(".occasion").forEach(b => b.classList.toggle("active", b === btn));
    if (presets[kind]) {
      title.value = presets[kind].title; message.value = presets[kind].message;
      signature.value = presets[kind].sign;
    }
    updatePreview(); opened = false; envelope.classList.remove("open"); $("#preview-hint").textContent = "Нажми на конверт, чтобы открыть";
  }));
  document.querySelectorAll(".theme-option").forEach(btn => btn.addEventListener("click", () => {
    theme = btn.dataset.theme;
    document.querySelectorAll(".theme-option").forEach(b => b.classList.toggle("active", b === btn));
    updatePreview();
  }));
  [title, to].forEach(el => el.addEventListener("input", updatePreview));
  envelope.addEventListener("click", () => {
    opened = !opened; envelope.classList.toggle("open", opened);
    $("#preview-hint").textContent = opened ? "Вот так откроется твоё письмо ♡" : "Нажми на конверт, чтобы открыть";
    if (opened) { particles(); playSound(); } else stopAmbient();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    const payload = {
      kind, theme, to: to.value.trim(), from: from.value.trim(),
      title: title.value.trim() || "Небольшое послание для тебя",
      message: message.value.trim(), signature: signature.value.trim(),
      music: music.value
    };
    if (!payload.message) { status.textContent = "Добавь текст послания, чтобы создать конверт."; message.focus(); return; }
    const btn = $("#create-btn"); btn.disabled = true; btn.innerHTML = "Создаём конверт…";
    status.textContent = "Сохраняем и создаём уникальную ссылку…";
    try {
      const response = await fetch("/api/envelopes", {
        method:"POST", headers:{"Content-Type":"application/json"}, body:JSON.stringify(payload)
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Не удалось сохранить конверт.");
      const link = new URL("/l/" + data.id, window.location.origin).href;
      status.innerHTML = "";
      const result = document.createElement("div"); result.className = "share-result";
      result.innerHTML = '<strong>Твой конверт готов ♡</strong><p>Скопируй ссылку и отправь её получателю.</p>';
      const linkInput = document.createElement("input"); linkInput.value = link; linkInput.readOnly = true; linkInput.setAttribute("aria-label","Публичная ссылка");
      const copy = document.createElement("button"); copy.type = "button"; copy.className = "primary-btn wide"; copy.textContent = "Скопировать ссылку";
      copy.addEventListener("click", async () => {
        try { await navigator.clipboard.writeText(link); copy.textContent = "Ссылка скопирована ✓"; }
        catch { linkInput.select(); document.execCommand("copy"); copy.textContent = "Скопировано (если разрешено браузером)"; }
      });
      const open = document.createElement("a"); open.className = "secondary-link"; open.href = link; open.target = "_blank"; open.rel = "noopener"; open.textContent = "Открыть конверт в новой вкладке ↗";
      result.append(linkInput, copy, open); status.appendChild(result);
      toastMessage("Конверт создан! Ссылка готова.");
    } catch (error) {
      status.textContent = error.message + " Если сайт ещё не настроен в Cloudflare, сначала подключи D1 по инструкции ниже.";
    } finally {
      btn.disabled = false; btn.innerHTML = 'Создать публичную ссылку <span>↗</span>';
    }
  });
  updatePreview();
})();
