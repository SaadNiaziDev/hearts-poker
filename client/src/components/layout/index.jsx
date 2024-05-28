import React, { useState } from "react";
import { Outlet } from "react-router-dom";

import Header from "./Header";
import LeftSidebar from "./LeftSidebar";
import RightSidebar from "./RightSidebar";

const Layout = () => {
	const [ showChat, setShowChat ] = useState( false );
	const [ show, setShow ] = useState( false );
	const [ modalState, setModalState ] = useState( 'login' );


	return (
		<>
			<Header showChat={showChat} setShowChat={setShowChat} show={show} setShow={setShow} modalState={modalState} setModalState={setModalState} />
			<div className="layout">
				<LeftSidebar show={show} setShow={setShow} setModalState={setModalState} />
				<div className="main">
					<Outlet />
				</div>
				{showChat && <RightSidebar setShowChat={setShowChat} />}
			</div>
		</>
	);
};

export default Layout;
