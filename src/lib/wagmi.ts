import { http, createConfig } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { arcTestnet } from './arcChain'

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [arcTestnet.id]: http('https://rpc.testnet.arc.network'),
  },
})
