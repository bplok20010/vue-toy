import Observable from "./Observable";

const data = Observable({
	name: "test",
	info: {
		age: 18,
	},
});

data.$watch("info.age", (a, b) => console.log("age changed:", a));
data.$watch("name", (a, b) => console.log("name changed:", a));

console.log(data.info.$watch, "data.info.$watch");
console.log(data.info.$watch, "data.info.$watch");

data.name = "hello";
data.info.age = 20;
