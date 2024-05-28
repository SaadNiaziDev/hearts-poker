import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { Toast, apiURL, baseURL } from '../../constants'
import { useStore } from "../../store/store";
import copy from 'copy-to-clipboard';
import moment from "moment";
import { shallow } from "zustand/shallow";

const ReferralsEarning = () => {
	const user = useStore( ( state ) => state.user );
	const token = useStore( ( state ) => state.token );
	const [ context ] = useStore( ( state ) => [ state.context ], shallow );
	const [ refData, setRefData ] = useState( [] );
	const [ referrals, setReferrals ] = useState( {
		totalWager: 0,
		totalClaimed: 0,
		totalAvailable: 0,
		claims: []
	} );

	const copyText = () => {
		copy( window.location.origin + '?referral-code=' + user?.referralCode )
		Toast.fire( {
			icon: 'info',
			text: 'Referral link copied to clipboard'
		} )
	}

	const getRefferedUsers = () => {
		fetch( apiURL + '/user/getRefferals', {
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			}
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				setRefData( res.data );
			}
		}
		)
	}

	const getRefferals = () => {
		fetch( apiURL + '/referral/', {
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			}
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				setReferrals( res.data );
				// console.log( res.data );
			}
		}
		)
	}

	const claimReferral = ( id ) => {
		fetch( apiURL + '/referral/claim', {
			headers: {
				'Authorization': 'Bearer ' + token,
				'Content-Type': 'application/json'
			},
			method: 'POST',
			body: JSON.stringify( {
				id: id
			} )
		} ).then( ( res ) => res.json() ).then( ( res ) => {
			if ( res.status === 200 ) {
				context();
				getRefferals();
			}
		}
		)
	}

	useEffect( () => {
		getRefferedUsers()
		getRefferals();
	}, [] )

	return <div className="referrals-page">

		<div className="fs-26 text-white d-flex align-items-center gap-2 text-uppercase">
			<span class="iconify" data-icon="tabler:affiliate"></span>
			Referrals
		</div>

		<div className="reffer-tabs mt-4">
			<Tabs
				defaultActiveKey="referrals"
				id="uncontrolled-tab-example"
				className="mb-3"
			>
				<Tab eventKey="referrals" title="Referrals">
					<div className="code-box">
						<div className="row w-100 justify-content-center">
							<div className="col-lg-8">
								<label className="fs-14 text-grey text-uppercase mb-2">
									referral link
								</label>
								<div className="code-input position-relative">
									<input type="text" placeholder="Set referral code..." value={window.location.origin + '?referral-code=' + user?.referralCode} readOnly />
									<button onClick={() => copyText()} className="register-btn" >Copy</button>
								</div>
							</div>
						</div>
					</div>
					<div className="row mt-3">
						<div className="col-lg-4 mb-md-0 mb-4">
							<div className="code-box">
								<div className="fs-18 text-white mb-2">
									${referrals?.totalWager}
								</div>
								<div className="fs-14 text-grey text-uppercase">
									Total Wagered
								</div>
							</div>
						</div>
						<div className="col-lg-4 mb-md-0 mb-4">
							<div className="code-box">
								<div className="fs-18 text-white mb-2">
									${referrals?.totalClaimed}
								</div>
								<div className="fs-14 text-grey text-uppercase">
									Total Claimed
								</div>
							</div>
						</div>
						<div className="col-lg-4">
							<div className="code-box">
								<div className="fs-18 text-white mb-2">
									${referrals?.totalAvailable}
								</div>
								<div className="fs-14 text-grey text-uppercase">
									Total Available
								</div>
							</div>
						</div>
					</div>

					<div className="code-table mt-5">
						<div class="table-responsive">
							<table class="table text-white">
								{referrals?.claims?.length > 0 && <>
									<thead>
										<tr>
											<th>User</th>
											<th>Wagered</th>
											<th>%</th>
											<th>Amount</th>
											<th>CLaim</th>
										</tr>
									</thead>
									<tbody>
										{referrals?.claims?.map( ( item, i ) => {
											return ( <tr key={i}>
												<td>
													<div className="box first">
														{item?.username || 'User'}
													</div>
												</td>
												<td>
													<div className="box">
														${item?.wager}
													</div>
												</td>
												<td>
													<div className="box">
														10
													</div>
												</td>
												<td>
													<div className="box">
														${item?.amount}
													</div>
												</td>
												<td>
													<div className="box">
														<button className="claim-btn" onClick={() => claimReferral( item?._id )}>Claim</button>
													</div>
												</td>

											</tr> )
										} )}
									</tbody>
								</>}
								{referrals?.claims?.length == 0 && <>
									<div className="code-box">
										<div className="text-center w-100">
											No Claims Yet!
										</div>
									</div>
								</>}
							</table>
						</div>
					</div>
					<div className="table-footer">
						<div className="fs-16 text-grey">
							If you're a content creator, make sure to check out our <span className="text-yellow">
								Partnership Program
							</span>.
						</div>
					</div>
				</Tab>
				<Tab eventKey="reffer-users" title="Referred users">
					<div className="code-table mt-5">
						<div class="table-responsive">
							<table class="table text-white">
								<thead>
									<tr>
										<th>username</th>
										<th>balance</th>
										<th>signup type</th>
										<th>signup date</th>
									</tr>
								</thead>
								<tbody>
									{refData.map( ( item ) => {
										return (
											<tr>
												<td>
													<div className="box first">
														{item.username}
													</div>
												</td>
												<td>
													<div className="box">
														{item.balance}
													</div>
												</td>
												<td>
													<div className="box text-uppercase">
														{item.signUpType}
													</div>
												</td>
												<td>
													<div className="box text-uppercase">
														{moment( item.createdAt ).format( 'DD.MM.YYYY' )}
													</div>
												</td>
											</tr>
										)
									} )}
								</tbody>
							</table>
						</div>
					</div>
					<div className="table-footer">
						<div className="fs-16 text-grey">
							If you're a content creator, make sure to check out our <span className="text-yellow">
								Partnership Program
							</span>.
						</div>
					</div>
				</Tab>
			</Tabs>
		</div>

	</div >;
};

export default ReferralsEarning;
