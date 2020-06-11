import Observable from "./Observable";
import Watch from "./Watch";
import debounce from "lodash/debounce";

interface Options {
	// TODO:
	// el: HTMLElement;
	data: any;
	methods?: any;
	computed?: any;
	render: () => any;
}

export default class Vue {
	$options: Options;
	$children: any;
	$data: any;
	[x: string]: any;

	constructor(options: Options) {
		this.$options = options;

		this.$data = Observable({ ...options.methods, ...options.data }, options.computed || null);

		if (options.data) {
			Object.keys({
				...options.methods,
				...options.computed,
				...options.data,
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
		}

		new Watch(
			this.$data,
			() => {
				// strict mode
				// with (this.$data) {
				return options.render.call(this);
				// }
			},
			debounce((children) => {
				this.$children = children;
				this.render();
			})
		);

		// Init
		this.$children = options.render.call(this.$data);
		this.render();
	}

	render() {
		console.log(this.$children);
	}
}
