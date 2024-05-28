import React, { useEffect, useRef, useState } from 'react'
import { Toast, apiURL } from '../../../constants';
import { useStore } from '../../../store/store';
import { shallow } from 'zustand/shallow';



const Admin = () => {
    const [ oldAddress, setOldAddress ] = useState( '0x0000000000000000000000000000000000000000' );
    const [ address, setAddress ] = useState( '' );
    const [ btnText, setBtnText ] = useState( 'Set' );
    const [ errorMsg, setErrorMsg ] = useState( '' );
    const [ loginBody, setLoginBody ] = useState( { email: '', password: '' } );
    const token = useStore( ( state ) => state.token );
    const user = useStore( ( state ) => state.user );

    const [ setUser, setToken ] = useStore( ( state ) => [ state.setUser, state.setToken ], shallow )


    const clearStates = () => {
        setLoginBody( { email: '', password: '' } );
        setErrorMsg();
    }


    const handleClose = () => {
        clearStates();
        setShow( false );
    };



    const login = () => {
        fetch( `${apiURL}/user/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },

            body: JSON.stringify( loginBody )
        } ).then( ( response ) => response.json() )
            .then( ( res ) => {
                if ( res.status !== 200 ) {
                    setErrorMsg( res.message );
                } else {
                    setUser( res?.data?.user );
                    setToken( res?.data?.user?.token );
                    handleClose();
                    Toast.fire( {
                        icon: 'success',
                        text: 'Login Successfull'
                    } )
                }
            } ).catch( ( err ) => setErrorMsg( err.message ) );
    }

    const getAddress = () => {
        fetch( apiURL + '/transaction/config', {
            headers: {
                'Content-Type': 'application/json',
            }
        } ).then( ( res ) => res.json() ).then( ( res ) => {
            if ( res.status === 200 ) {
                setBtnText( 'Set' )
                setOldAddress( res.data.address );
            } else {
                setBtnText( 'Add' )
            }
        } )
    }

    const updateAddress = () => {
        fetch( apiURL + '/transaction/update-config', {
            method: 'POST',
            body: JSON.stringify( {
                address: address
            } ),
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        } ).then( ( response ) => response.json() ).then( ( res ) => {
            if ( res.status === 200 ) {
                Toast.fire( {
                    icon: "success",
                    title: "Ethereum Address updated successfully!"
                } )
                getAddress();
                setAddress( '' )
            } else {
                Toast.fire( {
                    icon: "error",
                    title: "Can't update ethereum address"
                } )
            }
        } )
    }



    useEffect( () => {
        getAddress();
    }, [ user ] )


    if ( !user || user.role !== 'admin' ) {
        return (
            <div className="container d-flex justify-content-center align-items-center" style={{ height: "500px" }}>
                <div className="">
                    <div className='deposit-box' style={{ width: '500px' }}>
                        <div className="mb-4">
                            <label htmlFor="" className="fs-16 text-grey mb-2">EMAIL <span className="fs-12 text-red">*</span></label>
                            <div class="code-input position-relative">
                                <input type="email" placeholder="Youremail@domain.com " onChange={( e ) => setLoginBody( { ...loginBody, email: e.target.value } )} />
                            </div>
                        </div>
                        <div className="mt-4">
                            <label htmlFor="" className="fs-16 text-grey mb-2">PASSWORD <span className="fs-12 text-red">*</span></label>
                            <div class="code-input position-relative">
                                <input type="password" placeholder="*********" onChange={( e ) => setLoginBody( { ...loginBody, password: e.target.value } )} />
                            </div>
                        </div>

                        {errorMsg !== '' && <div className="text-danger fs-13 text-center">{errorMsg}</div>}
                        <a class="register-btn w-100 mt-4" href="javascript:void(0)" onClick={() => login()}>Login</a>
                    </div>
                </div>
            </div >

        )

    } else {

        return (

            <div className="deposit-box">
                <div className='d-flex justify-content-center align-items-center'>
                    <div className="row justify-content-center gap-3">
                        <div className="col-lg-10">
                            <label className='text-white mb-2'>Admin's Address</label>
                            <div className="code-input">
                                <input type="text" readOnly value={oldAddress} />
                            </div>
                        </div>
                        <div className="col-lg-10">
                            <label className='text-white mb-2'>Change Address</label>
                            <div className="code-input">
                                <input type="text" value={address} onChange={( e ) => setAddress( e.target.value )} />
                            </div>
                        </div>
                        <div className="col-lg-10">
                            <button className='register-btn w-100' disabled={address?.length !== 42} onClick={() => updateAddress()}>{btnText}</button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default Admin