(function () {
  "use strict";

  const STORAGE_KEY = "game-arcade-custom-games";

  const QUIZ_QUESTIONS = [
    {
      q: "Thủ đô của Việt Nam là gì?",
      options: ["Hà Nội", "Huế", "Đà Nẵng", "TP. Hồ Chí Minh"],
      correct: 0,
    },
    {
      q: "5 × 7 = ?",
      options: ["30", "35", "42", "40"],
      correct: 1,
    },
    {
      q: "Nước sôi ở 100°C ở điều kiện áp suất tiêu chuẩn. Đúng hay sai?",
      options: ["Đúng", "Sai"],
      correct: 0,
    },
    {
      q: "Trong HTML, thẻ nào dùng cho đoạn văn?",
      options: ["<div>", "<p>", "<span>", "<br>"],
      correct: 1,
    },
    {
      q: "Mặt Trời mọc hướng nào (ở Bắc bán cầu)?",
      options: ["Tây", "Nam", "Đông", "Bắc"],
      correct: 2,
    },
    {
      q: "12 − 8 = ?",
      options: ["3", "4", "5", "6"],
      correct: 1,
    },
    {
      q: "Ai là tác giả Truyện Kiều?",
      options: ["Nguyễn Du", "Hồ Xuân Hương", "Nguyễn Trãi", "Chu Văn An"],
      correct: 0,
    },
    {
      q: "CSS dùng để làm gì?",
      options: ["Lưu dữ liệu", "Định dạng giao diện", "Chạy logic", "Quản lý máy chủ"],
      correct: 1,
    },
  ];

  const SECONDS_PER_QUESTION = 15;
  const QUESTIONS_PER_ROUND = 5;

  const els = {
    hub: document.getElementById("view-hub"),
    quiz: document.getElementById("view-quiz"),
    quizResult: document.getElementById("view-quiz-result"),
    custom: document.getElementById("view-custom"),
    builtInGames: document.getElementById("built-in-games"),
    customGames: document.getElementById("custom-games"),
    customEmpty: document.getElementById("custom-empty"),
    formAddGame: document.getElementById("form-add-game"),
    quizBack: document.getElementById("quiz-back"),
    customBack: document.getElementById("custom-back"),
    quizQNum: document.getElementById("quiz-q-num"),
    quizQTotal: document.getElementById("quiz-q-total"),
    quizScore: document.getElementById("quiz-score"),
    quizQuestion: document.getElementById("quiz-question"),
    quizOptions: document.getElementById("quiz-options"),
    quizFeedback: document.getElementById("quiz-feedback"),
    quizNext: document.getElementById("quiz-next"),
    quizTimerBar: document.getElementById("quiz-timer-bar"),
    quizTimerSec: document.getElementById("quiz-timer-sec"),
    resultScore: document.getElementById("result-score"),
    resultDetail: document.getElementById("result-detail"),
    resultReplay: document.getElementById("result-replay"),
    resultHome: document.getElementById("result-home"),
    customPlaceholder: document.getElementById("custom-placeholder"),
  };

  function showView(name) {
    document.querySelectorAll(".view").forEach((v) => v.classList.remove("active"));
    const map = { hub: els.hub, quiz: els.quiz, quizResult: els.quizResult, custom: els.custom };
    (map[name] || els.hub).classList.add("active");
  }

  function loadCustomGames() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [];
      const data = JSON.parse(raw);
      return Array.isArray(data) ? data : [];
    } catch {
      return [];
    }
  }

  function saveCustomGames(list) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(list));
  }

  function shuffle(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  function renderBuiltIn() {
    els.builtInGames.innerHTML = "";
    const card = document.createElement("button");
    card.type = "button";
    card.className = "game-card accent-mint";
    card.innerHTML =
      '<div class="game-card-emoji">⚡</div><h3>Hỏi nhanh đáp lẹ</h3><p>Trả lời đúng trong thời gian giới hạn!</p>';
    card.addEventListener("click", startQuiz);
    els.builtInGames.appendChild(card);
  }

  function renderCustomList() {
    const list = loadCustomGames();
    els.customGames.innerHTML = "";
    els.customEmpty.hidden = list.length > 0;

    list.forEach((g, index) => {
      const wrap = document.createElement("div");
      wrap.className = "game-card-wrap";

      const card = document.createElement("button");
      card.type = "button";
      card.className = "game-card accent-" + (g.accent || "sky");
      const emoji = g.emoji && g.emoji.trim() ? g.emoji.trim() : "🎲";
      card.innerHTML =
        '<div class="game-card-emoji">' +
        escapeHtml(emoji) +
        "</div><h3>" +
        escapeHtml(g.title) +
        "</h3><p>" +
        escapeHtml(g.description || "Trò do bạn thêm.") +
        "</p>";
      card.addEventListener("click", () => openCustomGame(g, index));

      const del = document.createElement("button");
      del.type = "button";
      del.className = "card-delete";
      del.setAttribute("aria-label", "Xóa trò chơi");
      del.title = "Xóa";
      del.textContent = "×";
      del.addEventListener("click", (ev) => {
        ev.stopPropagation();
        const next = loadCustomGames().filter((_, i) => i !== index);
        saveCustomGames(next);
        renderCustomList();
      });

      wrap.appendChild(card);
      wrap.appendChild(del);
      els.customGames.appendChild(wrap);
    });
  }

  function escapeHtml(s) {
    const div = document.createElement("div");
    div.textContent = s;
    return div.innerHTML;
  }

  function openCustomGame(g) {
    els.customPlaceholder.innerHTML =
      '<div class="big-emoji">' +
      escapeHtml((g.emoji && g.emoji.trim()) || "🎲") +
      "</div><h2>" +
      escapeHtml(g.title) +
      "</h2><p>Đây là trò do bạn tạo. Sau này bạn có thể gắn thêm luật chơi hoặc màn hình riêng cho từng trò.</p>";
    showView("custom");
  }

  /* Quiz state */
  let quizRound = [];
  let quizIndex = 0;
  let quizScore = 0;
  let timerId = null;
  let deadline = 0;
  let answered = false;
  /** @type {{ text: string, isCorrect: boolean }[]} */
  let currentOptions = [];

  function pickRoundQuestions() {
    return shuffle(QUIZ_QUESTIONS).slice(0, QUESTIONS_PER_ROUND);
  }

  function clearTimer() {
    if (timerId) {
      clearInterval(timerId);
      timerId = null;
    }
  }

  function startQuiz() {
    quizRound = pickRoundQuestions();
    quizIndex = 0;
    quizScore = 0;
    els.quizQTotal.textContent = String(quizRound.length);
    showView("quiz");
    showQuestion();
  }

  function showQuestion() {
    answered = false;
    els.quizFeedback.hidden = true;
    els.quizNext.hidden = true;
    els.quizScore.textContent = String(quizScore);
    els.quizQNum.textContent = String(quizIndex + 1);

    const item = quizRound[quizIndex];
    els.quizQuestion.textContent = item.q;
    els.quizOptions.innerHTML = "";

    currentOptions = shuffle(
      item.options.map((text, i) => ({
        text,
        isCorrect: i === item.correct,
      }))
    );

    currentOptions.forEach((row, i) => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "quiz-option";
      btn.textContent = row.text;
      btn.addEventListener("click", () => onPick(i));
      els.quizOptions.appendChild(btn);
    });

    startTimer();
  }

  function startTimer() {
    clearTimer();
    deadline = Date.now() + SECONDS_PER_QUESTION * 1000;
    els.quizTimerBar.style.transform = "scaleX(1)";
    tickTimer();

    timerId = setInterval(tickTimer, 100);
  }

  function tickTimer() {
    const left = Math.max(0, deadline - Date.now());
    const sec = Math.ceil(left / 1000);
    els.quizTimerSec.textContent = String(sec);
    const ratio = left / (SECONDS_PER_QUESTION * 1000);
    els.quizTimerBar.style.transform = "scaleX(" + Math.max(0, ratio) + ")";

    if (left <= 0 && !answered) {
      onTimeout();
    }
  }

  function onTimeout() {
    if (answered) return;
    answered = true;
    clearTimer();
    const buttons = els.quizOptions.querySelectorAll(".quiz-option");
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (currentOptions[i] && currentOptions[i].isCorrect) b.classList.add("correct");
    });
    els.quizFeedback.hidden = false;
    els.quizFeedback.className = "quiz-feedback bad";
    els.quizFeedback.textContent = "Hết giờ! Đáp án đúng đã được tô sáng.";
    els.quizNext.hidden = false;
  }

  function onPick(choice) {
    if (answered) return;
    answered = true;
    clearTimer();

    const buttons = els.quizOptions.querySelectorAll(".quiz-option");
    const picked = currentOptions[choice];
    buttons.forEach((b, i) => {
      b.disabled = true;
      if (currentOptions[i] && currentOptions[i].isCorrect) b.classList.add("correct");
      else if (i === choice) b.classList.add("wrong");
    });

    const left = Math.max(0, deadline - Date.now());
    const timeBonus = Math.floor(left / 1000);

    els.quizFeedback.hidden = false;
    if (picked && picked.isCorrect) {
      const gained = 10 + Math.min(5, timeBonus);
      quizScore += gained;
      els.quizFeedback.className = "quiz-feedback ok";
      els.quizFeedback.textContent = "Chính xác! +" + gained + " điểm (gồm thưởng tốc độ).";
    } else {
      els.quizFeedback.className = "quiz-feedback bad";
      els.quizFeedback.textContent = "Chưa đúng. Cố gắng câu sau nhé!";
    }
    els.quizScore.textContent = String(quizScore);
    els.quizNext.hidden = false;
  }

  function nextQuestion() {
    quizIndex++;
    if (quizIndex >= quizRound.length) {
      finishQuiz();
      return;
    }
    showQuestion();
  }

  function finishQuiz() {
    clearTimer();
    els.resultScore.textContent = String(quizScore);
    const max = quizRound.length * 15;
    els.resultDetail.textContent =
      "Tối đa khoảng " + max + " điểm nếu trả lời nhanh và đúng hết. Bạn đã hoàn thành " + quizRound.length + " câu.";
    showView("quizResult");
  }

  /* Events */
  els.quizBack.addEventListener("click", () => {
    clearTimer();
    showView("hub");
  });
  els.customBack.addEventListener("click", () => showView("hub"));
  els.quizNext.addEventListener("click", nextQuestion);
  els.resultReplay.addEventListener("click", startQuiz);
  els.resultHome.addEventListener("click", () => showView("hub"));

  els.formAddGame.addEventListener("submit", (e) => {
    e.preventDefault();
    const fd = new FormData(els.formAddGame);
    const title = String(fd.get("title") || "").trim();
    if (!title) return;

    const game = {
      title,
      emoji: String(fd.get("emoji") || "").trim() || "🎲",
      description: String(fd.get("description") || "").trim(),
      accent: String(fd.get("accent") || "sky"),
    };

    const list = loadCustomGames();
    list.push(game);
    saveCustomGames(list);
    els.formAddGame.reset();
    renderCustomList();
  });

  renderBuiltIn();
  renderCustomList();
})();
