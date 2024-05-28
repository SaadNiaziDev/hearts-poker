import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import { Toast, apiURL } from "../constants";

const initialState = {
	user: null,
	token: null,
	table: null,
	price: {
		wbnb: {
			usd: 0,
		},
		weth: {
			usd: 0,
		},
	},
};

export const useStore = create(
	persist(
		(set, get) => ({
			...initialState,
			setUser: (payload) => set(() => ({ user: payload })),
			setToken: (payload) => set(() => ({ token: payload })),
			context: async () => {
				let _token = get().token;
				let response = await fetch(apiURL + "/user/context", {
					headers: {
						Authorization: "Bearer " + _token,
					},
				})
					.then((res) => res.json())
					.then((res) => res.data);

				set({ user: response });
			},
			setTable: (payload) => set(() => ({ table: payload })),
			getTable: async (payload) => {
				let _token = get().token;
				let response = await fetch(apiURL + "/game/context", {
					method: "POST",
					body: JSON.stringify({
						id: payload,
					}),
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + _token,
					},
				})
					.then((res) => res.json())
					.then((res) => res.data);

				set({ table: response });
			},
			getPrice: async () => {
				fetch("https://api.coingecko.com/api/v3/simple/price?ids=weth%2Cwbnb&vs_currencies=usd", {
					headers: {
						"Content-Type": "application/json",
					},
				})
					.then((res) => res.json())
					.then((data) => {
						set({ price: data });
					});
			},
			getGeneralChat: async () => {
				let _token = get().token;
				let data = await fetch(apiURL + "/chats/general", {
					headers: {
						"Content-Type": "application/json",
						Authorization: "Bearer " + _token,
					},
				})
					.then((response) => response.json())
					.then((response) => response.data.messages)
					.catch((e) => e);
				return data;
			},
			reset: async () => {
				await fetch(apiURL + "/user/logout", {
					headers: {
						"Content-Type": "application/json",
					},
				})
					.then((res) => res.json())
					.then((res) => {
						if (res.status !== 200) {
							Toast.fire({
								icon: "error",
								text: "Something went wrong!",
							});
						} else {
							localStorage.clear();
							set({
								user: null,
								token: null,
								table: null,
								price: {
									wbnb: {
										usd: 0,
									},
									weth: {
										usd: 0,
									},
								},
							});
						}
					});
			},
		}),
		{
			name: "heart-poker",
			storage: createJSONStorage(() => localStorage),
		}
	)
);
