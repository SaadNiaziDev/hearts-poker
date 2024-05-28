import React, { useEffect, useState } from 'react'
import { erc721ABI, useContractRead } from 'wagmi'

const useNftHook = ( { address, nftAddress } ) => {
    const { data, isLoading, isError, isSuccess } = useContractRead( {
        address: nftAddress,
        abi: erc721ABI,
        functionName: 'balanceOf',
        args: [ address ],
    } )
    useEffect( () => {
        console.log( data )
    }, [] );

    if ( isLoading || isError ) return [ 0 ];
    if ( isSuccess ) return [ Number( data ) ]
}

export default useNftHook



