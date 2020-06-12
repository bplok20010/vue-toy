import React from "react";
import shallowequal from "shallowequal";
import pick from "lodash/pick";
import debounce from "lodash/debounce";
import Observable from "./Observable";
import Watch from "./Watch";

export interface ComponentOptions {
	// el?: HTMLElement;
	props?: string[];
	data?: () => Record<string, any>;
	methods?: Record<string, (e: Event) => void>;
	computed?: Record<string, () => any>;
	watch?: Record<string, (newValue: any, oldValue: any) => any>;
	render: (h: typeof React.createElement) => React.ReactNode;
	mounted?: () => void;
	updated?: () => void;
	destroyed?: () => void;
}

export default (options: ComponentOptions) => {
	return class VueComponent extends React.Component {
		$children: React.ReactNode;
		$data: Record<string, any>;
		[x: string]: any;

		constructor(props: {}) {
			super(props);

			this.updateProps();

			const data = options.data ? options.data.call(this) : {};

			let computed: any = null;
			if (options.computed) {
				computed = {};
				Object.keys(options.computed).forEach((name) => {
					computed[name] = options.computed![name];
				});
			}

			this.$data = Observable({ ...options.methods, ...data }, computed);

			if (options.watch) {
				Object.keys(options.watch).forEach((key) => {
					this.$watch(key, options.watch![key]);
				});
			}

			Object.keys({
				...options.methods,
				...options.computed,
				...data,
			}).forEach((key) => {
				Object.defineProperty(this, key, {
					get() {
						return this.$data[key];
					},
					set(v: any) {
						this.$data[key] = v;
					},
				});
			});

			new Watch(
				this.$data,
				() => {
					// strict mode
					// with (this.$data) {
					return options.render.call(this, React.createElement);
					// }
				},
				debounce((children) => {
					this.$children = children;
					this.forceUpdate();
				})
			);

			// Init
			this.$children = options.render.call(this, React.createElement);
		}

		updateProps(props = this.props) {
			Object.keys(pick(props, options.props || [])).forEach((key) => {
				if (key === "props") {
					console.warn("The props property will replace React.Component#props");
				}
				this[key] = props[key];
			});
		}

		$watch(exp: string | (() => any), watchFn: (newValue: any, oldValue: any) => void) {
			return this.$data.$watch(exp, watchFn.bind(this));
		}

		shouldComponentUpdate(nextProps: {}) {
			if (
				!shallowequal(
					pick(this.props, options.props || []),
					pick(nextProps, options.props || [])
				)
			) {
				this.updateProps(nextProps);
				this.$children = options.render.call(this, React.createElement);
				return true;
			}
			return false;
		}

		componentDidMount() {
			options.mounted?.call(this);
		}

		componentWillUnmount() {
			options.destroyed?.call(this);
		}

		componentDidUpdate() {
			options.updated?.call(this);
		}

		render() {
			return this.$children;
		}
	};
};
