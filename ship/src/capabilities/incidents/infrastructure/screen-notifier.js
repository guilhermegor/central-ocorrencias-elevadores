export class ScreenNotifier {
  constructor(publish) {
    this.publish = publish;
  }
  success(message) {
    this.publish({
      kind: 'success',
      message,
    });
  }
  error(message) {
    this.publish({
      kind: 'error',
      message,
    });
  }
  warning(message) {
    this.publish({
      kind: 'warning',
      message,
    });
  }
  info(message) {
    this.publish({
      kind: 'info',
      message,
    });
  }
  dismiss() {
    this.publish(null);
  }
}
