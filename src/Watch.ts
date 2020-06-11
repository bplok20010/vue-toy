import objGet from "lodash/get";
import shallowequal from "shallowequal";

export default class Watch {
	last: any;
	exp: () => any;
	watchFn: (newValue: any, oldValue: any) => void;
	constructor(data: any, path: any, fn: (newValue: any, oldValue: any) => void) {
		this.watchFn = fn;

		this.exp =
			typeof path === "string"
				? function () {
						return objGet(data, path);
				  }
				: () => path.call(data);

		this.last = this.exp();
	}
	check() {
		const newValue = this.exp();
		const oldValue = this.last;
		if (!shallowequal(oldValue, newValue)) {
			this.last = newValue;
			this.watchFn(newValue, oldValue);
		}
	}
}
