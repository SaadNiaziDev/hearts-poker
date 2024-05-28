import React from "react";

const Affiliate = () => {
	return <div className="affiliate-page">
		<div className="fs-16 text-white mb-3">
			Advertise casino.solabet.gg and earn money by participating in our affiliate program!
		</div>
		<div className="fs-16 text-white mb-3">
			You will recieve various bonuses for each active user who will register and play on casino.solabet.gg through your link.
		</div>

		<div className="fs-18 fw-500 text-white mb-2">
			Referral link
		</div>
		<div className="link-box mb-3">
			<input type="text" value="https://casino.solabet.gg/?c=Amp" />
		</div>
		<div className="fs-18 fw-500 text-white mb-2">
			What you will get for participating in affilate program:
		</div>
		<ol type="1">
			<li className="text-white fs-16 mb-3">
				<div>
				You will get % of your affiliate deposit, which is based on your VIP level.
				</div>

				<div className="text-center mt-4">
				<div className="diamond-box gap-3">
					<div>
						<div className="diamond-img mb-3">
							<div className="fs-18 text-white">-</div>
						</div>
						<div className="fs-14 text-white">
							1%
						</div>
					</div>
					<div>
					<div className="diamond-img mb-3">
							<img src="/assets/images/red.png" height="20px" alt="" />
						</div>
						
						<div className="fs-14 text-white">
							2%
						</div>
					</div>
					<div>
					<div className="diamond-img mb-3">
							<img src="/assets/images/green.png" height="20px" alt="" />
						</div>
						<div className="fs-14 text-white">
							3%
						</div>
					</div>
					<div>
						<div className="diamond-img mb-3">
							<img src="/assets/images/blue.png" height="20px" alt="" />
						</div>
						<div className="fs-14 text-white">
							5%
						</div>
					</div>
					<div>
						<div className="diamond-img mb-3">
							<img src="/assets/images/diamond.png" height="20px" alt="" />
						</div>
						<div className="fs-14 text-white">
							10%
						</div>
					</div>
					<div>
						<div className="diamond-img mb-3">
							<img src="/assets/images/king.png" height="20px" alt="" />
						</div>
						<div className="fs-14 text-white">
							20%
						</div>
					</div>
				</div>
				</div>
			</li>
			<li className="text-white fs-16 mb-3">
				Your affiliate will recieve a free bonus in BTC after registeration
			</li>
			<li className="text-white fs-16 mb-3">
				You will also recieve a free bonus from your affiliate if he is active. You can track this through tha "Affiliates" tab.
			</li>
			<li className="text-white fs-16 mb-3">
				Every 10 active affiliates will grant you a bonus Wheel spin with increased rewards..
			</li>
		</ol>
	</div>;
};

export default Affiliate;
