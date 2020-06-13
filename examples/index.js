import React from "react";
import Vue from "../src/Vue";
import DemoGrid from "./DemoGrid";
import "./style.css";

const vue = new Vue({
	el: document.getElementById("demo"),
	render() {
		return (
			<>
				<form id="search">
					Search{" "}
					<input
						name="query"
						value={this.searchQuery}
						onChange={(e) => (this.searchQuery = e.target.value)}
					/>
				</form>
				<DemoGrid
					heroes={this.gridData}
					columns={this.gridColumns}
					filterKey={this.searchQuery}
				/>
			</>
		);
	},
	data: () => {
		return {
			searchQuery: "",
			gridColumns: ["name", "power"],
			gridData: [
				{ name: "Chuck Norris", power: Infinity },
				{ name: "Bruce Lee", power: 9000 },
				{ name: "Jackie Chan", power: 7000 },
				{ name: "Jet Li", power: 8000 },
			],
		};
	},
});

console.log(vue);
