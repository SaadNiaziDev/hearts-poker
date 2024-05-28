import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { apiURL } from '../../constants';

const VerifyEmail = () => {
    const { id, token } = useParams();
    const [ isVerified, setIsVerified ] = useState( false );
    const [ isLoading, setIsLoading ] = useState( true );


    const verifyEmail = async () => {
        setIsLoading( true );
        fetch( `${apiURL}/user/verify-email`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify( {
                id: id,
                token: token,
            } )
        } ).then( ( res ) => res.json() ).then( ( data ) => {
            if ( data.status === 200 ) {
                setIsVerified( true )
            } else {
                setIsVerified( false )
            }
        } ).finally( () => {
            setIsLoading( false )
        } )
    }

    useEffect( () => {
        verifyEmail();
    }, [] )

    return (
        <div className='d-flex flex-column justify-content-center h-100'>
            <div className="row justify-content-center">
                {!isLoading && isVerified && <div className="col-lg-6">
                    <div className="row justify-content-center mb-5">
                        <div className="col-lg-5">
                            <div className="confirm-box">
                                <img src="/assets/images/verify.svg" alt="" />
                            </div>
                        </div>
                    </div>
                    <div className="fs-40 fw-800 text-white text-center mb-3">
                        Congratulations
                    </div>
                    <div className="mb-4 fs-18 fw-500 text-grey text-center">
                        You have successfully verify your email
                    </div>
                    <div className="text-center">
                        <a href='/' className='register-btn'>Continue</a>
                    </div>
                </div>}
                {!isLoading && !isVerified && <div className="col-lg-6">
                    <div className="text-center mb-5">
                        <img src="/assets/images/error.svg" height="100px" alt="" />

                    </div>
                    <div className="fs-40 fw-800 text-white text-center mb-3">
                        Error
                    </div>
                    <div className="mb-4 fs-18 fw-500 text-grey text-center">
                        Something went wrong! please contact the administrator!
                    </div>
                    <div className="text-center">
                        <a href='/' className='register-btn'>Continue</a>
                    </div>
                </div>}
                {isLoading && <div class="spinner-grow text-danger" role="status">
                    <span class="sr-only">Loading...</span>
                </div>}
            </div>
        </div>
    )
}

export default VerifyEmail