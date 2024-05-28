import React, { useEffect, useContext, useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import { useStore } from '../../store/store';
import { Toast, apiURL } from '../../constants';
import { shallow } from 'zustand/shallow';
import moment from 'moment';
import { SocketContext } from '../../socket';

const Withdrawals = () => {
  const socket = useContext( SocketContext );
  const [ context, getPrice ] = useStore(
    ( state ) => [ state.context, state.getPrice ],
    shallow
  );
  const [ show, setShow ] = useState( false );
  const [ depositOptions, setDepositOptions ] = useState( "" )
  const [ amount, setAmount ] = useState();
  const [ cryptoAmount, setCryptoAmount ] = useState();
  const [ address, setAddress ] = useState( '' );
  const [ data, setData ] = useState( [] );
  const [ filter, setFilter ] = useState( [] );
  const [ filterToken, setFilterToken ] = useState( 'ALL' );
  const handleClose = () => {
    setShow( false )
    setDepositOptions( "" )
    clearStates()
  };
  const handleShow = () => setShow( true );
  const price = useStore( ( state ) => state.price );
  const user = useStore( ( state ) => state.user );
  const token = useStore( ( state ) => state.token );



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
    setAddress( '' )
  }

  const requestWithdrawal = ( coin ) => {
    fetch( apiURL + `/transaction/withdrawal-request`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify( {
        address: address,
        amount: amount,
        token: coin,
        price: coin === 'eth' ? price.weth.usd : price.wbnb.usd
      } )
    } ).then( ( res ) => res.json() ).then( ( data ) => {
      if ( data.status === 200 ) {
        Toast.fire( {
          icon: 'success',
          text: 'Withdrawal request maded successfully!'
        } )
        getWithdrawals();
        context();
        handleClose();
      } else {
        Toast.fire( {
          icon: 'error',
          text: 'Something went wrong!',
        } )
      }
    } )
  }

  const getWithdrawals = () => {
    fetch( apiURL + '/transaction/getUserWithdrawals', {
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
    getPrice();
    getWithdrawals();
    socket.on( `withdrawal-request-handled-for-${user._id}`, () => {
      getWithdrawals()
      context()
    } )
    return () => {
      socket.off( `withdrawal-request-handled-for-${user._id}` )
    }
  }, [] )


  return (
    <div>
      <div className="fs-22 fw-800 text-uppercase text-white d-flex justify-content-between align-items-center gap-2 mb-4">
        <div>
          <span class="iconify" data-icon="fa6-solid:coins"></span>
          Withdrawals
        </div>
        <div>
          <button className='register-btn' onClick={handleShow}>Withdraw</button>
        </div>
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
                <th>Amount Requested</th>
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
                        {( item?.amount?.toFixed( 5 ) ) + " " + item?.token}
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
                Withdrawal Options
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
                      Withdraw BNB coin
                    </div>
                  </div>
                </div>
                <a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
              </div>
              <div className="deposit-box">
                <div className="fs-16 text-grey mb-4">
                  Please enter the BNB wallet address you wish to receive the funds on. Once confirmed, the withdrawal is usually processed within a few minutes.
                </div>
                <label htmlFor="" className="fs-14 text-grey mb-2">RECEIVING BNB ADDRESS <span className="fs-12 text-red">*</span></label>
                <div className="code-input position-relative mb-4">
                  <input type="text" placeholder='Paste your wallet address here' value={address} onChange={( e ) => setAddress( e.target.value )} />
                </div>
                <label htmlFor="" className="fs-14 text-grey mb-2">WITHDRAWAL AMOUNT <span className="fs-12 text-red">*</span></label>
                <div className="row">
                  <div className="col-lg-9">
                    <div className="d-flex align-items-center gap-3 flex-md-row flex-column">

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
                  </div>
                  <div className="col-lg-3">
                    <button type='button' className='register-btn line-1 h-50' disabled={address?.length != 42 || amount >= user?.balance || !amount} onClick={() => requestWithdrawal( 'bnb' )}>
                      Request <br />
                      Withdrawal
                    </button>
                  </div>
                </div>
                <div className="fs-12 text-grey mt-1 mb-3">
                  Your Balance: ${user?.balance?.toFixed( 2 ) || 0}
                </div>
                {( amount && amount >= user?.balance ) && <span className='text-danger'>Insufficient Balance</span>}
                {( amount && amount <= 25 ) && <span className='text-danger'>Must be more than 25$</span>}

                <div className="fs-12 text-grey ">
                  *Balance should be greater than 25$ for withdrawal.
                </div>
                <div className="fs-12 text-grey ">
                  *You will receive the specified Ethereum amount to your withdrawal address
                </div>
                <div className="fs-12 text-grey">
                  *The value subtracted from your balance may vary between now and the time we process your withdrawal
                </div>
              </div>



            </div>}

            {/* ethereum coin content */}
            {depositOptions === "eth" && <div>

              <div className="d-flex justify-content-between align-items-center mb-4">
                <div className="d-flex align-items-center gap-md-3 gap-2">
                  <a href="javascript:void(0)" className='fs-26 text-white' onClick={() => { setDepositOptions( "" ) }}>
                    <span class="iconify" data-icon="fa6-solid:angle-left"></span>
                  </a>
                  <div className="d-flex align-items-center gap-2">
                    <img src="/assets/images/eth.png" height="45px" className='heading-logo' alt="" />
                    <div className="fs-22 text-white text-uppercase">
                      Withdraw Ethereum coin
                    </div>
                  </div>
                </div>
                <a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
              </div>
              <div className="deposit-box">
                <div className="fs-16 text-grey mb-4">
                  Please enter the Ethereum wallet address you wish to receive the funds on. Once confirmed, the withdrawal is usually processed within a few minutes.
                </div>
                <label htmlFor="" className="fs-14 text-grey mb-2">RECEIVING ETHEREUM ADDRESS <span className="fs-12 text-red">*</span></label>
                <div className="code-input position-relative mb-4">
                  <input type="text" placeholder='Paste your wallet address here' value={address} onChange={( e ) => setAddress( e.target.value )} />
                </div>
                <label htmlFor="" className="fs-14 text-grey mb-2">WITHDRAWAL AMOUNT <span className="fs-12 text-red">*</span></label>
                <div className="row">
                  <div className="col-lg-9">
                    <div className="d-flex align-items-center gap-3 flex-md-row flex-column">

                      <div className="code-input coins-input position-relative w-100">
                        <input type="number" value={amount} placeholder={price?.weth?.usd} onChange={( e ) => {
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
                        <img src="/assets/images/eth.png" height="20px" className='input-coin' alt="" />
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-3">
                    <button type='button' className='register-btn line-1 h-50' onClick={() => requestWithdrawal( 'eth' )} disabled={address?.length != 42 || amount >= user?.balance || !amount} >
                      Request <br />
                      Withdrawal
                    </button>
                  </div>
                </div>
                <div className="fs-12 text-grey mt-1 mb-3">
                  Your Balance: ${user?.balance?.toFixed( 2 ) || 0}
                </div>
                {( amount && amount >= user?.balance ) && <span className='text-danger'>Insufficient Balance</span>}

                <div className="fs-12 text-grey ">
                  *You will receive the specified Ethereum amount to your withdrawal address
                </div>
                <div className="fs-12 text-grey">
                  *The value subtracted from your balance may vary between now and the time we process your withdrawal
                </div>
              </div>


            </div>}
          </div>}
        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Withdrawals