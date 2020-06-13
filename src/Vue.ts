import React, { Attributes } from "react";
import ReactDOM from "react-dom";
import Observable from "./Observable";
import Watch from "./Watch";
import Component, { ComponentOptions } from "./Component";

export * from "./Component";

export interface Options extends ComponentOptions {
	el: HTMLElement;
	propsData?: Record<string, any>;
}

export default function Vue(options: Options) {
	const RootComponent = Component(options);

	const props = {
		...options.propsData,
		$el: options.el,
	};

	return ReactDOM.render(React.createElement(RootComponent, props as Attributes), options.el);
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
