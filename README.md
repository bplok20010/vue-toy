# vue-toy

```
npm install --save vue-toy
```

200行左右代码模拟vue实现。

[![Edit vibrant-williamson-66cdi](https://codesandbox.io/static/img/play-codesandbox.svg)](https://codesandbox.io/s/vibrant-williamson-66cdi?fontsize=14&hidenavigation=1&theme=dark)

相关文章：[200行代码模拟vue实现](https://www.v2ex.com/t/681386)

## Vue(options)
```ts
interface Options {
    el: HTMLElement | string;
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

`注1`：`vue-toy`不包含template的编译实现，因为vue的template最终是编译成类似代码：
```
render(h) {
    with(this){
        return h("h1", null, msg);
    }
}
```
本教程中使用了严格模式无法使用`with`，所以在`render`里无法省略`this`。

`注2`：`vue-toy`的视图渲染使用的`react`，所以`render`方法的使用同`react#render`，如：
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
export default Hello;
```

## 基本原理

```js
// 创建观察对象
// 观察对象主要使用的是Object.defineProperty或Proxy来实现，
// 也可使用类似angular.js的脏检测(不过需要额外的检测调用)，
// 如果不在意写法也可以参考knockout或 setXXX getXXX的方式
const data = observable({
    name: 'vue-toy',
});

// 渲染模版
const render = function(){
    return <h1>{data.name}</h1>
}

// 计算render的依赖属性，
// 依赖属性改变时，会重新计算computedFn，并执行监控函数watchFn，
// 属性依赖计算使用栈及可以了。
// watch(computedFn, watchFn);
watch(render, function(newVNode, oldVNode){
    update(newVNode, mountNode);
});

//初始渲染
mount(render(), mountNode);

// 改变观察对象属性，如果render依赖了该属性，则会重新渲染
data.name = 'hello vue toy';
```

> 视图渲染部分(既render)使用的是vdom技术，vue2+使用`Snabbdom`库，`vue-toy`使用的是`react`来进行渲染，所以在render函数里你可以直接使用React的JSX语法,不过别忘记`import React from 'react'`，当然也可以使用`preact` `inferno` 等 vdom库。

> 由于vue的template的最终也是解析并生成render函数，模版的解析可用`htmleParser`库来生成`AST`，剩下就是解析指令并生产代码，由于工作量大，这里就不具体实现，直接使用jsx。

## Dev

```
// 运行demo
npm run demo

//构建
npm run build
```

