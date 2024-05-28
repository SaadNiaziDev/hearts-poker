import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom';
import { apiURL, Toast } from '../../constants/index';


const ResetPassword = () => {
    const { id, token } = useParams();
    const [ password, setPassword ] = useState( '' );
    const [ repassword, setRepassword ] = useState( '' );
    const navigate = useNavigate();



    const changePassword = async () => {
        fetch( `${apiURL}/user/reset-password`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( {
                id: id,
                token: token,
                password: password
            } )
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                Toast.fire( {
                    icon: 'success',
                    title: data.data
                } ).then( () => {
                    navigate( '/' )
                } )
            } else {
                Toast.fire( {
                    icon: 'error',
                    title: data?.message
                } )
            }
        } )
    }

    useEffect( () => {
        console.log( id, token )
    }, [] )
    return (
        <div className="compelete-profile">
            <div className='row justify-content-center '>
                <div className="col-lg-6">
                    <div className="fs-22 fw-800 text-uppercase text-white mb-4">
                        Reset Password
                    </div>
                    <div class="mb-4">
                        <label for="" class="fs-16 text-grey mb-2">New Password <span class="fs-12 text-red">*</span></label>
                        <div class="code-input position-relative">
                            <input type="password" onChange={( e ) => setPassword( e.target.value )} value={password} />
                        </div>
                    </div>
                    <div class="mb-4">
                        <label for="" class="fs-16 text-grey mb-2">Retype Password <span class="fs-12 text-red">*</span></label>
                        <div class="code-input position-relative">
                            <input type="password" onChange={( e ) => setRepassword( e.target.value )} value={repassword} />
                        </div>
                    </div>

                    <button disabled={password != repassword || password.length == 0} className='register-btn' onClick={changePassword}>Confirm</button>

                </div>
            </div>
        </div>
    )
}

export default ResetPassword