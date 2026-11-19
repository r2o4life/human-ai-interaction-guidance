// Anti-pattern fixture seeding destructive autonomy, unbounded streaming,
// involuntary scroll jumps, accordion search jumps, and cascade alarm floods.

export function attachAntiPatterns(deleteBtn, searchInput, matchDetails, toastPanel) {
  deleteBtn.addEventListener('click', () => {
    bulkDelete({ scope: 'workspace-all' });
    toastPanel.textContent = 'Deleted records.';
    toastPanel.scrollIntoView({ behavior: 'smooth' });
  });

  searchInput.addEventListener('input', () => {
    matchDetails.open = true;
  });
}

export async function readUnboundedStream(response, outEl) {
  const reader = response.body.getReader();
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    outEl.textContent += new TextDecoder().decode(value);
  }
}

export function broadcastAllAlerts(alerts, toast) {
  alerts.forEach((alert) => {
    toast.error(alert.message);
  });
}
