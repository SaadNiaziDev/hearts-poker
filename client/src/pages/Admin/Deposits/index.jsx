import React, { useContext, useEffect, useState } from 'react'
import { Toast, apiURL } from '../../../constants'
import { useStore } from '../../../store/store';
import { SocketContext } from '../../../socket';


const Deposits = () => {
    const socket = useContext( SocketContext );
    const token = useStore( ( state ) => state.token );
    const [ records, setRecords ] = useState( [] )
    const [ filter, setFilter ] = useState( [] );
    const [ filterToken, setFilterToken ] = useState( 'ALL' );
    const getRecords = () => {
        fetch( apiURL + '/transaction/getDeposits', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        } ).then( ( res ) => res.json() ).then( ( res ) => {
            if ( res.status === 200 ) {
                setRecords( res.data )
                setFilter( res.data )
            } else {
                console.log( "Failed to fetch records" )
            }
        } )
    }

    const handleRequest = ( item, status ) => {
        fetch( 'https://api.coingecko.com/api/v3/simple/price?ids=weth%2Cwbnb&vs_currencies=usd', {
            headers: {
                'Content-Type': 'application/json'
            }
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            fetch( apiURL + '/transaction/handle-request', {
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + token,
                },
                method: 'POST',
                body: JSON.stringify( {
                    id: item._id,
                    price: item.token == 'eth' ? data.weth.usd : data.wbnb.usd,
                    status: status,
                } )
            } ).then( ( res ) => res.json() ).then( ( res ) => {
                if ( res.status === 200 ) {
                    Toast.fire( {
                        icon: 'success',
                        text: 'Record updated successfully'
                    } )
                    // console.log( "request successful" )
                    getRecords();
                } else {
                    Toast.fire( {
                        icon: 'error',
                        text: 'Something went wrong!'
                    } )
                    // console.log( "request failed" )
                }
            } )
        } )
    }



    useEffect( () => {
        getRecords();
        socket.on( 'deposit-request-maded', () => {
            getRecords();
        } );
        socket.on( `deposit-request-handled-for-user`, () => {
            getRecords();
        } );
        return () => {
            socket.off( 'deposit-request-maded' );
            socket.off( 'deposit-request-handled-for-user' );

        }
    }, [] )
    return (
        <div>
            <div className="d-flex align-items-center gap-3 flex-wrap mb-4">
                <a href="javascript:void(0)" className={`deposits-tabs ${filterToken === 'ALL' ? 'active' : ''}`} onClick={() => {
                    setFilterToken( 'ALL' );
                    setFilter( records )
                }}>
                    ALL
                </a>
                <a href="javascript:void(0)" className={`deposits-tabs ${filterToken === 'ETH' ? 'active' : ''}`} onClick={() => {

                    setFilterToken( 'ETH' );
                    setFilter( records.filter( ( item ) => item.token === 'eth' ) )
                }}>
                    ETH
                </a>
                <a href="javascript:void(0)" className={`deposits-tabs ${filterToken === 'BNB' ? 'active' : ''}`} onClick={() => {
                    setFilterToken( 'BNB' );
                    setFilter( records.filter( ( item ) => item.token === 'bnb' ) )
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
                                <th >Crypto</th>
                                <th>Sender Address</th>
                                <th>Amount</th>
                                <th>TX Hash</th>
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
                                            {item?.address || '0x0000000000000000000000000000000000000000'}
                                        </div>
                                    </td>
                                    <td className='text-center'>
                                        <div className="box">
                                            {( item?.amount / 10 ** 18 || 0 )}
                                        </div>
                                    </td>
                                    <td>
                                        <div className="box">
                                            <div className="text-end">
                                                <a href={item?.token === 'eth' ? `https://goerli.etherscan.io/tx/${item?.txhash}` : `https://testnet.bscscan.com/tx/${item?.txhash}`} target='_blank' className="copy-btn">open</a>
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
                                    {item?.status === 'pending' && <>
                                        <td>
                                            <div className="box last">
                                                <button className="claim-btn" onClick={() => handleRequest( item, 'approved' )}>Approve</button>
                                            </div>
                                        </td>
                                        <td>
                                            <div className="box last">
                                                <button className="claim-btn bg-danger" onClick={() => handleRequest( item, 'rejected' )}>Reject</button>
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




                            {records.length == 0 && <div className="d-flex text-center">
                                <div className="no-entries">
                                    No Entries
                                </div>

                            </div>}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}

export default Deposits