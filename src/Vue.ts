import React, { Attributes } from "react";
import ReactDOM from "react-dom";
import Observable from "./Observable";
import Watch from "./Watch";
import Component, { ComponentOptions } from "./Component";

export * from "./Component";

export interface Options extends ComponentOptions {
	el: HTMLElement | string;
	propsData?: Record<string, any>;
}

export default function Vue(options: Options) {
	const RootComponent = Component(options);
	let el: any = options.el;
	if (typeof el === "string") {
		el = document.querySelector(el);
	}

	const props = {
		...options.propsData,
		$el: el,
	};

	return ReactDOM.render(React.createElement(RootComponent, props as Attributes), el);
}

Vue.component = Component;
Vue.observable = Observable;
Vue.watch = function (
	expFn: () => any,
	watchFn: (newValue: any, oldValue: any) => void,
	scope: any = null
): () => void {
	const watcher = new Watch(scope, expFn, watchFn);

	return () => watcher.clearDeps();
};
