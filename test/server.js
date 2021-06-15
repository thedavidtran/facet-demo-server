// test/server.js

const expect = require("chai").expect;
const axios = require("axios");
const base_url = "http://localhost:8080/api";
const http = axios.create({
	baseURL: base_url,
	headers: {
		"Content-type": "application/json"
	}
});

describe("Record API", () => {
	let id;
	describe("Create tests", () => {
		it("valid record is created", async () => {
			const response = await http.post(`${base_url}/records`, {
					name: "TestBoat",
					type: "asset",
					balance: 100
				}),
				data = response.data,
				{name, type, balance} = data;
			id = data.id
			expect(response.status).to.equal(200);
			expect(name).to.equal("TestBoat");
			expect(type).to.equal("asset");
			expect(balance).to.equal(100);
		});
		it("record is missing required field", async () => {
			try {
				await http.post(`${base_url}/records`, {
					name: "Boat",
					balance: 100
				});
			} catch (err) {
				expect(err.response.status).to.equal(500);
			}
		});
		it("record contains invalid type", async () => {
			try {
				await http.post(`${base_url}/records`, {
					name: "TestCar",
					type: "Invalid",
					balance: 400
				});
			} catch (err) {
				expect(err.response.status).to.equal(500);
			}
		});
		it("record contains invalid balance value", async () => {
			try {
				await http.post(`${base_url}/records`, {
					name: "TestCar",
					type: "liability",
					balance: "number"
				});
			} catch (err) {
				expect(err.response.status).to.equal(500);
			}
		});
	});
	describe("Read tests", () => {
		it("record that exists, created earlier during create", async () => {
			const response = await http.get(`${base_url}/records/${id}`);
			const data = response.data;
			const {name, type, balance} = data;
			expect(response.status).to.equal(200);
			expect(name).to.equal("TestBoat");
			expect(type).to.equal("asset");
			expect(balance).to.equal(100);
		});
		it("record where id invalid format", async () => {
			try {
				await http.get(`${base_url}/records/000000000000zzz`);
			} catch (err) {
				expect(err.response.status).to.equal(400);
			}
		});
		it("record where id doesn't match record", async () => {
			try {
				await http.get(`${base_url}/records/000000000000000000000000`);
			} catch (err) {
				expect(err.response.status).to.equal(404);
			}
		});
		it("read list of records", async () => {
			const response = await http.get(`${base_url}/records`);
			expect(response.status).to.equal(200);
		});
	});
	describe("Update tests", () => {
		it("record that exists, update record name", async () => {
			let response = await http.put(`${base_url}/records/${id}`, {
				name: "TestBoatUpdated"
			});
			expect(response.status).to.equal(200);
			response = await http.get(`${base_url}/records/${id}`);
			const {name, type, balance} = response.data;
			expect(name).to.equal("TestBoatUpdated");
			expect(type).to.equal("asset");
			expect(balance).to.equal(100);
		});
		it("record that exists, update all values", async () => {
			let response = await http.put(`${base_url}/records/${id}`, {
				name: "TestBoatUpdated2",
				type: "liability",
				balance: 1111111111.42
			});
			expect(response.status).to.equal(200);
			response = await http.get(`${base_url}/records/${id}`);
			const {name, type, balance} = response.data;
			expect(name).to.equal("TestBoatUpdated2");
			expect(type).to.equal("liability");
			expect(balance).to.equal(1111111111.42);
		});
		it("record that exists, update balance to number with more than 2 decimals", async () => {
			let response = await http.put(`${base_url}/records/${id}`, {
				balance: 1111111111.9999999999999999999993
			});
			expect(response.status).to.equal(200);
			response = await http.get(`${base_url}/records/${id}`);
			const {balance} = response.data;
			expect(balance).to.equal(1111111112); // gets rounded during persistance
		});
		it("record where id doesn't match record", async () => {
			try {
				await http.put(`${base_url}/records/000000000000000000000000`, {
					name: "TestValidButNoExist",
					type: "asset",
					balance: -599.99
				});
			} catch (err) {
				expect(err.response.status).to.equal(404);
			}
		});
	});
	describe("Delete tests", () => {
		it("record that exists", async () => {
			const response = await http.delete(`${base_url}/records/${id}`);
			expect(response.status).to.equal(200);
			try {
				await http.get(`${base_url}/records/${id}`);
			} catch (err) {
				expect(err.response.status).to.equal(404);
			}
		});
		it("delete record that was previously removed", async () => {
			try {
				await http.delete(`${base_url}/records/${id}`);
			} catch (err) {
				expect(err.response.status).to.equal(404);
			}
		});
		it("delete record where id invalid format", async () => {
			try {
				await http.delete(`${base_url}/records/000000000000zzz`);
			} catch (err) {
				expect(err.response.status).to.equal(400);
			}
		});
	});

	describe("Summary API", () => {
		let net_worth, total_asset, total_liability;
		describe("Read tests", () => {
			it("read", async () => {
				let response = await http.get(`${base_url}/summary`),
					data = response.data;
				net_worth = data.net_worth;
				total_asset = data.total_asset;
				total_liability = data.total_liability;
				// Create a new negative liability
				response = await http.post(`${base_url}/records`, {
					name: "TestBoat",
					type: "liability",
					balance: -10000
				});
				data = response.data;
				total_liability += data.balance;
				net_worth = total_asset - total_liability;
				response = await http.get(`${base_url}/summary`);
				data = response.data;
				expect(data.net_worth).to.equal(net_worth);
				expect(data.total_asset).to.equal(total_asset);
				expect(data.total_liability).to.equal(total_liability);
			});
		});
	});
});