import React, { useContext, useEffect, useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import { Toast, apiURL } from '../../constants'
import { useStore } from '../../store/store';
import moment from 'moment';
import copy from 'copy-to-clipboard';
import { shallow } from 'zustand/shallow';
import { SocketContext } from '../../socket';


const Deposits = () => {
	const [ show, setShow ] = useState( false );
	const socket = useContext( SocketContext );
	const user = useStore( ( state ) => state.user );
	const token = useStore( ( state ) => state.token );
	const price = useStore( ( state ) => state.price );

	const [ context, getPrice ] = useStore(
		( state ) => [ state.context, state.getPrice ],
		shallow
	);
	const [ depositOptions, setDepositOptions ] = useState( "" )
	const [ address, setAddress ] = useState( "" )
	const [ amount, setAmount ] = useState();
	const [ cryptoAmount, setCryptoAmount ] = useState();
	const [ receiverAddress, setReceiverAddress ] = useState( '' );
	const [ data, setData ] = useState( [] );
	const [ filter, setFilter ] = useState( [] );
	const [ filterToken, setFilterToken ] = useState( 'ALL' );
	const handleShow = () => setShow( true );
	const handleClose = () => {
		setShow( false )
		setDepositOptions( "" )
		setReceiverAddress( "" )
		clearStates()
	};

	const getAddress = () => {
		fetch( apiURL + '/transaction/config', {
			headers: {
				'Content-Type': 'application/json'
			}
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				setAddress( res.data.address );
			}
		} )
	}

	const copyText = () => {
		copy( address )
		Toast.fire( {
			icon: 'info',
			text: 'Wallet Address copied to clipboard'
		} )
	}

	const calculateAmount = ( value, money ) => {
		let c;
		if ( value === '' ) {
			setAmount( '' )
		} else {
			c = value * money;
			setAmount( c );
		}
	}

	const calculateCrypto = ( coin, money ) => {
		if ( coin === '' ) {
			setCryptoAmount( '' )
		}
		let c = coin / money;
		setCryptoAmount( c );
	}

	const clearStates = () => {
		setAmount( '' );
		setCryptoAmount( '' )
	}

	const sendDeposit = ( mode ) => {
		fetch( apiURL + '/transaction/deposit-request', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			body: JSON.stringify( {
				address: receiverAddress,
				price: mode == 1 ? price.wbnb.usd : price.weth.usd,
				crypto: mode == 1 ? "bnb" : "eth",
			} )
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				Toast.fire( {
					icon: 'success',
					text: 'Deposit request maded successfully!'
				} )
				handleClose();
				getDeposits();
			} else {
				Swal.fire( {
					icon: 'error',
					text: res.message,
					toast: true,
					width: 500,
					position: 'top-end',
					iconColor: 'white',
					customClass: {
						popup: 'colored-toast'
					},
					showConfirmButton: false,
					timer: 5000,
					timerProgressBar: true,
				} )
			}
		} )
	}

	const getDeposits = () => {
		fetch( apiURL + '/transaction/getUserDeposits', {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				setData( res.data )
				setFilter( res.data )
			} else {
				setData( [] )
			}
		} )
	}

	useEffect( () => {
		getAddress();
		getPrice();
		getDeposits()
		socket.on( `deposit-request-handled-for-${user.id}`, () => {
			getDeposits()
			context()
		} )
		return () => {
			socket.off( `deposit-request-handled-for-${user.id}` )
		}
	}, [] );


	return (
		<div>
			<div className="d-flex align-items-center justify-content-between mb-4">

				<div className="fs-22 fw-800 text-uppercase text-white d-flex align-items-center gap-2">
					<span class="iconify" data-icon="fa6-solid:coins"></span>
					Deposits
				</div>

				<button type='button' className='register-btn' onClick={handleShow}>
					Add Deposit
				</button>
			</div>
			<div className="d-flex align-items-center gap-3 flex-wrap mb-4">
				<a href="javascript:void(0)" className={`deposits-tabs ${filterToken === 'ALL' ? 'active' : ''}`} onClick={() => {
					setFilterToken( 'ALL' );
					setFilter( data )
				}}>
					ALL
				</a>
				<a href="javascript:void(0)" className={`deposits-tabs ${filterToken === 'ETH' ? 'active' : ''}`} onClick={() => {

					setFilterToken( 'ETH' );
					setFilter( data.filter( ( item ) => item.token === 'eth' ) )
				}}>
					ETH
				</a>
				<a href="javascript:void(0)" className={`deposits-tabs ${filterToken === 'BNB' ? 'active' : ''}`} onClick={() => {
					setFilterToken( 'BNB' );
					setFilter( data.filter( ( item ) => item.token === 'bnb' ) )
				}}>
					BNB
				</a>
			</div>
			{data.length > 0 && <div className="code-table">
				<div class="table-responsive">
					<table class="table text-white">
						<thead>
							<tr>
								<th style={{ width: "350px" }}>Crypto</th>
								<th>Status</th>
								<th>Amount Deposited</th>
								<th>Price at Deposit</th>
								<th>Date</th>
								<th>HeartTokens</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{filter.map( ( item, index ) => {
								return <tr>
									<td>
										<div className="box first">
											<div className="d-flex align-items-center gap-2">
												<img src={`/assets/images/${item.token}.png`} height="20px" alt="" />
												<div>
													{item?.token === 'eth' ? 'Etheruem[ETH]' : 'Binance[BNB]'}
												</div>
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-center text-uppercase">
												{item?.status}
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-end text-uppercase">
												{item?.amount / 10 ** 18 + " " + item?.token}
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className='text-end'>
												<div className="text-green">
													${item?.priceAtRequest}
												</div>
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-end">
												{moment( item.createdAt ).format( 'DD.MM.YYYY' )}
											</div>
										</div>
									</td>

									<td>
										<div className="box">
											<div className="text-end">
												{item?.heartTokenPaid?.toFixed( 2 )}
											</div>
										</div>
									</td>
								</tr>
							} )}
						</tbody>
					</table>
				</div>
			</div>}
			{data.length == 0 && <div className="text-center">
				<div className="no-entries">
					No Entries
				</div>
			</div>}
			<Modal centered className='authentication-modal desposis-modal' show={show} onHide={handleClose}>
				<Modal.Body>
					{depositOptions === "" && <div>
						<div className="d-flex justify-content-between align-items-center mb-4">
							<div className="fs-22 text-white text-uppercase">
								Deposit Options
							</div>
							<a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
						</div>
						<div className="row">
							<div className="col-md-6">
								<div className="coins-box" onClick={() => { setDepositOptions( "bnb" ) }} >
									<img src="assets/images/bnb.png" height="60px" alt="" />
									<div className="fs-14 text-grey">
										Binance Coin (BNB)
									</div>
								</div>
							</div>
							<div className="col-md-6 mt-md-0 mt-4">
								<div className="coins-box" onClick={() => { setDepositOptions( "eth" ) }}>
									<img src="assets/images/eth.png" height="60px" alt="" />
									<div className="fs-14 text-grey">
										Ethereum Coin (ETH)
									</div>
								</div>
							</div>
						</div>

					</div>}
					{depositOptions !== "" && <div>
						{/* BNB coin content */}
						{depositOptions === "bnb" && <div>
							<div className="d-flex justify-content-between align-items-center mb-4">
								<div className="d-flex align-items-center gap-md-3 gap-2">
									<a href="javascript:void(0)" className='fs-26 text-white' onClick={() => { setDepositOptions( "" ) }}>
										<span class="iconify" data-icon="fa6-solid:angle-left"></span>
									</a>
									<div className="d-flex align-items-center gap-2">
										<img src="/assets/images/bnb.png" height="45px" className='heading-logo' alt="" />
										<div className="fs-22 text-white text-uppercase">
											Deposit BNB coin
										</div>
									</div>
								</div>
								<a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
							</div>
							<div className="deposit-box">
								<div className="row">
									<div className="col-lg-9 mb-md-0 mb-4">
										<div className="fs-14 fw-500 text-grey">
											Send the amount of BNB coin of your choice to the following address to receive the equivalent in Coins.
										</div>
										<div className="d-flex align-items-center gap-2 mb-3">
											<span className="text-yellow fs-22">
												<span class="iconify" data-icon="ic:baseline-warning"></span>
											</span>
											<div className="fs-14 text-yellow">
												Only deposit over the Binance network. Do not use ETH or other networks
											</div>
										</div>
										<div className="d-flex align-items-center gap-2 mb-3">
											<span className="text-yellow fs-22">
												<span class="iconify" data-icon="ic:baseline-warning"></span>
											</span>
											<div className="fs-14 text-yellow">
												Do NOT send NFT's to this BNB deposit address. In order to recover NFTs deposited to this address an administrative fee will be charged.
											</div>
										</div>
									</div>
									<div className="col-lg-3 mb-md-0 mb-4">
										<div className="qr-img">
											<img src="/assets/images/qr-code.png" className='w-100' alt="" />
										</div>
									</div>
								</div>
								<label className="fs-14 text-white text-uppercase mb-2">
									YOUR PERSONAL BNB DEPOSIT ADDRESS
								</label>
								<div className="code-input wallet-input position-relative">
									<input type="text" defaultValue={address || ''} placeholder={address || ''} readOnly />
									<button className="register-btn" onClick={() => copyText()}>Copy Address</button>
								</div>
							</div>
							<div className="deposit-box my-4">
								<div className="d-flex align-items-center gap-3 mb-3 flex-md-row flex-column">

									<div className="code-input coins-input position-relative w-100">
										<input type="number" value={amount} placeholder={price?.wbnb?.usd} onChange={( e ) => {
											setAmount( e.target.value );
											calculateCrypto( e.target.value, price?.wbnb?.usd )
										}} />
										<img src="/assets/images/coin.png" height="20px" className='input-coin ' alt="" />
										<div className="dollar">
											$
										</div>
									</div>
									<div className="fs-20 text-white">
										=
									</div>

									<div className="code-input coins-input position-relative w-100">
										<input type="number" value={cryptoAmount} placeholder={1} onChange={( e ) => {
											setCryptoAmount( e.target.value );
											calculateAmount( e.target.value, price?.wbnb?.usd );
										}} />
										<img src="/assets/images/bnb.png" height="20px" className='input-coin' alt="" />
									</div>
								</div>
								<div className="fs-12 text-grey text-center">
									The value of BNB may change between now and the time we receive your payment
								</div>
							</div>
							<div className="deposit-box">
								<label className="fs-14 text-white text-uppercase mb-2">
									Place your wallet address
								</label>
								<div className="code-input wallet-input position-relative">
									<input type="text" value={receiverAddress} onChange={( e ) => setReceiverAddress( e.target.value )} />
									<button className="register-btn" disabled={receiverAddress.length !== 42} onClick={() => sendDeposit( 1 )}>Request Deposit</button>
								</div>
							</div>
						</div>}

						{/* ethereum coin content */}
						{depositOptions === "eth" && <div>
							<div className="d-flex justify-content-between align-items-center mb-4">
								<div className="d-flex align-items-center gap-3">
									<a href="javascript:void(0)" className='fs-26 text-white' onClick={() => { setDepositOptions( "" ) }}>
										<span class="iconify" data-icon="fa6-solid:angle-left"></span>
									</a>
									<div className="d-flex align-items-center gap-2">
										<img src="/assets/images/eth.png" height="45px" className='heading-logo' alt="" />
										<div className="fs-22 text-white text-uppercase">
											Deposit Ethereum coin
										</div>
									</div>
								</div>
								<a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
							</div>
							<div className="deposit-box">
								<div className="row">
									<div className="col-lg-9">
										<div className="fs-14 fw-500 text-grey mb-md-0 mb-3">
											Send the amount of Ethereum of your choice to the following address to receive the equivalent in Coins.
										</div>
										<div className="d-flex align-items-center gap-2 mb-3">
											<span className="text-yellow fs-22">
												<span class="iconify" data-icon="ic:baseline-warning"></span>
											</span>
											<div className="fs-14 text-yellow">
												Only deposit over the Ethereum network. Do not use BNB or BSC networks
											</div>
										</div>
										<div className="d-flex align-items-center gap-2 mb-3">
											<span className="text-yellow fs-22">
												<span class="iconify" data-icon="ic:baseline-warning"></span>
											</span>
											<div className="fs-14 text-yellow">
												Do NOT send NFT's to this ETH deposit address. In order to recover NFTs deposited to this address an administrative fee will be charged.
											</div>
										</div>
									</div>
									<div className="col-lg-3 mb-md-0 mb-4">
										<div className="qr-img">
											<img src="/assets/images/qr-code.png" className='w-100' alt="" />
										</div>
									</div>
								</div>
								<label className="fs-14 text-white text-uppercase mb-2">
									YOUR PERSONAL ETH DEPOSIT ADDRESS
								</label>
								<div className="code-input wallet-input position-relative">
									<input type="text" defaultValue={address || ''} placeholder={address || ''} readOnly />
									<button className="register-btn" onClick={() => copyText()}>Copy Address</button>
								</div>
							</div>
							<div className="deposit-box my-4">
								<div className="d-flex align-items-center flex-md-row flex-column gap-3 mb-3" >

									<div className="code-input coins-input position-relative w-100">
										<input type="number" value={amount} placeholder={price?.weth?.usd} onChange={( e ) => {
											setAmount( e.target.value );
											calculateCrypto( e.target.value, price?.weth?.usd )
										}} />
										<img src="/assets/images/coin.png" height="20px" className='input-coin' alt="" />
										<div className="dollar">
											$
										</div>
									</div>
									<div className="fs-20 text-white">
										=
									</div>

									<div className="code-input coins-input position-relative w-100">
										<input type="number" value={cryptoAmount} placeholder={1} onChange={( e ) => {
											setCryptoAmount( e.target.value );
											calculateAmount( e.target.value, price?.weth?.usd );
										}} />
										<img src="/assets/images/eth.png" height="20px" className='input-coin' alt="" />
									</div>
								</div>
								<div className="fs-12 text-grey text-center">
									The value of ETH may change between now and the time we receive your payment
								</div>
							</div>
							<div className="deposit-box">
								<label className="fs-14 text-white text-uppercase mb-2">
									Place your wallet address
								</label>
								<div className="code-input wallet-input  position-relative">
									<input type="text" value={receiverAddress} onChange={( e ) => setReceiverAddress( e.target.value )} />
									<button className="register-btn" disabled={receiverAddress.length !== 42}
										onClick={() => sendDeposit( 2 )
										}>Request Deposit</button>
								</div>
							</div>

						</div>}
					</div>}
				</Modal.Body>
			</Modal>
		</div>
	)
}

export default Deposits