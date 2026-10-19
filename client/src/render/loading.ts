export interface LoadingState {
  percent?: number;
  completed?: number;
  total?: number;
  label?: string;
  error?: string;
}

export function drawLoadingScreen(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  {
    percent = 0,
    completed = 0,
    total = 0,
    label = "Ready to load",
    error = "",
  }: LoadingState = {},
): void {
  ctx.save();
  ctx.clearRect(0, 0, width, height);

  // Темно-фіолетовий фон екрана завантаження
  ctx.fillStyle = "#0b0612";
  ctx.fillRect(0, 0, width, height);

  const barWidth = Math.min(560, width * 0.68);
  const barHeight = 18;
  const x = (width - barWidth) / 2;
  const y = height * 0.55;

  // Заголовок гри
  ctx.textAlign = "center";
  ctx.fillStyle = "#ffffff";
  ctx.font = "700 26px system-ui";
  ctx.fillText("BLACK LAGOON", width / 2, y - 82);

  // Статус завантаження
  ctx.fillStyle = "#00ff66";
  ctx.font = "14px system-ui";
  ctx.fillText(label, width / 2, y - 44);

  // 1. Подкладка шкали
  ctx.fillStyle = "rgba(168, 85, 247, 0.12)";
  ctx.fillRect(x, y, barWidth, barHeight);

  // 2. Зелене заповнення смуги завантаження
  ctx.fillStyle = "#00ff66";
  ctx.fillRect(x, y, barWidth * Math.max(0, Math.min(1, percent)), barHeight);

  // 3. Зелена рамка шкали
  ctx.strokeStyle = "rgba(0, 255, 102, 0.6)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(x, y, barWidth, barHeight);

  // Текст відсотків та кількості елементів
  ctx.fillStyle = "#a7f3d0";
  ctx.font = "13px ui-monospace, monospace";
  ctx.fillText(
    `${Math.round(percent * 100)}% · ${completed}/${total}`,
    width / 2,
    y + 47,
  );

  // Відображення помилки (якщо є)
  if (error) {
    ctx.fillStyle = "#ff5577";
    ctx.font = "13px system-ui";
    ctx.fillText(error.slice(0, 92), width / 2, y + 82);
  }
  ctx.restore();
}
