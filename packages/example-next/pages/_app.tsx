import '../styles/globals.css'
import type { AppProps } from 'next/app'
import { getConnectors, useEagerlyConnect, Web3ReactProvider } from 'hipo-wallet'

const connectors = getConnectors({ 1: ['https://mainnet.infura.io/v3/'] })
function MyApp({ Component, pageProps }: AppProps) {
  useEagerlyConnect()

  return <Web3ReactProvider connectors={connectors} >
    <Component {...pageProps} />
  </ Web3ReactProvider>
}

export default MyApp
