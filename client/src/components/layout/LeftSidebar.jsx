import React, { useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useStore } from "../../store/store";
import { useAccount, useDisconnect } from "wagmi";


const LeftSidebar = ( { show, setShow, setModalState } ) => {
	const homeNav = () => {
		if ( document.body.classList.contains( "home-ls" ) ) {
			document.body.classList.remove( "home-ls" );
		} else {
			document.body.classList.add( "home-ls" );
		}
	};

	const { isConnected } = useAccount();
	const { disconnect } = useDisconnect();
	const user = useStore( ( state ) => state.user );
	const _logout = useStore( ( state ) => state.reset );
	const navigate = useNavigate();

	const logout = async () => {
		if ( isConnected ) {
			disconnect()
		}
		await _logout();
		navigate( '/' );
	}

	useEffect( () => { }, [] )

	return <div className="left-sidebar">
		<div className="text-end d-md-none d-block">
			<a href="javascript:void(0)" className="fs-22 text-white" onClick={() => { homeNav() }}><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
		</div>
		<ul className="sidebar-items">
			{user && user.role === 'user' && <li className="nav-item d-md-none d-block">
				<div className="d-flex justify-content-between align-items-center">
					<div class="dropdown user-dropdown">
						<button class="account-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
							<img src="/assets/images/norank.png" height="30px" alt="" />
							Account
						</button>
						<ul class="dropdown-menu">
							<div className="fs-14 text-grey mb-2">
								Hello,
								{user?.username?.toUpperCase() || "Anonymous"}
							</div>
							{user?.role === 'user' && <>
								<li><NavLink to="/profile" className="side-links" >
									<span className="side-ic">
										<span class="iconify" data-icon="material-symbols:person"></span>

									</span>
									<span>Profile</span>
								</NavLink></li>
								<li>
									<NavLink to="/balances" className="side-links">
										<span className="side-ic">
											<span class="iconify" data-icon="healthicons:money-bag"></span>

										</span>
										<span>Balances</span>
									</NavLink>
								</li>
								<li>
									<NavLink to="/deposits" className="side-links" >
										<span className="side-ic">
											<span class="iconify" data-icon="fa6-solid:coins"></span>

										</span>
										<span>Deposits</span>
									</NavLink>
								</li>
								<li>
									<NavLink to="/withdrawals" className="side-links">
										<span className="side-ic">
											<span class="iconify" data-icon="fa6-solid:coins"></span>

										</span>
										<span>Withdrawals</span>
									</NavLink>
								</li>
							</>}
							<li>
								<NavLink to="/settings" className="side-links">
									<span className="side-ic">
										<span class="iconify" data-icon="material-symbols:settings-rounded"></span>

									</span>
									<span>Settings</span>
								</NavLink>
							</li>
							<li>
								<NavLink to="javascript::void(0)" className="side-links" onClick={logout}>
									<span className="side-ic">
										<span class="iconify" data-icon="ri:logout-circle-line"></span>
									</span>
									<span>Log Out</span>
								</NavLink>
							</li>
						</ul>
					</div>
					<div className="fs-14 fw-500 text-white">
						Balance: {user?.balance?.toFixed( 2 ) || 0.0}
					</div>
				</div>
			</li>}
			<li>
				<NavLink to={user?.role !== 'admin' ? '/' : '/admin/'} className="side-links" onClick={() => { homeNav() }}>
					<span className="side-ic">
						<span class="iconify" data-icon="material-symbols:home-outline"></span>
					</span>
					<span>Home</span>
				</NavLink>
			</li>

			{user && <>
				{user?.role === 'user' && <>
					<li>
						<NavLink to="/profile" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="material-symbols:person"></span>

							</span>
							<span>Profile</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/poker-table" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="game-icons:poker-hand"></span>
							</span>
							<span>Poker Table</span>
						</NavLink>
						{/* <NavLink to="javascript:void(0)" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="game-icons:poker-hand"></span>
							</span>
							<span>Poker Table</span>
						</NavLink> */}
					</li>
					<li>
						<NavLink to="/deposits" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="fa6-solid:coins"></span>

							</span>
							<span>Deposits</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/withdrawals" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="fa6-solid:coins"></span>

							</span>
							<span>Withdrawals</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/balances" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="healthicons:money-bag"></span>

							</span>
							<span>Balances</span>
						</NavLink>
					</li>
					{/* <li>
						<NavLink to="/affiliate" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="tabler:affiliate"></span>
							</span>
							<span>Affiltaite</span>
						</NavLink>
					</li> */}
					{/* <li>
						<NavLink to="/referrals-earning" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="tabler:affiliate"></span>
							</span>
							<span>Referrals</span>
						</NavLink>
					</li> */}
				</>}

				{user.role === 'admin' && <>
					<li>
						<NavLink to="/admin/deposits" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="fa6-solid:coins"></span>

							</span>
							<span>Deposits</span>
						</NavLink>
					</li>
					<li>
						<NavLink to="/admin/withdrawals" className="side-links" onClick={() => { homeNav() }}>
							<span className="side-ic">
								<span class="iconify" data-icon="fa6-solid:coins"></span>

							</span>
							<span>Withdrawals</span>
						</NavLink>
					</li>
				</>}

				<li>
					<NavLink to="javascript::void(0)" className="side-links" onClick={() => { homeNav() }}>
						<span className="side-ic">
							<span class="iconify" data-icon="material-symbols:settings-rounded"></span>

						</span>
						<span>Settings</span>
					</NavLink>
				</li>
				<li>
					<NavLink to="javascript::void(0)" className="side-links" onClick={logout}>
						<span className="side-ic">
							<span class="iconify" data-icon="ri:logout-circle-line"></span>
						</span>
						<span>Log Out</span>
					</NavLink>
				</li>

			</>}
			{!user && <li className="d-md-none d-block">
				<div className="d-flex align-items-center gap-3">
					<a className="register-btn" href="javascript:void(0)" onClick={() => {
						homeNav()
						setModalState( 'login' );
						setShow( true );
					}} >
						Login
					</a>
					<a className="register-btn" href="javascript:void(0)" onClick={() => {
						homeNav()
						setModalState( 'register' );
						setShow( true );
					}}>Register</a>
				</div>
			</li>}


		</ul>
	</div>;
};

export default LeftSidebar;
