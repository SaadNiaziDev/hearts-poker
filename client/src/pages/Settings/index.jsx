import moment from 'moment';
import React, { useState } from 'react'
import Modal from 'react-bootstrap/Modal';
import { useStore } from '../../store/store';
import ipaddr from 'ipaddr.js'
import { apiURL, Toast } from '../../constants';

const Settings = () => {
  const user = useStore( ( state ) => state.user );
  const token = useStore( ( state ) => state.token );


  const [ hideHistory, setHideHistory ] = useState( false )
  const [ show, setShow ] = useState( false );
  const [ oldPassword, setOldPassword ] = useState( '' );
  const [ newPassword, setNewPassword ] = useState( '' );


  const handleClose = () => setShow( false );
  const handleShow = () => setShow( true );

  const changePassword = () => {
    fetch( `${apiURL}/user/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
      body: JSON.stringify( {
        id: user._id,
        oldPassword: oldPassword,
        newPassword: newPassword
      } )
    } ).then( ( res ) => res.json() ).then( ( data ) => {
      if ( data.status === 200 ) {
        Toast.fire( {
          icon: 'success',
          title: 'Password changed successfully!'
        } )
        setOldPassword( '' );
        setNewPassword( '' );
      } else {
        Toast.fire( {
          icon: 'error',
          title: data.message
        } )
      }
    } )
  }

  const sendEmail = () => {
    fetch( `${apiURL}/user/send-verification-email`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token
      },
    } ).then( ( res ) => res.json() ).then( ( data ) => {
      if ( data.status === 200 ) {
        Toast.fire( {
          icon: 'success',
          title: 'Email sent successfully!'
        } )
      } else {
        Toast.fire( {
          icon: 'error',
          title: data.message
        } )
      }
    } )
  }


  return (
    <div>
      <div className="fs-22 fw-800 text-uppercase text-white d-flex align-items-center gap-2 mb-4">
        <span class="iconify" data-icon="material-symbols:settings-rounded"></span>
        Settings
      </div>
      {/* <div className="fs-18 text-white text-uppercase fw-800 mb-4">
        Change Email
      </div> */}
      {/* <div class="mb-4">
        <label for="" class="fs-16 text-grey mb-2">New Email <span class="fs-12 text-red">*</span></label>
        <div class="code-input position-relative">
          <input type="text" />
          <a href="javascript:void(0)" class="register-btn">Change Email</a>
        </div>
      </div> */}
      <div className="mb-4">
        <div className="fs-18 text-white text-uppercase fw-800 mb-4">
          Verify Your Email
        </div>
        <div className="fs-14 fw-500 text-white mb-4">
          Status: {user?.isEmailVerified ? <span className="text-green">Verified</span> : <span className="text-red">Unverified</span>}
        </div>
        <button disabled={user?.isEmailVerified} className='register-btn' onClick={() => sendEmail()}>Send Verification Email</button>
      </div>
      <div className="mb-4">
        <div className="fs-18 fw-500 text-uppercase text-white mb-4">
          Change Password
        </div>
        <div className="mb-4">
          <label for="" class="fs-16 text-grey mb-2">Old Password <span class="fs-12 text-red">*</span></label>
          <div class="code-input position-relative">
            <input type="password" value={oldPassword} onChange={( e ) => setOldPassword( e.target.value )} />
          </div>
        </div>
        <div className="mb-4">
          <label for="" class="fs-16 text-grey mb-2">New Password <span class="fs-12 text-red">*</span></label>
          <div class="code-input position-relative">
            <input type="password" value={newPassword} onChange={( e ) => setNewPassword( e.target.value )} />
          </div>
          {newPassword.length > 0 && newPassword === oldPassword && <span className='text-danger'>
            You must a unique new password!
          </span>}
        </div>
        <button disabled={oldPassword.length == 0 || newPassword.length == 0 || newPassword === oldPassword} class="register-btn" onClick={() => changePassword()}>Change Password</button>
      </div>

      {/* <div className="mb-4">
        <div className="fs-18 fw-800 text-white text-uppercase d-flex align-items-center gap-3 mb-4">
          Two-Factor Authentication
          <div className="text-grey">
            Disabled
          </div>
        </div>
        <div className="fs-14 mb-4 text-grey mb-4 fw-500">
          Using two-factor authentication is highly recommended because it protects your account with both your password and your phone.
        </div>
        <div className="fs-14 mb-4 text-grey mb-4 fw-500">
          While 2FA is enabled, you will not be able to login via Steam.
        </div>
        <a href="javascript:void(0)" class="register-btn" onClick={handleShow}>Enable 2FA</a>
      </div>
      <div className="mb-4">
        <div className="fs-18 fw-800 text-white mb-4">
          VERIFY YOUR IDENTITY (KYC)
        </div>
        <div className="fs-14 fw-500 text-grey mb-4">
          Status: <span className="fs-16">Started</span>
        </div>
        <a href="javascript:void(0)" class="register-btn">Verify</a>
      </div> */}
      <div className='mb-4'>
        <div className="fs-18 fw-800 text-white text-uppercase mb-4">
          Login History
        </div>
        <a href="javascript:void(0)" className='copy-btn fs-14 py-2' onClick={() => setHideHistory( !hideHistory )}>{!hideHistory ? "Show " : "Hide "} Login History</a>
      </div>

      {hideHistory && <div className="code-table">
        <div class="table-responsive">
          <table class="table text-white">
            <thead>
              <tr>
                <th>Date</th>
                <th>Login Method</th>
                <th>Country</th>
                <th>IP</th>
              </tr>
            </thead>
            <tbody>
              {user?.loginHistory?.map( ( item, index ) => ( (
                <tr key={index}>
                  <td>
                    <div className="box first">
                      {moment( Number( item?.date ) ).format( 'MMMM Do YYYY, h:mm:ss a' )}
                    </div>
                  </td>
                  <td>
                    <div className="box">
                      {item?.loginMethod}
                    </div>
                  </td>
                  <td>
                    <div className="box">
                      {item?.country || "PK"}
                    </div>
                  </td>
                  <td>
                    <div className="box">
                      {ipaddr.process( item?.ipAddress ).toString() || "192.168.1.10"}
                    </div>
                  </td>
                </tr>
              ) ) )}
            </tbody>
          </table>
        </div>
      </div>}

      <Modal centered className='authentication-modal' show={show} onHide={handleClose}>
        <Modal.Body>
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div className="fs-22 fw-800 text-white text-uppercase">
              SET UP GOOGLE AUTHENTICATOR
            </div>
            <a href="javascript:void(0)" onClick={handleClose} className='fs-22 text-grey'><span class="iconify" data-icon="radix-icons:cross-2"></span></a>
          </div>
          <ul>
            <li className='mb-3 fs-14 text-white fw-500'>
              1. Download the Google Authenticator app for iPhone or Android
            </li>
            <li className='mb-3 fs-14 text-white fw-500'>
              <div className="mb-3">
                2. Save the following Account Token (Key) in a secure place
              </div>
              <div className="mb-3">
                <label className="fs-14 text-grey text-uppercase text-uppercase mb-2">
                  Account Token [KEY]
                </label>
                <div className="code-input position-relative">
                  <input type="text" value="PIN4SNSQHV2QBQRIQU3XCFARHCZGF2TX" />
                  <a href="javascript:void(0)" className="register-btn">Create</a>
                </div>
              </div>
              <div className="fs-14 text-white fw-500">
                You will need your Account Token (Key) above to access your account in case you lose your phone
              </div>
            </li>
            <li className='mb-3 fs-14 text-white fw-500'>
              3. Scan QR Code with the Google Authenticator app

              <div className="qr-img mt-3">
                <img src="/assets/images/qr-code.png" alt="" />
              </div>
            </li>
            <li className="fs-14 mb-4 fw-500 text-white">
              4. Enter the Token below
              <div className="mt-3">
                <label className="fs-14 text-grey text-uppercase text-uppercase mb-2">
                  2FA Code  <span class="fs-12 text-red">*</span>
                </label>
                <div className="code-input position-relative">
                  <input type="text" />
                </div>
              </div>
            </li>
            <a href="javascript:void(0)" className='register-btn'>
              Enable 2FA
            </a>
          </ul>


        </Modal.Body>
      </Modal>
    </div>
  )
}

export default Settings