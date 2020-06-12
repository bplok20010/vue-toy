import React from "react";
import Vue from "../src/Vue";
export default Vue.component({
	props: ["msg"],
	data: () => ({
		counter2: 0,
		clickCounter: 1,
	}),
	computed: {
		name() {
			return this.counter2 + "x";
		},
	},
	watch: {
		clickCounter: function () {
			console.log("watch clickCounter changed");
		},
	},
	methods: {
		handleClick() {
			console.log(this, "a");
			this.clickCounter++;
		},
	},
	render() {
		return (
			<>
				<button onClick={this.handleClick}>click： {this.clickCounter}</button>
				<p>
					hello {this.msg} --- {this.counter2}
					<div>{this.name}</div>
				</p>
			</>
		);
	},
	updated() {
		//console.log("hello update");
	},
	mounted() {
		setInterval(() => this.counter2++, 100);
	},
});
