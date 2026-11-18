// Utility functions

export function escapeHtml(str: string): string {
  return String(str || '')
    .replace(/&/g, '&')
    .replace(/</g, '<')
    .replace(/>/g, '>')
    .replace(/"/g, '"')
    .replace(/'/g, '&#039;');
}

export function formatDate(dateString: string | null | undefined): string {
  if (!dateString) return '—';
  try {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  } catch {
    return dateString;
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function getStatusStyle(status: string): { badge: string; dot: string; label: string } {
  const styles: Record<string, { badge: string; dot: string; label: string }> = {
    completed: {
      badge: 'text-success border-success/30 bg-successSoft',
      dot: 'bg-success',
      label: 'Completed',
    },
    'in-progress': {
      badge: 'text-amber border-amber/30 bg-amberSoft',
      dot: 'bg-amber',
      label: 'In Progress',
    },
    planned: {
      badge: 'text-textDim border-border bg-elevated',
      dot: 'bg-border',
      label: 'Planned',
    },
    new: {
      badge: 'text-accent border-accent/30 bg-accentSoft',
      dot: 'bg-accent',
      label: 'New',
    },
    triaged: {
      badge: 'text-purple border-purple/30 bg-purpleSoft',
      dot: 'bg-purple',
      label: 'Triaged',
    },
    closed: {
      badge: 'text-textDim border-border bg-elevated',
      dot: 'bg-border',
      label: 'Closed',
    },
    open: {
      badge: 'text-danger border-danger/30 bg-dangerSoft',
      dot: 'bg-danger',
      label: 'Open',
    },
    investigating: {
      badge: 'text-amber border-amber/30 bg-amberSoft',
      dot: 'bg-amber',
      label: 'Investigating',
    },
    resolved: {
      badge: 'text-success border-success/30 bg-successSoft',
      dot: 'bg-success',
      label: 'Resolved',
    },
    rejected: {
      badge: 'text-textDim border-border bg-elevated',
      dot: 'bg-border',
      label: 'Rejected',
    },
  };

  return styles[status] || styles.planned;
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

export function copyToClipboard(text: string): Promise<void> {
  // Check if we're in browser environment
  if (typeof window === 'undefined' || typeof document === 'undefined') {
    return Promise.reject(new Error('copyToClipboard only works in browser'));
  }

  if (navigator.clipboard && window.isSecureContext) {
    return navigator.clipboard.writeText(text);
  }
  // Fallback for non-secure contexts
  const textarea = document.createElement('textarea');
  textarea.value = text;
  textarea.style.position = 'fixed';
  textarea.style.opacity = '0';
  document.body.appendChild(textarea);
  textarea.select();
  try {
    document.execCommand('copy');
    return Promise.resolve();
  } catch (err) {
    return Promise.reject(err);
  } finally {
    document.body.removeChild(textarea);
  }
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

export function classNames(...classes: (string | boolean | undefined | null)[]): string {
  return classes.filter(Boolean).join(' ');
}