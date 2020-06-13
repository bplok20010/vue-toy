import objGet from "lodash/get";
import shallowequal from "shallowequal";
import Notify from "./Notify";

export let CurrentWatchDep: { current: null | Watch } = {
	current: null,
};

export default class Watch {
	last: any;
	_exp: any;
	exp: () => any;
	watchFn: (newValue: any, oldValue: any) => void;
	deps: any[] = [];
	constructor(data: any, exp: any, fn: (newValue: any, oldValue: any) => void) {
		this.watchFn = fn;

		this._exp = exp;

		this.exp =
			typeof exp === "string"
				? function () {
						return objGet(data, exp);
				  }
				: () => {
						return exp.call(data);
				  };

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
		if (!notify.sub) console.log(notify, typeof notify, this._exp.toString());
		this.deps.push(
			notify.sub(() => {
				this.check();
			})
		);
	}

	check() {
		// 清空所有依赖，重新计算
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
