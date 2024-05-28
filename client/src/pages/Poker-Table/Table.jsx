import React, { useContext, useEffect, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { apiURL, Toast } from "../../constants";
import { useStore } from "../../store/store";
import { shallow } from "zustand/shallow";
import { useNavigate, useParams } from "react-router-dom";
import { ProgressBar } from "react-loader-spinner"
import Modal from 'react-bootstrap/Modal';
import Bar from 'react-bootstrap/ProgressBar'
import Slider from 'rc-slider';
import 'rc-slider/assets/index.css';
import { SocketContext } from "../../socket";



const Table = () => {
    const { id } = useParams()
    const socket = useContext( SocketContext );
    const token = useStore( ( state ) => state.token );
    const user = useStore( ( state ) => state.user );
    const table = useStore( ( state ) => state.table );
    const [ getTable, setTable, context ] = useStore( ( state ) => [ state.getTable, state.setTable, state.context ], shallow );
    const [ isLoading, SetIsLoading ] = useState( false );
    const [ error, SetError ] = useState( '' )
    const [ show, SetShow ] = useState( false )
    const [ betAmount, SetBetAmount ] = useState( 0 )
    const [ timer, setTimer ] = useState( 0 )
    const navigate = useNavigate();

    const handleOpen = () => SetShow( true );
    const handleClose = () => SetShow( false );

    const joinGame = () => {
        SetIsLoading( true )
        fetch( `${apiURL}/game/join-table/${id}/${socket.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                SetIsLoading( false )
                SetError( '' )
                getTable( id );
                context();
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data.message
                } )
                SetError( data.message )
                SetIsLoading( false )
            }
        }
        )
    }

    const startGame = () => {
        fetch( `${apiURL}/game/start-game/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                setTimer( 30 );
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data.message
                } )
            }
        }
        )
    }

    const exitGame = () => {
        fetch( `${apiURL}/game/leave-game/${id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                setTable( null )
                navigate( '/poker-table' );
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data.message
                } )
            }
        }
        )
    }

    const makeBet = () => {
        fetch( `${apiURL}/game/make-bet`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
            body: JSON.stringify( {
                id: id,
                amount: betAmount,
                socket: socket.id
            } )
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                console.log( data );
                handleClose()
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data.message
                } )
            }
        }
        )
    }

    const makeCall = () => {
        fetch( `${apiURL}/game/make-call/${id}/${socket.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },

        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                console.log( data );
                handleClose()
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data.message
                } )
            }
        }
        )
    }

    const makeCheck = () => {
        fetch( `${apiURL}/game/make-check/${id}/${socket.id}`, {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            },
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                console.log( data );
                handleClose()
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data.message
                } )
            }
        }
        )
    }

    useEffect( () => {
        joinGame();
        console.log( table )
        window.addEventListener( 'online', function ( e ) {
            socket.emit( 'player-reconnected', ( {
                table: id,
                player: user._id
            } ) )
        } );
        const handleTableStart = args => {
            Toast.fire( {
                icon: 'info',
                text: 'Game has been started!',
            } );
            setTable( args );
        };

        const handleTableDataChanged = args => {
            setTimer( 0 );
            setTable( args );
        };

        const handlePlayerJoin = data => {
            Toast.fire( {
                icon: 'info',
                text: `${data?.username} joined the game`,
            } );
            setTable( data?.game );
            SetIsLoading( false );
            SetError( false );
        };

        const handlePlayerExit = data => {
            Toast.fire( {
                icon: 'info',
                text: `${data?.username} left the game`,
            } );
            setTable( data?.game );
            SetIsLoading( false );
            SetError( false );
        };

        const handleTableEnd = () => {
            context();
            socket.off( `user-end-table-${id}` );
            socket.off( `timer-update-${id}` );
        };

        const handleTimerUpdate = ( args ) => {
            setTimer( args );
        }

        socket.on( `timer-update-${id}`, handleTimerUpdate );
        socket.on( `table-${id}-start`, handleTableStart );
        socket.on( `table-${id}-data-changed`, handleTableDataChanged );
        socket.on( `new-player-join-table-${id}`, handlePlayerJoin );
        socket.on( `table-${id}-player-exit`, handlePlayerExit );
        socket.on( `table-${id}-ended`, handleTableEnd );

        return () => {
            socket.off( `timer-update-${id}` );
            socket.off( `new-player-join-table-${id}` );
            socket.off( `table-${id}-player-exit` );
            socket.off( `table-${id}-data-changed` );
            socket.off( `table-${id}-start` );
            socket.off( `table-${id}-ended` );
        };
    }, [] );





    return <>
        {isLoading && !error &&
            <div className="d-flex justify-content-center align-item-center flex-column text-center h-100">
                <div className="text-danger fs-30">JOINING THE TABLE</div>
                <div>
                    <ProgressBar
                        height="80"
                        width="80"
                        ariaLabel="progress-bar-loading"
                        wrapperStyle={{}}
                        wrapperClass="progress-bar-wrapper"
                        borderColor='#F4442E'
                        barColor='#F4442E'
                    />
                </div>
            </div>}
        {!isLoading && !error && table?.currentRound === 'pre-flop' && <>
            <div className="d-flex w-100 justify-content-between align-items-center">
                <button className="register-btn" onClick={() => exitGame()}>Exit</button>
                {table?.host === user?.walletAddress && <button className="register-btn" onClick={() => startGame()}>Start</button>}
            </div>
            <div className="d-flex justify-content-center align-item-center flex-column text-center h-100">
                <div className="text-danger fs-30">{table.players.length}/{table.maxPlayers} joined the game</div>
                <div className="text-white">Game will start once the lobby completely fills</div>
            </div>
        </>}
        {!isLoading && !error && table?.currentRound !== 'pre-flop' && <div>
            <TransformWrapper>
                <TransformComponent>
                    {table?.winner && <div className="d-flex align-items-center justify-content-between">
                        <button className="register-btn" onClick={() => exitGame()}>Exit</button>
                        {/* <span className="fs-24 text-danger text-uppercase">Current Round : {table?.currentRound}</span> */}
                    </div>}

                    <div className="poker-game position-relative">
                        <div className="game-box gap-3">
                            <div className="pot-box ">
                                Total pot: <span className="fs-20">{table?.pot || 0}</span>
                            </div>
                            <div className="pot-box ">
                                Main pot: <span className="fs-20">{table?.pot || 0}</span>
                            </div>
                            <div className="d-flex align-items-center gap-3">
                                {table?.communityCards?.map( ( item, index ) => {
                                    return (
                                        <div className="card-img front-img">
                                            <img src={`/assets/images/cards/${item?.suit}/${item?.rank}.png`} />
                                        </div>


                                    )
                                }
                                )}
                            </div>
                        </div>
                        {table?.players.map( ( data, i ) => (
                            <div className={`player player-${i + 1} ${table?.activePlayerIndex === i ? 'active' : ''} ${table.winner?.pid === data.pid ? "winner" : ""} ${data.didLeft || data.isDisconnected ? 'left-table' : ''}`}>
                                {table?.activePlayerIndex === i && data.address === user?.walletAddress &&
                                    <div className="d-flex gap-2 align-items-center action-btns">
                                        <button className="register-btn" onClick={() => handleOpen()}>{table?.pot !== 0 ? "Raise" : "Bet"}</button>
                                        {table?.pot !== 0 && <button className="register-btn" onClick={() => makeCall()}>Call</button>}
                                        {table?.pot !== 0 && <button className="register-btn" onClick={() => makeCheck()}>Check</button>}
                                    </div>
                                }
                                <div className={`active-bg  `}>
                                    <div className="player-img d-flex align-items-center justify-content-center gap-1" >
                                        {table?.players?.map( ( item, si ) => {
                                            return (
                                                i == si && item.cards.map( ( el ) => {
                                                    return (
                                                        <>
                                                            {( table?.currentRound === "showdown" || data.address === user?.walletAddress ) && <div className="pl-card"  >
                                                                <img src={`/assets/images/cards/${el.suit}/${el.rank}.png`} height="100px" alt="" />
                                                            </div>}

                                                            {data.address !== user?.walletAddress && table?.currentRound !== "showdown" && <div className="pl-card"  >
                                                                <img src={`/assets/images/back-card.png`} height="100px" alt="" />
                                                            </div>}
                                                        </> )
                                                } )
                                            )
                                        } )}


                                    </div>
                                    <div className="player-name position-relative">
                                        <div className="player-number  ">
                                            <img src={user?.profileImage} alt="" />
                                        </div>
                                        {data?.address.slice( 0, 5 )}...{data?.address.slice( -5 )}
                                    </div>
                                    <div className="bg-dark-orange time-player position-relative">
                                        <div className="d-flex justify-content-center align-items-center gap-2">
                                            {!table.winner && <>
                                                <div className="fs-14 text-white">
                                                    {timer}
                                                </div>
                                                <div className="progress-time-bg">
                                                    <Bar striped variant="info" now={timer} max={30} />

                                                </div>
                                            </>}
                                            {
                                                table?.winner?.pid === data.pid &&
                                                <span className="text-white winner-text text-center fs-24 mt-3">
                                                    Winner
                                                </span>

                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) )}
                    </div>
                </TransformComponent>
            </TransformWrapper>
        </div>};
        {!isLoading && error && <div>
            {error}
        </div>}
        <Modal centered className="username-modal" size="sm" show={show} onHide={handleClose}>

            <Modal.Body>
                <div className="d-flex justify-content-between align-items-center mb-4">
                    <div className="fs-22 fw-800 text-white text-uppercase">
                        Choose Bet
                    </div>
                    <a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
                </div>
                <div className="mb-4">
                    <Slider value={betAmount} min={table?.currentBet} max={table?.players[ table?.activePlayerIndex ]?.chips} onChange={( e ) => SetBetAmount( e )} />
                </div>
                <div className="d-flex justify-content-between align-items-center text-grey ">
                    <span>Bet : {betAmount}</span>
                    <span>Max Bet : {table?.players[ table?.activePlayerIndex ]?.chips}</span>
                </div>
                <div className="text-center">
                    <button className="register-btn" onClick={() => makeBet()} >Bet</button>
                </div>
            </Modal.Body>

        </Modal>
    </>
}

export default Table