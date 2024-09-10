import { API } from "sveltekit-api";

export default new API(import.meta.glob("./**/*.ts"), {
	openapi: "3.0.0",
	info: {
		title: "Simple Post API",
		version: "1.0.0",
		description: "An example API etsss",
	},
});