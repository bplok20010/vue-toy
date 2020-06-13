import React from "react";
import classnames from "classnames";
import Vue from "../src/Vue";

function capitalize(str) {
	return str.charAt(0).toUpperCase() + str.slice(1);
}

const DemoGrid = Vue.component({
	props: ["heroes", "columns", "filterKey"],
	data: function () {
		var sortOrders = {};
		this.columns.forEach(function (key) {
			sortOrders[key] = 1;
		});
		return {
			sortKey: "",
			sortOrders: sortOrders,
		};
	},
	computed: {
		filteredHeroes: function () {
			var sortKey = this.sortKey;
			var filterKey = this.filterKey && this.filterKey.toLowerCase();
			var order = this.sortOrders[sortKey] || 1;
			var heroes = this.heroes;
			if (filterKey) {
				heroes = heroes.filter(function (row) {
					return Object.keys(row).some(function (key) {
						return String(row[key]).toLowerCase().indexOf(filterKey) > -1;
					});
				});
			}
			if (sortKey) {
				heroes = heroes.slice().sort(function (a, b) {
					a = a[sortKey];
					b = b[sortKey];
					return (a === b ? 0 : a > b ? 1 : -1) * order;
				});
			}
			return heroes;
		},
	},
	methods: {
		sortBy: function (key) {
			this.sortKey = key;
			this.sortOrders[key] = this.sortOrders[key] * -1;
		},
	},
	render() {
		console.log(this.filteredHeroes);
		return (
			<table>
				<thead>
					<tr>
						{this.columns.map((key) => (
							<th
								onClick={() => this.sortBy(key)}
								className={classnames({
									active: this.sortKey == key,
								})}
							>
								{capitalize(key)}
								<span
									className={classnames({
										arrow: true,
										asc: this.sortOrders[key] > 0,
										dsc: this.sortOrders[key] <= 0,
									})}
								></span>
							</th>
						))}
					</tr>
				</thead>
				<tbody>
					{this.filteredHeroes.map((entry, index) => (
						<tr key={index}>
							{this.columns.map((key) => (
								<td key={key}>{entry[key]}</td>
							))}
						</tr>
					))}
				</tbody>
			</table>
		);
	},
});

export default DemoGrid;
