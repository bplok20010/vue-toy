import React from "react";
import Vue from "../src/Vue";
export default Vue.component({
	props: ["msg"],
	data: () => ({
		counter: 0,
	}),
	computed: {
		name: () => {
			console.log(this);
			return this.counter + "x";
		},
	},
	render() {
		return (
			<p>
				hello {this.msg} --- {this.counter}
				<div>{this.name}</div>
			</p>
		);
	},
	updated() {
		console.log("hello update");
	},
	mounted() {
		setInterval(() => this.counter++, 100);
	},
});
