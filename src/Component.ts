import React from "react";
import ReactDOM from "react-dom";
import shallowequal from "shallowequal";
import pick from "lodash/pick";
import debounce from "lodash/debounce";
import Observable from "./Observable";
import Watch from "./Watch";

export interface ComponentOptions {
	props?: string[];
	name?: string;
	data?: () => Record<string, any>;
	methods?: Record<string, (e: Event) => void>;
	computed?: Record<string, () => any>;
	watch?: Record<string, (newValue: any, oldValue: any) => any>;
	render: (h: typeof React.createElement) => React.ReactNode;
	renderError?: (h: typeof React.createElement, error: Error) => React.ReactNode;
	mounted?: () => void;
	updated?: () => void;
	destroyed?: () => void;
	errorCaptured?: (e: Error, vm: React.ReactInstance) => void;
}

export default (options: ComponentOptions) => {
	return class extends React.Component<{ $el?: HTMLElement }> {
		static displayName = options.name;

		$children: React.ReactNode;
		$data: Record<string, any>;
		[x: string]: any;
		$watcher: Watch;

		constructor(props: {}) {
			super(props);

			if (options.errorCaptured || options.renderError) {
				this.componentDidCatch = (error: Error) => {
					options.errorCaptured?.(error, this);
					if (options.renderError) {
						this.$children = options.renderError.call(this, React.createElement, error);
						this.forceUpdate();
					}
				};
			}

			const propsData = Object.create(null);
			(options.props || []).forEach((key) => {
				propsData[key] = undefined;
			});

			const data = options.data ? options.data.call(this.props) : {};

			let computed: any = null;
			if (options.computed) {
				computed = Object.create(null);
				Object.keys(options.computed).forEach((name) => {
					computed[name] = options.computed![name];
				});
			}

			//绑定methods的this
			const methods = Object.create(null);
			if (options.methods) {
				Object.keys(options.methods).forEach((key) => {
					methods[key] = options.methods![key].bind(this);
				});
			}

			this.$data = Observable({ ...propsData, ...methods, ...data }, computed);

			if (options.watch) {
				Object.keys(options.watch).forEach((key) => {
					this.$watch(key, options.watch![key]);
				});
			}

			Object.keys({
				...propsData,
				...methods,
				...computed,
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

			this.updateProps();

			this.$watcher = new Watch(
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
			this.children = props.children;
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
			this.$watcher.clearDeps();
			options.destroyed?.call(this);
		}

		componentDidUpdate() {
			options.updated?.call(this);
		}

		render() {
			return this.$children;
		}

		$forceUpdate() {
			this.forceUpdate();
		}

		$nextTick(cb?: () => void) {
			this.forceUpdate(cb);
		}

		$destroy() {
			if (this.props.$el) {
				ReactDOM.unmountComponentAtNode(this.props.$el);
				this.$children = null;
			}
		}
	};
};
