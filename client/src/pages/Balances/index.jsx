import React from 'react'

const Balances = () => {
  return (
    <div>
      <div className="d-flex align-items-center justify-content-between mb-4">
        <div className="fs-22 fw-800 text-uppercase text-white d-flex align-items-center gap-2">
          <span class="iconify" data-icon="healthicons:money-bag"></span>
          Balances
        </div>
        <a href="javascript:void(0)" className='claim-btn'>Create referral balance</a>
      </div>
      <div className="d-flex align-items-center justify-content-between mb-3">
        <div className="d-flex align-items-center gap-2 fs-14 fw-500 text-grey">
          <span className="fs-18">
            <span class="iconify" data-icon="ph:arrows-left-right"></span>
          </span>
          Switch Balance
        </div>
        <div className="fs-14 text-grey">
          Total: <span className='text-green'>$0.00</span>
        </div>
      </div>
      <div className="balance-box">
          <div className="d-flex align-items-center gap-3">
            <div className="yellow-circle"><div className="black-dot"></div></div>
            <div>
              <div className="fs-14 fw-600 text-white">
                Main
              </div>
              <div className="d-flex align-items-center gap-1">
                <img src="/assets/images/coin.png" height="15px" alt="" />
                <div className="fs-14 text-white fw-600">
                  $0.00
                </div>
              </div>
            </div>
          </div>
      </div>
    </div>
  )
}

export default Balances