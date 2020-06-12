import React from "react";
import Vue from "../src/Vue";
import Hello from "./Hello";

const vue = new Vue({
	el: document.getElementById("demo"),
	render() {
		return (
			<h2>
				counter: {this.counter}
				<Hello msg={"vue toy " + this.counter} />
			</h2>
		);
	},
	data: () => {
		return {
			counter: 1,
		};
	},
	mounted() {
		setInterval(() => this.counter++, 1000);
	},
});

console.log(vue);
