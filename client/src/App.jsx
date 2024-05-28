import { useEffect, useState } from "react";
import { Outlet, Route, Router, Routes, useLocation, Navigate, useNavigate } from "react-router-dom";

import "./App.css";
import Layout from "./components/layout";
import Affiliate from "./pages/Affiliate";
import Categories from "./pages/Categories";

import Home from "./pages/Home";
import PokerTable from "./pages/Poker-Table/Table";
import ReferralsEarning from "./pages/Referrals-Earning";
import Profile from "./pages/Profile";
import Balances from "./pages/Balances";
import Deposits from "./pages/Deposits";
import Withdrawals from "./pages/Withdrawals";
import Settings from "./pages/Settings";
import { useStore } from "./store/store";
import { shallow } from "zustand/shallow";
import ResetPassword from "./pages/ResetPassword";
import VerifyEmail from "./pages/VerifyEmail";
import Admin from "./pages/Admin/Home";
import AdminDeposits from "./pages/Admin/Deposits";
import AdminWithdrawals from "./pages/Admin/Withdrawals";
import List from "./pages/Poker-Table/List";


function App() {
	// const location = useLocation();
	const user = useStore( ( state ) => state.user )
	const [ context ] = useStore(
		( state ) => [ state.context ],
		shallow
	);
	useEffect( () => {
		context();
	}, [] )
	return (
		<>
			<Routes>
				<Route path="/" element={<Layout />}>
					<Route path="/admin" element={<Admin />} />
					{user?.role == 'admin' && <>
						<Route path="/" element={<Admin />} />
						<Route path="/admin" element={<Admin />} />
						<Route path="/admin/deposits" element={<AdminDeposits />} />
						<Route path="/admin/withdrawals" element={<AdminWithdrawals />} />
					</>}
					{user?.role == 'user' && <>
						<Route path="affiliate" element={<Affiliate />} />
						<Route path="referrals-earning" element={<ReferralsEarning />} />
						<Route path="categories" element={<Categories />} />
						<Route path="poker-table" element={<List />} />
						<Route path="poker-table/:id" element={<PokerTable />} />
						<Route path="profile" element={<Profile />} />
						<Route path="balances" element={<Balances />} />
						<Route path="deposits" element={<Deposits />} />
						<Route path="withdrawals" element={<Withdrawals />} />
						<Route path="settings" element={<Settings />} />
					</>}
					<Route path="/" element={<Home />} />
					{!user && <Route path="*" element={<Navigate to='/' />} />}
					<Route path="reset/:id/:token" element={<ResetPassword />} />
					<Route path="verify/:id/:token" element={<VerifyEmail />} />

				</Route>

			</Routes>
		</>
	);
}

export default App;
