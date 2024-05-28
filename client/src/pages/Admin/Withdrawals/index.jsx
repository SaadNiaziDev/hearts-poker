import React, { useContext, useEffect, useState } from 'react'
import { useStore } from '../../../store/store';
import { Toast, apiURL } from '../../../constants';
import { useAccount, useConnect, useNetwork, useSendTransaction, useSwitchNetwork } from 'wagmi';
import { parseEther } from 'ethers/lib/utils.js';
import { FidgetSpinner } from 'react-loader-spinner'
import { SocketContext } from '../../../socket';

const Withdrawls = () => {
	const socket = useContext( SocketContext );
	const price = useStore( ( state ) => state.price );
	const user = useStore( ( state ) => state.user );
	const token = useStore( ( state ) => state.token );
	const { switchNetwork } = useSwitchNetwork()
	const { chain } = useNetwork()
	const { address, isConnected } = useAccount()
	const { connectAsync, connectors } = useConnect()
	const [ loading, setLoading ] = useState( false );
	const [ filter, setFilter ] = useState( [] );
	const [ filterToken, setFilterToken ] = useState( 'ALL' );

	const { sendTransactionAsync: transfer, reset } = useSendTransaction( {
		chainId: chain?.id,
		mode: 'recklesslyUnprepared',
	} );

	const [ data, setData ] = useState( [] )
	const getWithdrawals = () => {
		fetch( apiURL + '/transaction/getWithdrawals', {
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

	const approveRequest = async ( item ) => {
		setLoading( true );
		try {
			if ( !isConnected ) {
				await connectAsync( { connector: connectors[ 0 ] } );
				switchNetwork( item?.token === 'eth' ? 5 : 97 )
				let tx = await transfer( {
					recklesslySetUnpreparedRequest: {
						to: item?.address,
						value: parseEther( `${item?.amount}` ),
					}
				} );
				await tx.wait();
				console.log( tx )
				item.hash = tx.hash;
			} else {
				switchNetwork( item?.token === 'eth' ? 5 : 97 )
				let tx = await transfer( {
					recklesslySetUnpreparedRequest: {
						to: item?.address,
						value: parseEther( `${item?.amount}` ),
					}
				} );
				await tx.wait();
				console.log( tx )
				item.hash = tx.hash;
			}
			//need to call API to backend to hanlde request if everything went well
			await handleWithdrawal( item, 'approved' )
		} catch ( error ) {
			console.log( error )
			Toast.fire( {
				icon: 'error',
				text: "Failed to handle transaction"
			} )
			setLoading( false )
		} finally {
			reset();
		}
	}

	const handleWithdrawal = ( item, status ) => {
		fetch( apiURL + '/transaction/handle-withdrawal', {
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			},
			method: 'POST',
			body: JSON.stringify( {
				id: item._id,
				status: status,
				hash: item?.hash
			} )
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				Toast.fire( {
					icon: 'success',
					text: 'Record updated successfully'
				} )
				// console.log( "request successful" )
				setLoading( false )
				getWithdrawals()
			} else {
				Toast.fire( {
					icon: 'error',
					text: 'Something went wrong!'
				} )
				// console.log( "request failed" )
				setLoading( false )

			}
		} )
	}


	useEffect( () => {
		getWithdrawals();
		socket.on( 'withdrawal-request-maded', () => {
			getWithdrawals();
		} );
		socket.on( `withdrawal-request-handled-for-user`, () => {
			getWithdrawals();
		} );
		return () => {
			socket.off( 'withdrawal-request-maded' );
			socket.off( 'withdrawal-request-handled-for-user' );

		}
	}, [] )
	return (
		<div>
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
			<div className="code-table">
				<div class="table-responsive">
					<table class="table text-white">
						<thead>
							{/* style={{ width: "350px" }} */}
							<tr>
								<th>Crypto</th>
								<th>Requester</th>
								<th>Amount in Crypto</th>
								<th>Amount in Hearttokens</th>
								<th>Coin</th>
								<th>Status</th>
								<th></th>
							</tr>
						</thead>
						<tbody>
							{filter.map( ( item, index ) => {
								return <tr>
									<td>
										<div className="box first">
											<img src={`/assets/images/${item.token}.png`} height="20px" alt="" />
										</div>
									</td>
									<td>
										<div className="box">
											<div className='text-end'>
												{item?.address || '0x0000000000000000000000000000000000000000'}
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-end text-uppercase">
												{item?.amount?.toFixed( 4 )}
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-end text-uppercase">
												{item?.heartTokenPaid}
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-end text-uppercase">
												{item?.token}
											</div>
										</div>
									</td>
									<td>
										<div className="box">
											<div className="text-end text-uppercase">
												{item?.status}
											</div>
										</div>
									</td>
									{item.status == 'pending' && <>
										<td>
											<div className="box last">
												<button className="claim-btn" disabled={loading} onClick={() => approveRequest( item )}>Approve</button>
											</div>
										</td>
										<td>
											<div className="box last">
												<button className="claim-btn bg-danger" disabled={loading} onClick={() => handleWithdrawal( item, 'rejected' )}>Reject</button>
											</div>
										</td>
									</>}
									{item?.status !== 'pending' && <>
										<td>
											<div className="box last">&nbsp;
											</div>
										</td>
										<td>
											<div className="box last">&nbsp;
											</div>
										</td>
									</>}
								</tr>
							} )}




							{data.length == 0 && <div className="d-flex text-center">
								<div className="no-entries">
									No Entries
								</div>

							</div>}
						</tbody>
					</table>
				</div>
			</div>
			<div className="d-flex justify-content-center align-items-center">
				<FidgetSpinner
					visible={loading}
					height="140"
					width="140"
					ariaLabel="dna-loading"
					wrapperClass="dna-wrapper"
					ballColors={[ 'green', 'green', 'green' ]}
					backgroundColor="rgb(101 175 81)"
				/>
			</div>
		</div>
	)
}

export default Withdrawls