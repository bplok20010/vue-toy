import isObject from "lodash/isObject";
import shallowequal from "shallowequal";
import Watch from "./Watch";
import Notify from "./Notify";

type Data = Record<string, any>;
type Computed = Record<string, (this: Data) => void>;

const arrayMethods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "concat"];

export default function Observable(
	data: Data,
	computed: Computed | null,
	notify: Notify = new Notify(),
	isRoot: boolean = true
) {
	// 递归监控所有属性
	if (Array.isArray(data)) {
		data.forEach((value, i) => {
			if (isObject(value) || Array.isArray(value)) {
				data[i] = Observable(value, null, notify, false);
			}
		});
	} else if (isObject(data)) {
		Object.keys(data).forEach((key) => {
			const value = data[key];
			if (isObject(value) || Array.isArray(value)) {
				data[key] = Observable(value, null, notify, false);
			}
		});
	}

	if (computed) {
		Object.keys(computed).forEach((key) => {
			if (key in data) {
				console.warn(`The computed property "${key}" is already defined in data.`);
			}
		});
	}

	const handler = {
		get: (target: Data, key: string) => {
			if (isRoot && key === "$watch") {
				return (path: any, watchFn: any): (() => void) => {
					const watcher = new Watch(target, path, watchFn);
					return notify.sub(() => {
						watcher.check();
					});
				};
			}

			if (Array.isArray(target) && arrayMethods.indexOf(key) !== -1) {
				return (...args: any[]) => {
					//TODO: 新增元素重新监控
					const ret = target[key].apply(target, args);
					notify.pub();
					return ret;
				};
			}

			return target[key];
		},
		set: function (target: Data, key: string, value: any) {
			//TODO: 新增元素重新监控
			const oldValue = target[key];
			target[key] = value;
			if (!shallowequal(oldValue, value)) {
				notify.pub();
			}
			return true;
		},
	};

	return new Proxy(data, handler);
}
