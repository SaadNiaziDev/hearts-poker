import React, { useEffect, useState } from "react";
import Modal from 'react-bootstrap/Modal';
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { NavLink, useNavigate, useSearchParams } from "react-router-dom";
import { useStore } from "../../store/store";
import { shallow } from "zustand/shallow";
import { apiURL, baseURL, Toast } from "../../constants";
import { useSignMessage, useDisconnect, useAccount, useConnect } from "wagmi";


// 'https://mainnet.infura.io/v3/f9a56eec51f44825b11cdd5f8f83d5d7';




const Header = ( { showChat, setShowChat, show, setShow, modalState, setModalState } ) => {
	const user = useStore( ( state ) => state.user );
	const [ setUser, setToken ] = useStore( ( state ) => [ state.setUser, state.setToken ], shallow );
	const _logout = useStore( ( state ) => state.reset );
	const { isConnected } = useAccount( {
		onDisconnect() {
			_logout();
		}
	} );
	const { disconnectAsync, disconnect } = useDisconnect();
	const { connectors, connectAsync, isLoading, pendingConnector } = useConnect();
	const { signMessageAsync } = useSignMessage();
	const navigate = useNavigate();
	let [ searchParams ] = useSearchParams();
	const [ isConnecting, setIsConnecting ] = useState( {
		metamask: false,
		walletConnect: false
	} );
	const [ errorMsg, setErrorMsg ] = useState( false );

	const leftSide = () => {
		if ( document.body.classList.contains( "home-ls" ) ) {
			document.body.classList.remove( "home-ls" );
		} else {
			document.body.classList.add( "home-ls" );
		}
	};

	const rightSide = () => {
		if ( document.body.classList.contains( "home-rs" ) ) {
			document.body.classList.remove( "home-rs" );
		} else {
			document.body.classList.add( "home-rs" );
		}
	};

	const handleClose = () => {
		setShow( false );

	};
	const handleShow = () => setShow( true );

	// wallet start
	const handleSignMessage = async ( user ) => {
		// console.log( user )
		let walletAddress = user.walletAddress;
		try {
			const signature = await signMessageAsync( {
				message: `Welcome to Token Society! Click “Sign” to connect your account. No password needed! This request will not trigger a blockchain transaction or cost any gas fees. I am signing my one-time nonce: ${user.nonce}`,
			} );
			return { walletAddress, signature };
		} catch ( err ) {
			throw new Error( "You need to sign the message to be able to log in." );
		}
	};

	const handleSignup = async ( walletAddress ) => {
		let signature;
		let nonce = Math.floor( Math.random() * 1000000 );
		try {
			signature = await signMessageAsync( {
				message: `Welcome to Token Society! Click “Sign” to create an account. No password needed! You will only need to sign this message once for account creation. This request will not trigger a blockchain transaction or cost any gas fees. I am signing-up using my one-time nonce: ${nonce}`,
			} );
		} catch ( err ) {
			throw new Error( "You need to sign the message to be able to Sign Up." );
		}

		return fetch( `${apiURL}/user/metamask-login`, {
			body: JSON.stringify( {
				walletAddress: walletAddress, signature: signature, nonce: nonce, referralCode: searchParams.get( 'referral-code' )
			} ),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		} )
			.then( ( response ) => response.json() )
			.then( ( response ) => response.data.result );
	};

	const handleAuthenticate = async ( user ) => {
		let walletAddress = user.walletAddress;
		let signature = user.signature;
		return fetch( `${apiURL}/wallet/auth`, {
			body: JSON.stringify( { walletAddress, signature } ),
			headers: {
				"Content-Type": "application/json",
			},
			method: "POST",
		} ).then( ( response ) => response.json() );
	};

	const walletLogin = async ( type, connection ) => {
		try {
			await disconnectAsync();
			const res = await connectAsync( connection );
			const account = res.account.toLowerCase();
			fetch( `${apiURL}/wallet?walletAddress=${account}` )
				.then( ( response ) => response.json() )
				.then( ( response ) => {
					if ( response.data.result !== null ) {
						return response.data.result
					} else {
						if ( type === 1 ) {
							throw new Error( 'Please signup first to login' );
						} else {
							return null;
						}
					}
				} )
				.then( ( user ) => ( user ? user : handleSignup( account ) ) )
				.then( ( user ) => handleSignMessage( user ) )
				.then( ( user ) => handleAuthenticate( user ) )
				.then( async ( data ) => {
					handleClose();
					setUser( data.user );
					setToken( data.token );
				} ).then( () => {
					setIsConnecting( {
						metamask: false,
						walletConnect: false
					} )
				} )
				.catch( ( err ) => {
					setErrorMsg( err.message )
					setIsConnecting( {
						metamask: false,
						walletConnect: false
					} )
				} )
		} catch ( error ) {
			setErrorMsg( error?.message )
			setIsConnecting( {
				metamask: false,
				walletConnect: false
			} )
		}
	};


	const logout = () => {
		if ( isConnected ) {
			disconnect()
		}
		_logout();
		navigate( '/' );
	}

	useEffect( () => {
		if ( searchParams.get( 'referral-code' ) ) {
			setModalState( 'register' );
			handleShow();
		}
	}, [] );


	return <div>
		<nav className="navbar navbar-expand-lg ">
			<div className="container-fluid">
				<a className="navbar-brand" href="javascript:void(0)">
					<img src="/assets/images/logo.svg" height="60px" alt="" />
				</a>
				{user?.role === 'admin' && <div className="text-white text-center d-md-none">WELCOME TO ADMIN PANEL</div>}
				<div className="d-flex d-md-none align-items-center gap-3">
					<a href="javascript:void(0)" className="fs-22 text-white" onClick={() => { leftSide() }}><span class="iconify" data-icon="uim:bars"></span></a>
					{!showChat &&
						<a href="javascript:void(0)" className="search-btn" onClick={() => { setShowChat( true ), rightSide() }} >
							<span class="iconify" data-icon="ion:chatbox"></span>
						</a>
					}

				</div>
				<div className="collapse navbar-collapse" id="navbarSupportedContent">
					{user?.role === 'admin' && <div className="text-white text-center">WELCOME TO ADMIN PANEL</div>}
					<ul className="navbar-nav ms-auto gap-4 mb-2 mb-lg-0">

						{!user && <>
							<li className="nav-item">
								<a className="nav-link" href="javascript:void(0)" onClick={() => {
									setModalState( 'login' );
									setErrorMsg();
									handleShow();
								}} >
									Login
								</a>
							</li>
							<li className="nav-item">
								<a className="register-btn" href="javascript:void(0)" onClick={() => {
									setModalState( 'register' );
									setErrorMsg();
									handleShow();
								}}>Register</a>
							</li>
						</>}
						{user && <>
							{user.role === 'user' && <li>
								<a className="nav-link" href="javascript:void(0)">Balance: {user?.balance?.toFixed( 2 ) || 0.0}</a>
							</li>}
							{user.role === 'user' && <li className="nav-item">
								{/* <a href="javascript:void(0)" className="account-btn gap-2">
								<img src="/assets/images/norank.png" height="30px" alt="" />
								{user?.username?.toUpperCase() || "Anonymous"}
							</a> */}
								<div class="dropdown user-dropdown">
									<button class="account-btn dropdown-toggle" type="button" data-bs-toggle="dropdown" aria-expanded="false">
										<img src="/assets/images/norank.png" height="30px" alt="" />
										{user?.walletAddress.slice( 0, 5 ) + "..." + user?.walletAddress.slice( -5 )}
									</button>
									<ul class="dropdown-menu">
										<div className="fs-14 text-grey mb-2">
											{user?.walletAddress.slice( 0, 5 ) + "..." + user?.walletAddress.slice( -5 )}
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
										{user.role === "admin" && <>
											<li>
												<NavLink to="/admin/deposits" className="side-links" >
													<span className="side-ic">
														<span class="iconify" data-icon="fa6-solid:coins"></span>

													</span>
													<span>Deposits</span>
												</NavLink>
											</li>
											<li>
												<NavLink to="/admin/withdrawals" className="side-links">
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
							</li>
							}
						</>}

						<li className="nav-item">
							<a href="javascript:void(0)" className="search-btn">
								<span class="iconify" data-icon="ion:search-sharp"></span>
							</a>
						</li>
						{!showChat && <li className="nav-item">
							<a href="javascript:void(0)" className="search-btn" onClick={() => setShowChat( true )}>
								<span class="iconify" data-icon="ion:chatbox"></span>
							</a>
						</li>}

					</ul>
				</div>
			</div>
		</nav>
		<Modal show={show} className="login-modal" size="lg" centered onHide={handleClose}>
			<Modal.Body>
				<a href="javascript:void(0)" className="close-modal" onClick={handleClose}>
					<span class="iconify" data-icon="radix-icons:cross-2"></span>
				</a>
				<div className="row">
					<div className="col-lg-6 pb-4">

						<div className="reffer-tabs login-tabs mt-4 pe-md-0 pe-4">
							<Tabs
								defaultActiveKey={modalState}
								id="uncontrolled-tab-example"
								className="mb-3"
							>
								<Tab eventKey="login" title="Login">

									<div className="d-flex flex-column align-items-center justify-content-center gap-3 flex-wrap">

										<button className="continue-btn wallet-btn  py-3 gap-2 w-100" disabled={isConnecting.metamask} onClick={() => {
											setIsConnecting( { ...isConnecting, metamask: true } );
											walletLogin( 1, {
												connector: connectors[ 0 ],
												chain: 1
											} )
										}}>

											<div className="d-flex flex-column">
												<span className="ic fs-72 line-1 mb-3"><span class="iconify" data-icon="logos:metamask-icon"></span></span>
												<div className="custom-spinner">
													<span className="fs-20">Metamask {isConnecting.metamask &&
														<div class="spinner-border" role="status">
														</div>}</span>
												</div>
											</div>

										</button>
										<button className="continue-btn py-3 wallet-btn gap-2 w-100 " disabled={isConnecting.walletConnect} onClick={() => {
											setIsConnecting( { ...isConnecting, walletConnect: true } );
											walletLogin( 1, {
												connector: connectors[ 1 ],
												chain: 1
											} )
										}}>
											<div className="d-flex flex-column">
												<img src="/assets/images/wallet-connect.svg" className="mb-3" height={65} alt="" />
												<div className="custom-spinner">
													<span className="fs-20">WalletConnect {isConnecting.walletConnect &&
														<div class="spinner-border" role="status">
														</div>}</span>
												</div>
											</div>
										</button>
									</div>
									{errorMsg !== "" && <div className="text-center text-danger">{errorMsg}</div>}
									<div class="fs-14 fw-400 mt-4 text-center text-grey">
										By accessing the site, I attest that I am at least 18 years old and have read the <a class="fs-16 fw-500 text-grey" href="javascript:void(0)">Terms &amp; Conditions.</a></div>
								</Tab>
								<Tab eventKey="register" title="Register">

									<div className="d-flex align-items-center justify-content-center gap-3 flex-wrap">
										<button className="continue-btn wallet-btn  py-3 gap-2 w-100" disabled={isConnecting.metamask} onClick={() => {
											setIsConnecting( { ...isConnecting, metamask: true } );
											walletLogin( 0, {
												connector: connectors[ 0 ],
												chain: 1
											} )
										}
										}>

											<div className="d-flex flex-column">
												<span className="ic fs-72 line-1 mb-3"><span class="iconify" data-icon="logos:metamask-icon"></span></span>
												<div className="custom-spinner">
													<span className="fs-20">Metamask {isConnecting.metamask &&
														<div class="spinner-border" role="status">
														</div>}</span>
												</div>
											</div>

										</button>
										<button className="continue-btn py-3 wallet-btn gap-2 w-100 " disabled={isConnecting.walletConnect} onClick={() => {
											setIsConnecting( { ...isConnecting, walletConnect: true } );
											walletLogin( 0, {
												connector: connectors[ 1 ],
												chain: 1
											} )
										}}>
											<div className="d-flex flex-column">
												<img src="/assets/images/wallet-connect.svg" className="mb-3" height={65} alt="" />
												<div className="custom-spinner">
													<span className="fs-20">WalletConnect {isConnecting.walletConnect &&
														<div class="spinner-border" role="status">
														</div>}</span>
												</div>
											</div>



										</button>
									</div>
									{errorMsg !== "" && <div className="text-center text-danger">{errorMsg}</div>}
									<div class="fs-14 fw-400 mt-4 text-center text-grey">
										By accessing the site, I attest that I am at least 18 years old and have read the <a class="fs-16 fw-500 text-grey" href="javascript:void(0)">Terms &amp; Conditions.</a></div>
								</Tab>

							</Tabs>
						</div>
					</div>
					<div className="col-lg-6 d-md-block d-none">
						<div className="modal-bg">
							<div className="logo mt-4">
								<img src="/assets/images/logo.svg" height="50px" alt="" />
							</div>

						</div>
					</div>
				</div>
			</Modal.Body>
		</Modal>
	</div>;
};

export default Header;
