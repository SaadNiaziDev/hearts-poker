import React, { useContext, useEffect, useRef, useState } from "react";
import Tab from 'react-bootstrap/Tab';
import Tabs from 'react-bootstrap/Tabs';
import { SocketContext } from "../../socket";
import { useStore } from "../../store/store";
import { apiURL } from "../../constants";
import EmojiPicker from 'emoji-picker-react';



const RightSidebar = ( { setShowChat } ) => {
	const socket = useContext( SocketContext );
	const token = useStore( ( state ) => state.token );
	const getGeneralChat = useStore( ( state ) => state.getGeneralChat );
	const bottomRef = useRef( null );


	const [ openChat, setOpenChat ] = useState( [] );
	const [ tableChat, setTableChat ] = useState( [] );
	const [ isEmoji, setIsEmoji ] = useState( false );
	const [ msg, setMsg ] = useState( '' );

	const loadMessages = async () => {
		let c = await getGeneralChat();
		setOpenChat( c )
	}

	const handleOpenChat = ( type, id ) => {
		fetch( apiURL + '/chats/add', {
			method: 'POST',
			body: JSON.stringify( {
				type: type,
				message: msg,
				// gameId: id ? id : undefined
			} ),
			headers: {
				'Content-Type': 'application/json',
				'Authorization': 'Bearer ' + token,
			}
		} ).then( ( response ) => response.json() ).then( ( data ) => {
			if ( data.status === 200 ) {
				setMsg( '' )
			}
		} )
	}

	useEffect( () => {
		loadMessages();
		bottomRef.current?.scrollIntoView( { behavior: 'smooth' } );
		socket.on( 'message', ( args ) => {
			setOpenChat( args );
		} )
		return () => {
			socket.off( 'message' );
		}

	}, [] );

	useEffect( () => {
		bottomRef.current?.scrollIntoView( { behavior: 'smooth' } );
	}, [ openChat ] )


	return <div className="right-sidebar">
		<div className="right-header position-relative">
			<div className="reffer-tabs ">
				<Tabs
					defaultActiveKey="home"
					id="uncontrolled-tab-example"
					className="mb-3"
				>
					<Tab eventKey="home" title="Chat" className="pt-1">
						<div className="chats" id="chats">

							{openChat?.map( ( item, index ) => {
								return ( <div class="message-box">
									<div class="message-profile me-2">
										<div class="image-user me-2">
											<img src="/assets/images/fav-logo.jpeg" alt="Platinum 1" scale="0.72" class="css-10qm6dq" />
										</div>
										<div class="user-name" style={{ color: "rgb(25, 197, 255)", fontWeight: 600 }}>0x...{item?.sender.slice( -5 )}:</div>
									</div>
									<span class="message-text" ><span class="text-white">@W㋡Shark🦈</span>{item?.message}</span>
								</div> )
							} )}
							<div ref={bottomRef}></div>
						</div>
						<div className="code-input msg-input position-relative">
							<div className="emoji justify-content-center align-items-center" onClick={() => setIsEmoji( true )}>
								<span class="iconify" data-icon="fluent:emoji-32-regular"></span>
							</div>
							{isEmoji && <div className="emojiBox">
								<EmojiPicker lazyLoadEmojis={true} onEmojiClick={( e ) => {
									setMsg( msg + e.emoji ),
										setIsEmoji( false )
								}} />
							</div>}
							<input type="text" placeholder="Enter your message" value={msg} onKeyDown={( e ) => {
								if ( e.keyCode === 13 ) {
									handleOpenChat( 'general', undefined );
								}
							}} onChange={( e ) => setMsg( e.target.value )} />
							<button className="send-btn" onClick={() => handleClick()} disabled={msg === '' || msg.length <= 0}>
								<span class="iconify" data-icon="majesticons:send"></span>
							</button>
						</div>
					</Tab>
					<Tab eventKey="profile" title="Table Chats" className="pt-1">
						<div className="positon-relative">
							<div className="chats" id="chats">
								{tableChat?.map( ( item, index ) => {
									return ( <div class="message-box">
										<div class="message-profile me-2">
											<div class="image-user me-2">
												<img src="/assets/images/fav-logo.jpeg" alt="Platinum 1" scale="0.72" class="css-10qm6dq" />
											</div>
											<div class="user-name" style={{ color: "rgb(25, 197, 255)", fontWeight: 600 }}>RealLifeKyle:</div>
										</div>
										<span class="message-text" ><span class="text-white">@W㋡Shark🦈</span>  Interesting. Yeah I can see that</span>
									</div> )
								} )}
								{tableChat.length == 0 && <div className="d-flex justify-content-center align-items-center h-100 text-white">
									Currently no joinned table
								</div>}
							</div>
							<div className="code-input msg-input position-relative">
								<div className="emoji" onClick={() => setIsEmoji( true )}>
									<span class="iconify" data-icon="fluent:emoji-32-regular"></span>
								</div>
								{isEmoji && <div className="emojiBox">
									<EmojiPicker lazyLoadEmojis={true} onEmojiClick={( e ) => {
										setMsg( msg + e.emoji ),
											setIsEmoji( false )
									}} />
								</div>}
								<input type="text" placeholder="Enter your message" value={msg} onKeyDown={( e ) => {
									if ( e.keyCode === 13 ) {
										handleOpenChat( 'ingame', req.params.id );
									}
								}} onChange={( e ) => setMsg( e.target.value )} />
								<button className="send-btn" onClick={() => handleClick()} disabled={msg === '' || msg.length <= 0}>
									<span class="iconify" data-icon="majesticons:send"></span>
								</button>
							</div>
						</div>

					</Tab>

				</Tabs>
			</div>

			<a href="javascript:void(0)" className="cross-chat" onClick={() => setShowChat( false )}>
				<span class="iconify" data-icon="maki:cross"></span>
			</a>
		</div>


	</div>;
};

export default RightSidebar;
