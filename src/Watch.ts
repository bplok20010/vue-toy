import objGet from "lodash/get";
import shallowequal from "shallowequal";
import Notify from "./Notify";

export let CurrentWatchDep: { current: null | Watch } = {
	current: null,
};

export default class Watch {
	last: any;
	exp: () => any;
	watchFn: (newValue: any, oldValue: any) => void;
	deps: any[] = [];
	constructor(data: any, path: any, fn: (newValue: any, oldValue: any) => void) {
		this.watchFn = fn;

		this.exp =
			typeof path === "string"
				? function () {
						return objGet(data, path);
				  }
				: () => path.call(data);

		const lastWatchDep = CurrentWatchDep.current;
		CurrentWatchDep.current = this;
		this.last = this.exp();
		CurrentWatchDep.current = lastWatchDep;
	}

	clearDeps() {
		this.deps.forEach((cb) => cb());
		this.deps = [];
	}

	addDep(notify: Notify) {
		this.deps.push(
			notify.sub(() => {
				this.check();
			})
		);
	}

	check() {
		this.clearDeps();
		const lastWatchDep = CurrentWatchDep.current;
		CurrentWatchDep.current = this;
		const newValue = this.exp();
		CurrentWatchDep.current = lastWatchDep;
		const oldValue = this.last;
		if (!shallowequal(oldValue, newValue)) {
			this.last = newValue;
			this.watchFn(newValue, oldValue);
		}
	}
}
