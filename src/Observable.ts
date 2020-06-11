import isObject from "lodash/isObject";
import shallowequal from "shallowequal";
import Watch, { CurrentWatchDep } from "./Watch";
import Notify from "./Notify";

type Data = Record<string, any>;
type Computed = Record<string, (this: Data) => void>;

const arrayMethods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "concat"];

export default function Observable(data: Data, computed: Computed | null, isRoot: boolean = true) {
	const protoListener: Record<string, Notify> = {};
	// 递归监控所有属性
	//TODO:
	if (Array.isArray(data)) {
		data.forEach((value, i) => {
			if (isObject(value) || Array.isArray(value)) {
				data[i] = Observable(value, null, false);
			}
		});
	} else if (isObject(data)) {
		Object.keys(data).forEach((key) => {
			const value = data[key];
			if (isObject(value) || Array.isArray(value)) {
				data[key] = Observable(value, null, false);
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
		get: (target: Data, key: string, proxy: ProxyConstructor) => {
			if (isRoot && key === "$watch") {
				return (path: any, watchFn: any): (() => void) => {
					const watcher = new Watch(proxy, path, watchFn);
					return () => {
						watcher.clearDeps();
					};
				};
			}

			let value = target[key];

			const isComputed = computed && !(key in target) && key in computed && computed[key];

			if (CurrentWatchDep.current && !isComputed) {
				const watcher = CurrentWatchDep.current;
				protoListener[key] = protoListener[key] || new Notify();
				watcher.addDep(protoListener[key]);
			}

			return isComputed ? computed![key].call(proxy) : value;
		},
		set: function (target: Data, key: string, value: any) {
			//TODO: 新增元素重新监控
			const oldValue = target[key];
			target[key] = value;
			if (!shallowequal(oldValue, value) && protoListener[key]) {
				protoListener[key].pub();
			}
			return true;
		},
	};

	return new Proxy(data, handler);
}
