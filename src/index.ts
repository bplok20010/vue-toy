import Observable from "./Observable";
import Vue from "./Vue";

const data = Observable(
	{
		idx: 1,
		name: "test",
		info: {
			age: 18,
		},
	},
	{
		fullName: function () {
			return this.name + this.info.age;
		},
	}
);

// data.$watch("info.age", (a, b) => console.log("age changed:", a));
// data.$watch("name", (a, b) => console.log("name changed:", a));

data.$watch(
	function () {
		console.log("trigger c");
		if (this.idx % 3) {
			return this.name;
		} else {
			return this.info.age;
		}
	},
	(a, b) => console.log("trigger changed:", a)
);

data.$watch("fullName", (a, b) => console.log("fullName changed:", a));

// console.log(data.fullName, "fullName");

// data.name = "hello";
// data.info.age = 20;
// data.info.age = 21;
// data.info.age = 22;
// data.idx = 3;
// data.name = "hello2";
// data.idx = 6;
// data.name = "vvvs";

const vue = new Vue({
	data: {
		counter: 1,
		age: 10,
		name: "vue",
		desc: "test",
	},
	computed: {
		fullName() {
			return `${this.name}(${this.desc}:${this.counter % 10})`;
		},
	},
	methods: {
		count() {
			this.counter++;

			if (this.counter % 12 === 0) {
				this.age++;
			}
		},
	},
	render() {
		return `render: ${this.counter}|${this.fullName}|${this.age}`;
	},
});

setInterval(() => {
	vue.count();
}, 1000);
