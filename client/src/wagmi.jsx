import { createConfig, configureChains, mainnet } from 'wagmi'
import { MetaMaskConnector } from 'wagmi/connectors/metaMask'
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect'
import { publicProvider } from 'wagmi/providers/public'
const walletConnectProjectId = "ba7804e457fbb5f1375cbdc14e679617";

const { chains, publicClient, webSocketPublicClient } = configureChains(
    [ mainnet ],
    [ publicProvider() ],
)

export const config = createConfig( {
    autoConnect: true,
    chains,
    connectors: [ new MetaMaskConnector( {
        chains: chains,
        options: {
            shimDisconnect: false,
        },
    } ),
    new WalletConnectConnector( {
        chains: chains,
        options: {
            projectId: walletConnectProjectId,
            metadata: {
                name: 'Token Society',
                description: 'Token Society',
                url: 'https://token-society.netlify.app/',
                icons: [ 'https://token-society.netlify.app/assets/images/Logo2.svg' ],
            },
            showQrModal: true,
        },
    } ) ],
    publicClient,
    webSocketPublicClient,
} )
