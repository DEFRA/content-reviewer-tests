import { config as browserstackConfig } from './wdio.browserstack.conf.js'
import { ProxyAgent, setGlobalDispatcher } from 'undici'
import { bootstrap } from 'global-agent'

const dispatcher = new ProxyAgent({
  uri: 'http://localhost:3128'
})
setGlobalDispatcher(dispatcher)
bootstrap()
global.GLOBAL_AGENT.HTTP_PROXY = process.env.HTTP_PROXY

browserstackConfig.services[0][1].opts = {
  binarypath: '/root/.browserstack/BrowserStackLocal',
  proxyHost: 'localhost',
  proxyPort: 3128
}

export const config = browserstackConfig
