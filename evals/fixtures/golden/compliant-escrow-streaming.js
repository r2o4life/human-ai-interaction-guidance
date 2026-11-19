// Golden HAII-compliant runtime script: AutonomyEscrowGate, LegalHold 409 check,
// AbortController stream stop, Choice 1A popover receipts, Choice 2B floating matches,
// and ANSI/ISA-18.2 cascade alarm rationalization.

export class AutonomyEscrowGate {
  constructor({ holdSeconds = 900 } = {}) {
    this.holdSeconds = holdSeconds;
    this.legalHoldActive = false;
  }

  stageDeletion(targetId) {
    if (this.legalHoldActive) {
      return { status: 409, code: 'LEGAL_HOLD_ACTIVE', reversible: false };
    }
    return { status: 202, targetId, rollbackAvailableForSeconds: this.holdSeconds };
  }
}

export function wireCompliantControls({ searchInput, matchPopover, receiptPopover, jumpLink }) {
  searchInput.addEventListener('input', () => {
    if (searchInput.value.trim()) {
      matchPopover.showPopover?.();
    } else {
      matchPopover.hidePopover?.();
    }
  });

  jumpLink.addEventListener('click', (event) => {
    event.preventDefault();
    const explicitJumpTarget = document.getElementById('workspace');
    explicitJumpTarget?.scrollIntoView({ behavior: 'smooth' });
  });

  return () => receiptPopover.showPopover?.();
}

export async function readCadencedStream(url, onToken, stopButton) {
  const abortController = new AbortController();
  stopButton.addEventListener('click', () => abortController.abort(), { once: true });

  const response = await fetch(url, { signal: abortController.signal });
  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    onToken(decoder.decode(value, { stream: true }));
  }
}

export function rationalizeCascadeAlerts(alerts) {
  const groupedByRootCause = new Map();
  for (const alert of alerts) {
    const rootCause = alert.rootCause || alert.id;
    if (!groupedByRootCause.has(rootCause)) {
      groupedByRootCause.set(rootCause, { rootCause, count: 0, primary: alert });
    }
    groupedByRootCause.get(rootCause).count += 1;
  }
  return [...groupedByRootCause.values()].slice(0, 3);
}
