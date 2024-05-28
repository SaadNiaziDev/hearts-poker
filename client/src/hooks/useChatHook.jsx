import React, { useEffect, useState } from 'react'
import { apiURL } from '../constants'
import { useStore } from '../store/store';


const useChatHook = () => {
    const token = useStore( ( state ) => state.token );
    const [ chat, setChat ] = useState( [] );
    const [ isLoading, setIsLoading ] = useState( false );
    const getGeneralChat = () => {
        setIsLoading( true );
        fetch( apiURL + '/chats/general', {
            headers: {
                'Content-Type': 'application/json',
                'Authorization': 'Bearer ' + token,
            }
        } ).then( response => response.json() ).then( ( response ) => {
            if ( response.status === 200 ) {
                // console.log( response.data );
                setIsLoading( false );
                setChat( response.data.messages )
            }
        } ).catch( ( e ) => {
            console.log( e );
            setIsLoading( false );
        } )

    }

    useEffect( () => {
        getGeneralChat();
    }, [] )

    if ( chat.length <= 0 && !isLoading ) return []
    return [ chat ]

}

export default useChatHook