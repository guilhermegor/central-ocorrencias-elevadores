import type { INotifier } from '../domain/ports';

export type NoticeKind = 'success' | 'error' | 'warning' | 'info';

export interface Notice {
  kind: NoticeKind;
  message: string;
}

export class ScreenNotifier implements INotifier {
  constructor(private readonly publish: (notice: Notice | null) => void) {}

  success(message: string): void {
    this.publish({ kind: 'success', message });
  }

  error(message: string): void {
    this.publish({ kind: 'error', message });
  }

  warning(message: string): void {
    this.publish({ kind: 'warning', message });
  }

  info(message: string): void {
    this.publish({ kind: 'info', message });
  }

  dismiss(): void {
    this.publish(null);
  }
}
