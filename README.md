# vue-toy

```
npm install --save vue-toy
```

2-300行代码模拟vue实现。

[![Edit vibrant-williamson-66cdi](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vibrant-williamson-66cdi?fontsize=14&hidenavigation=1&theme=dark)


## Vue(options)
```ts
interface Options {
    el: HTMLElement;
	propsData?: Record<string, any>;
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
```

示例：
```
import Vue from "vue-toy";

new Vue({
  el: document.getElementById("root"),
  data() {
    return {
      msg: "hello vue toy"
    };
  },
  render(h) {
    return h("h1", null, this.msg);
  }
});

```

`注`：vue-toy的视图渲染使用的`react`，所以render方法的使用同`react#render`，如：
```
import Vue from "vue-toy";
import React from "react";

new Vue({
  el: document.getElementById("root"),
  data() {
    return {
      msg: "hello vue toy"
    };
  },
  render() {
    return <h1>{this.msg}</h1>
  }
});
```

## 全局 API

### Vue.component(ComponentOptions)
```ts
interface ComponentOptions {
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
```

示例：
```js
const Hello = Vue.component({
    props: ["msg"],
    render(h){
        return h('div', null, this.msg);
    }
});
```

