import isObject from "lodash/isObject";
import shallowequal from "shallowequal";
import Watch, { CurrentWatchDep } from "./Watch";
import Notify from "./Notify";

type Data = Record<string, any>;
type Computed = Record<string, (this: Data) => void>;

const arrayMethods = ["push", "pop", "shift", "unshift", "splice", "sort", "reverse", "concat"];

function hasOwnProperty(target: {}, key: string): boolean {
	const hasOwn = Object.prototype.hasOwnProperty;
	return hasOwn.call(target, key);
}

export default function Observable(
	data: Data,
	computed: Computed | null = null,
	isRoot: boolean = true
) {
	const protoListener: Record<string, Notify> = Object.create(null);
	// 递归监控所有属性
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
			if (key === "__is_ob__") return true;

			if (isRoot && key === "$watch") {
				return (
					exp: string | (() => any),
					watchFn: (n: any, o: any) => void
				): (() => void) => {
					const watcher = new Watch(proxy, exp, watchFn);
					return () => {
						watcher.clearDeps();
					};
				};
			}

			let value = target[key];
			if (
				hasOwnProperty(target, key) &&
				(isObject(value) || Array.isArray(value)) &&
				!value["__is_ob__"]
			) {
				value = target[key] = Observable(value, null, false);
			}

			const isComputed =
				computed &&
				!hasOwnProperty(target, key) &&
				hasOwnProperty(computed, key) &&
				computed[key];

			if (CurrentWatchDep.current && !isComputed) {
				const watcher = CurrentWatchDep.current;
				protoListener[key] =
					protoListener[key] && protoListener[key] instanceof Notify
						? protoListener[key]
						: new Notify();
				watcher.addDep(protoListener[key]);
			}

			if (Array.isArray(target) && arrayMethods.indexOf(key) !== -1) {
				return (...args: any[]) => {
					const ret = target[key].apply(target, args);
					protoListener[key] && protoListener[key].pub();
					return ret;
				};
			}

			return isComputed ? computed![key].call(proxy) : value;
		},
		set: function (target: Data, key: string, value: any) {
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
