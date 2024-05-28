import React from "react";
import { Swiper, SwiperSlide } from "swiper/react";

// Import Swiper styles
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";


// import required modules
import { Pagination, Navigation } from "swiper";
import { useNavigate } from "react-router-dom";


const Home = () => {
	const navigate = useNavigate();
	return (
		<>
			<div className="home">
				{/* <Swiper
					slidesPerView={'1'}
					// centeredSlides={true}

					breakpoints={{

						768: {
							slidesPerView: 3,
						},

					}}

					spaceBetween={30}
					pagination={{
						clickable: true,
					}}
					navigation={true}
					modules={[ Pagination, Navigation ]}
					className="mySwiper"
				>
					<SwiperSlide>
						<div className="casino-img">
							<img src="/assets/images/casino1.jpg" className="w-100" alt="" />
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className="casino-img">
							<img src="/assets/images/casino2.jpg" className="w-100" alt="" />
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className="casino-img">
							<img src="/assets/images/casino3.jpg" className="w-100" alt="" />
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className="casino-img">
							<img src="/assets/images/casino1.jpg" className="w-100" alt="" />
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className="casino-img">
							<img src="/assets/images/casino2.jpg" className="w-100" alt="" />
						</div>
					</SwiperSlide>
					<SwiperSlide>
						<div className="casino-img">
							<img src="/assets/images/casino3.jpg" className="w-100" alt="" />
						</div>
					</SwiperSlide>

				</Swiper> */}

				{/* <div className="row mt-5 mb-4">
					<div className="col-lg-6 mb-md-0 mb-4">
						<div className="casino-banner">
							<img src="/assets/images/banner1.jpg" alt="" />
							<div className="banner-content">
								<div className="d-flex  gap-2">
									<a href="javascript:void(0)" className="discord-icon">
										<span class="iconify" data-icon="file-icons:telegram"></span>
									</a>
									<div>
										<div className="fs-24 text-white text-uppercase">
											Join Our Telegram
										</div>
										<div className="fs-18 text-grey text-uppercase">
											& Get Bonus!
										</div>
									</div>
								</div>

							</div>
						</div>

					</div>
					<div className="col-lg-6">
						<div className="casino-banner">
							<img src="/assets/images/banner2.jpg" alt="" />
							<div className="banner-content">
								<div className="d-flex  gap-2">
									<a href="javascript:void(0)" className="discord-icon">
										<span class="iconify" data-icon="ic:twotone-discord"></span>
									</a>
									<div>
										<div className="fs-24 text-white text-uppercase">
											Join Our Discord
										</div>
										<div className="fs-18 text-grey text-uppercase">
											& Get Bonus!
										</div>
									</div>
								</div>

							</div>
						</div>
					</div>
				</div> */}

				<div className="fs-32 fw-800 text-white">
					Categories
				</div>
				<div className="row mt-4">
					<div className="col-lg-4 mb-4" onClick={() => navigate( '/poker-table' )}>
						<div className="category-card mb-3">
							<img src="/assets/images/cash-games.png" alt="" />
						</div>
						<div className="text-center fs-20 fw-500 text-white">
							Table Games
						</div>
					</div>
					<div className="col-lg-4 mb-4" onClick={() => navigate( '/poker-table' )}>
						<div className="category-card mb-3">
							<img src="/assets/images/tournament.jpg" alt="" />
						</div>
						<div className="text-center fs-20 fw-500 text-white">
							Tournaments
						</div>
					</div>
				</div>
				<div className="fs-32 fw-800 text-white">
					Poker Rooms
				</div>
				<div className="row mt-4">
					<div className="col-lg-4 mb-4" onClick={() => navigate( '/poker-table' )}>
						<div className="room-card mb-3">
							<img src="/assets/images/logo2.svg" alt="" />
						</div>
						<div className="text-center fs-20 fw-500 text-white">
							TokenSociety
						</div>
					</div>
					<div className="col-lg-4 mb-4" onClick={() => navigate( '/poker-table' )}>
						<div className="room-card mb-3">
							<img src="/assets/images/dippies.png" alt="" />
						</div>
						<div className="text-center fs-20 fw-500 text-white">
							Dippies
						</div>
					</div>
					<div className="col-lg-4 mb-4" onClick={() => navigate( '/poker-table' )}>
						<div className="room-card mb-3">
							<img src="/assets/images/gayAlien.png" alt="" />
						</div>
						<div className="text-center fs-20 fw-500 text-white">
							Gay Aliens Society
						</div>
					</div>
				</div>
				<div className="fs-32 fw-800 text-white text-center">
					How to play
				</div>
				<div className="text-center">
					<div className="video-frame pt-4">
						<iframe width='100%' height='100%' src="https://www.youtube.com/embed/CpSewSHZhmo" title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
					</div>
				</div>
			</div>
			<div className="text-center my-5 ">
				<div className="banner fs-72 d-flex justify-content-center align-items-center">
					<span class="iconify" data-icon="logos:ethereum"></span>
					{/* <span class="iconify" data-icon="mingcute:avalanche-avax-fill" style={{ color: 'white' }}></span> */}
				</div>
			</div>
		</>
	);
};

export default Home;
