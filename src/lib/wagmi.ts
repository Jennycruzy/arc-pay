import { http, createConfig, fallback } from 'wagmi'
import { injected } from 'wagmi/connectors'
import { arcTestnet } from './arcChain'

export const config = createConfig({
  chains: [arcTestnet],
  connectors: [
    injected(),
  ],
  transports: {
    [arcTestnet.id]: fallback([
      http('https://rpc.testnet.arc.network'),
      http('https://rpc.blockdaemon.testnet.arc.network'),
      http('https://arc-testnet.drpc.org'),
      http('https://rpc.quicknode.testnet.arc.network'),
    ]),
  },
})
