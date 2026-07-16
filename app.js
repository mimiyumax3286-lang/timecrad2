// 1日ごとのデータを保存する配列
// { date: "2026-07-16", start: "09:12", end: "18:44" }
let days = [];

// 起動時にlocalStorageから読み込み
window.addEventListener("load", () => {
  const saved = localStorage.getItem("yokosen_days");
  if (saved) {
    days = JSON.parse(saved);
  }
  render();
});

// 日付文字列（YYYY-MM-DD）を返す
function getTodayKey() {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

// 表示用の日付（例: "16 (木)"）
function formatDisplayDate(dateKey) {
  const [y, m, d] = dateKey.split("-");
  const dt = new Date(Number(y), Number(m) - 1, Number(d));
  const youbi = ["日","月","火","水","木","金","土"][dt.getDay()];
  return `${Number(d)} (${youbi})`;
}

// 時刻文字列（例: "09:12"）
function getNowTime() {
  const d = new Date();
  const h = String(d.getHours()).padStart(2, "0");
  const m = String(d.getMinutes()).padStart(2, "0");
  return `${h}:${m}`;
}

// 出勤ボタン
function clockIn() {
  const key = getTodayKey();
  const time = getNowTime();

  let day = days.find(d => d.date === key);
  if (!day) {
    day = { date: key, start: time, end: null };
    days.push(day);
  } else {
    day.start = time;
  }

  save();
  render();
}

// 退勤ボタン
function clockOut() {
  const key = getTodayKey();
  const time = getNowTime();

  let day = days.find(d => d.date === key);
  if (!day) {
    day = { date: key, start: null, end: time };
    days.push(day);
  } else {
    day.end = time;
  }

  save();
  render();
}

// 保存
function save() {
  localStorage.setItem("yokosen_days", JSON.stringify(days));
}

// 描画
function render() {
  const ul = document.getElementById("dayList");
  ul.innerHTML = "";

  // 日付の新しい順に並べたい場合はここでソートしてもOK
  const sorted = [...days].sort((a, b) => (a.date > b.date ? -1 : 1));

  sorted.forEach(day => {
    const li = document.createElement("li");
    li.className = "day-row";

    // 日付
    const dateSpan = document.createElement("div");
    dateSpan.className = "date";
    dateSpan.textContent = formatDisplayDate(day.date);
    li.appendChild(dateSpan);

    // 出勤〜線〜退勤
    const timeRow = document.createElement("div");
    timeRow.className = "time-row";

    const startSpan = document.createElement("span");
    if (day.start) {
      startSpan.className = "start";
      startSpan.textContent = day.start;
    } else {
      startSpan.className = "empty";
      startSpan.textContent = "（出勤なし）";
    }

    const lineSpan = document.createElement("span");
    lineSpan.className = "line";

    const endSpan = document.createElement("span");
    if (day.end) {
      endSpan.className = "end";
      endSpan.textContent = day.end;
    } else {
      endSpan.className = "empty";
      endSpan.textContent = "（退勤なし）";
    }

    timeRow.appendChild(startSpan);
    timeRow.appendChild(lineSpan);
    timeRow.appendChild(endSpan);
    li.appendChild(timeRow);

    // 編集・削除ボタン
    const actionRow = document.createElement("div");
    actionRow.className = "action-row";

    const editBtn = document.createElement("button");
    editBtn.className = "edit";
    editBtn.textContent = "編集";
    editBtn.onclick = () => editDay(day.date);

    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete";
    deleteBtn.textContent = "削除";
    deleteBtn.onclick = () => deleteDay(day.date);

    actionRow.appendChild(editBtn);
    actionRow.appendChild(deleteBtn);
    li.appendChild(actionRow);

    ul.appendChild(li);
  });
}

// 編集
function editDay(dateKey) {
  const day = days.find(d => d.date === dateKey);
  if (!day) return;

  // 日付編集（YYYY-MM-DD）
  const newDate = prompt("日付を入力（例: 2026-07-16）", day.date);
  if (newDate === null) return;

  // 出勤時刻編集
  const newStart = prompt("出勤時刻を入力（例: 09:12）", day.start || "");
  if (newStart === null) return;

  // 退勤時刻編集
  const newEnd = prompt("退勤時刻を入力（例: 18:44）", day.end || "");
  if (newEnd === null) return;

  // 更新
  day.date = newDate || day.date;
  day.start = newStart || null;
  day.end = newEnd || null;

  save();
  render();
}

// 削除
function deleteDay(dateKey) {
  if (!confirm("この日の打刻を削除しますか？")) return;
  days = days.filter(d => d.date !== dateKey);
  save();
  render();
}
