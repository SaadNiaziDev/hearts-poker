import React, { useEffect, useState } from 'react'

const useGetNft = () => {
    const [ data, setData ] = useState( [] );
    async function getNFTs( owner ) {
        let nftData = await fetch( `https://eth-mainnet.g.alchemy.com/nft/v2/sgaC0taaUx2aP38ruOoR1dpkyeFCJb0t/getNFTs?owner=${owner}&withMetadata=true&pageSize=100`, {
            headers: {
                'Content-Type': 'application/json',
            }
        } ).then( ( response ) => response.json() );
        console.log( nftData );
        setData( nftData );
    }

    useEffect( () => {
        getNFTs( '0x62c93856d4929C396B9e43Cc85115Ffd47B070C5' );

    }, [] );
    if ( data ) return [ data ];
    return []
}

export default useGetNft