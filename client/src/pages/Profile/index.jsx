import React, { useEffect, useState } from 'react'
import { useStore } from '../../store/store';
import { Toast, apiURL } from '../../constants';
import { shallow } from 'zustand/shallow';
// import useGetNft from '../../hooks/useGetNft';


const Profile = () => {
  const user = useStore( ( state ) => state.user );
  const token = useStore( ( state ) => state.token );
  const [ context, setUser ] = useStore(
    ( state ) => [ state.context, state.setUser ],
    shallow
  );
  const [ errorMsg, setErrorMsg ] = useState( '' );
  const [ nickname, setNickname ] = useState( user?.username || '' );
  const [ code, setCode ] = useState( '' );

  // const [ nfts ] = useGetNft();

  const steamLogin = () => {
    window.open(
      `${apiURL}/user/connect/steam?token=${token}`,
      "Login",
      "location=1,status=1,scrollbars=1, width=500,height=500"
    );
    window.addEventListener( "message", ( message ) => {
      if ( message.data?.user ) {
        setErrorMsg( '' );
        context();
      } else if ( message.data.err ) {
        setErrorMsg( 'Something went wrong!' );
      }
    } );
  }

  const twitchLogin = () => {
    window.open(
      `${apiURL}/user/connect/twitch`,
      "Login",
      "location=1,status=1,scrollbars=1, width=500,height=500"
    );
    window.addEventListener( "message", ( message ) => {
      if ( message.data?.user ) {

        setErrorMsg( '' );
        context();
      } else if ( message.data.err ) {
        setErrorMsg( 'Something went wrong!' );
      }
    } );
  }

  const changeUserName = () => {
    fetch( apiURL + '/user/changeUserName', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify( {
        username: nickname
      } )
    } ).then( ( res ) => res.json() ).then( ( result ) => {
      if ( result.status === 200 ) {
        setUser( result.data )
        setErrorMsg( '' )
        Toast.fire( {
          icon: 'success',
          text: "Username changed successfully!"
        } )
        setNickname( '' )
      } else {
        setErrorMsg( "Username already taken!" )
      }
    } )
  }

  const setReferral = () => {
    fetch( apiURL + '/user/set-referral-code', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify( {
        referralCode: code
      } )
    } ).then( ( res ) => res.json() ).then( ( res ) => {
      if ( res.status === 200 ) {
        Toast.fire( {
          icon: 'success',
          text: 'Referral code successfully set!'
        } )
        setUser( res.data )
        getRefferalData();
      } else {
        Toast.fire( {
          icon: 'error',
          text: res.message
        } )
      }
    }
    )
  }

  const getRefferalData = () => {
    fetch( apiURL + '/user/data', {
      headers: {
        'Authorization': 'Bearer ' + token,
        'Content-Type': 'application/json'
      }
    } ).then( ( res ) => res.json() ).then( ( res ) => {
      if ( res.status === 200 ) {
        setCode( res.data.username );
      }
    }
    )
  }

  useEffect( () => {
    if ( user?.referredBy ) getRefferalData();
  }, [] )


  return (
    <div className='profile'>
      <div className="d-flex align-items-center gap-2 fs-22 fw-800 text-white text-uppercase mb-4">
        <span class="iconify" data-icon="material-symbols:person-rounded"></span>
        Profile
      </div>
      <div className="fs-18 fw-800 text-white text-uppercase mb-4">
        Change Username
      </div>
      <div class="mb-4">
        <label for="" class="fs-16 text-grey mb-2">New username <span class="fs-12 text-red">*</span></label>
        <div class="code-input position-relative">
          <input type="text" value={nickname} onChange={( e ) => setNickname( e.target.value )} />
          <button disabled={!nickname || nickname == user?.username} class="register-btn" onClick={() => changeUserName()}>Change Name</button>
        </div>
      </div>
      {user?.signUpType === "oauth" && <div class="mb-4">
        <label for="" class="fs-16 text-grey mb-2">Email</label>
        <div class="code-input position-relative">
          <input type="text" value={user?.email} readOnly />
        </div>
      </div>}

      <div class="mb-4">
        <label for="" class="fs-16 text-grey mb-2">Reffered By</label>
        <div class="code-input position-relative">
          <input type="text" value={code} placeholder='Enter refferal code here' readOnly={user?.referredBy} onChange={( e ) => setCode( e.target.value )} />
          {!user?.referredBy && <button disabled={code.length !== 36} class="register-btn" onClick={() => setReferral()}>Set</button>}
        </div>
      </div>

      <div className="mb-4">
        <span className='checkbox'>
          <input type="checkbox" id="chsw1" name="pantheras" value="Tiger" />
          <label for="chsw1" className='position-relative fs-16 text-grey ps-5'>
            Use profile linked rollbot as chat/lottery avatar
          </label>
        </span>
      </div>
      <div className="mb-4">
        <span className='checkbox'>
          <input type="checkbox" id="chsw2" name="pantheras" value="Tiger" />
          <label for="chsw2" className='position-relative fs-16 text-grey ps-5'>
            Private Profile  <span className="fs-18 ps-2">
              <span class="iconify fs-20 " data-icon="ph:info-fill"></span>
            </span>
          </label>
        </span>
      </div>
      <div className="fs-18 fw-800 text-white text-uppercase mb-4">
        Link Account
      </div>
      <div className="d-flex align-items-center gap-3">
        <button className='link-btn' disabled={user?.steam?.id} onClick={() => steamLogin()}>
          <span className='fs-20'>
            <span class="iconify" data-icon="ri:steam-fill"></span>
          </span> Steam
          {user?.steam?.id && <iconify-icon icon="mdi:tick-circle" style={{ color: "green" }}></iconify-icon>}
        </button>
        <button className='link-btn' disabled={user?.twitch?.id} onClick={() => twitchLogin()}>
          <span className='fs-20'>
            <span class="iconify" data-icon="tabler:brand-twitch"></span>
          </span> Twitch
          {user?.twitch?.id && <iconify-icon icon="mdi:tick-circle" style={{ color: "green" }}></iconify-icon>}
        </button>
      </div>
      <span className='text-danger'>{errorMsg}</span>
    </div>
  )
}

export default Profile