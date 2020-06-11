export default class Notify {
	listeners: (() => void)[] = [];

	sub(fn: () => void) {
		this.listeners.push(fn);
		return () => {
			const idx = this.listeners.indexOf(fn);
			if (idx === -1) return;

			this.listeners.splice(idx, 1);
		};
	}

	pub() {
		this.listeners.forEach((fn) => fn());
	}
}
