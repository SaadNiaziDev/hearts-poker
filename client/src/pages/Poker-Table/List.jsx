import React, { useContext, useEffect, useState } from 'react'
import DataTable from 'react-data-table-component';
import { apiURL, dippies_contract_address, gay_aliens_contract_address, Toast } from "../../constants"
import Modal from 'react-bootstrap/Modal';
import { useStore } from '../../store/store';
import { useNavigate } from 'react-router-dom';
import { shallow } from 'zustand/shallow';
import { SocketContext } from '../../socket';
// import useNftHook from '../../hooks/useNftHook';

const List = () => {
    const navigate = useNavigate()
    const socket = useContext( SocketContext );
    const [ docs, setDocs ] = useState( [] );
    const token = useStore( ( state ) => state.token );
    const user = useStore( ( state ) => state.user );
    const [ setTable ] = useStore( ( state ) => [ state.setTable ], shallow );
    const [ show, setShow ] = useState( false );
    const [ lobby, setLobby ] = useState( {
        name: '',
        visibility: false,
        maxPlayers: 0,
        fee: 0
    } );
    // address = '0x26004CFc6395AE7E4d08Bf416356876ebE17BB70'

    // const [ dippies ] = useNftHook( { address: '0x26004CFc6395AE7E4d08Bf416356876ebE17BB70', nftAddress: dippies_contract_address } );
    // const [ gayAliens ] = useNftHook( { address: '0x26004CFc6395AE7E4d08Bf416356876ebE17BB70', nftAddress: gay_aliens_contract_address } )

    // const [ dippies ] = useNftHook( { address: user?.walletAddress, nftAddress: dippies_contract_address } );
    // const [ gayAliens ] = useNftHook( { address: user?.walletAddress, nftAddress: gay_aliens_contract_address } )



    const handleShow = () => setShow( true );
    const handleClose = () => setShow( false );

    const columns = [
        {
            name: 'Host',
            selector: row => row.host,
        },
        {
            name: 'Name',
            selector: row => row.name,
            sortable: true,
        },
        {
            name: 'Round',
            selector: row => row.currentRound.toUpperCase(),
        },
        {
            name: 'Players',
            selector: ( row ) => row.players,
            cell: row => row.players.length + '/' + row.maxPlayers,
            sortable: true,
        },

        {
            name: 'Pot',
            selector: row => row.pot,
            sortable: true,
        },
        {
            name: 'Fee',
            selector: row => row.fees,
            sortable: true,
        },
        {
            name: 'Status',
            selector: row => row.visibility,
            cell: row => row.visibility === "private" ? <iconify-icon icon="material-symbols:lock"></iconify-icon>
                : <iconify-icon icon="material-symbols:lock-open"></iconify-icon>,
            sortable: true,

        },
        {
            name: '',
            cell: ( row ) => <button className='register-btn' onClick={() => handleRowClicked( row )} >{row?.players.some( ( item ) => item.address === user?.walletAddress ) ? "Joined" : "Join"}</button>,
        },

    ];

    const getTables = () => {
        fetch( `${apiURL}/game`, {
            headers: {
                'Content-Type': 'application/json'
            }
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            setDocs( data.data );
        } )
    }

    const createTable = () => {
        fetch( `${apiURL}/game/create`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token
            },
            body: JSON.stringify( {
                name: lobby.name,
                maxPlayers: lobby.maxPlayers,
                fee: lobby.fee,
                visibility: lobby.visibility ? 'private' : 'public'
            } )
        } ).then( ( result ) => result.json() ).then( ( result ) => {
            Toast.fire( {
                icon: 'success',
                title: 'Table created successfully!'
            } );
            handleClose();
        } )
    }

    const handleRowClicked = ( row ) => {
        if ( user ) {
            if ( row.visibility === "private" ) {
                Toast.fire( {
                    icon: "info",
                    title: "Can't access private table"
                } )
            } else {
                setTable( row );
                navigate( `/poker-table/${row._id}` )
            }
        }
    }


    useEffect( () => {
        getTables();
        socket.on( 'table-data-changed', ( args ) => {
            getTables()
        } )

        socket.on( 'new-table-created', ( args ) => {
            getTables()
        } )

        return () => {
            socket.off( 'new-table-created' )
            socket.off( 'table-data-changed' )
        };

    }, [] )





    return (
        <>

            <div className='d-flex justify-content-between align-items-center'>
                <span className='text-white'>Poker Tables</span>
                <button className='register-btn' onClick={() => handleShow()}>Create</button>
            </div>
            <br />
            <DataTable
                title="Poker Tables"
                columns={columns}
                data={docs}
                direction="auto"
                fixedHeaderScrollHeight="300vh"
                highlightOnHover
                pagination
                pointerOnHover
                noHeader
                responsive
                theme='dark'
            />
            {/* : <div className="code-box h-100 text-danger">
                    <div className="fs-100 text-danger">
                        <span class="iconify" data-icon="ic:baseline-error"></span>
                    </div>
                    You need to hold either one of the Dippies or Gay Aliens NFT to play this game
                </div>} */}
            <Modal centered className="username-modal" size="sm" show={show} onHide={handleClose}>

                <Modal.Body>
                    <div className="d-flex justify-content-between align-items-center mb-4">
                        <div className="fs-22 fw-800 text-white text-uppercase">
                            Create Table
                        </div>
                        <a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span className="iconify" data-icon="radix-icons:cross-2"></span></a>
                    </div>
                    <div className="mb-4">
                        <div className="code-input position-relative">
                            <label className="text-grey" >Table Name</label>
                            <input type="text" placeholder="Enter table name here" value={lobby.name} onChange={( e ) => setLobby( { ...lobby, name: e.target.value } )} />
                        </div>
                        <div className="code-input position-relative">
                            <label className="text-grey">Table Fees</label>
                            <input type="number" placeholder="Enter joining fees" value={lobby.fee} onChange={( e ) => setLobby( { ...lobby, fee: e.target.value } )} />
                        </div><div className="code-input position-relative">
                            <label className="text-grey" >Max Players</label>
                            <input type="number" placeholder="Enter maximum number of players" value={lobby.maxPlayers} onChange={( e ) => setLobby( { ...lobby, maxPlayers: e.target.value } )} />
                        </div><div className="d-flex justify-content-start align-items-center gap-3 mt-3">
                            <span className='text-grey fs-16'>Private</span>
                            <label className="switch">
                                <input type="checkbox" value={lobby.visibility} onChange={( e ) => setLobby( { ...lobby, visibility: !lobby.visibility } )} />
                                <span className="slider round"></span>
                            </label>

                        </div>


                    </div>
                    <div className="text-center">
                        <button className="register-btn" disabled={lobby.name === " " || lobby.maxPlayers == 0 || lobby.fee === 0} onClick={() => createTable()} >Create</button>
                    </div>
                </Modal.Body>

            </Modal>
        </>
    )
}

export default List