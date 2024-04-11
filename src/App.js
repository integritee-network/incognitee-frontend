/* eslint-disable no-unused-vars */
import React, { createRef, useEffect } from 'react'
import {
  Container,
  Dimmer,
  Loader,
  Grid,
  Sticky,
  Message,
} from 'semantic-ui-react'
import 'semantic-ui-css/semantic.min.css'

import { SubstrateContextProvider, useSubstrate } from './substrate-lib'
import { DeveloperConsole } from './substrate-lib/components'

import AccountSelector from './AccountSelector'
import BlockNumber from './BlockNumber'
import Events from './Events'
import Interactor from './Interactor'
import Metadata from './Metadata'
import NodeInfo from './NodeInfo'
import TemplateModule from './TemplateModule'
import Transfer from './Transfer'
import Upgrade from './Upgrade'
import {cryptoWaitReady, mnemonicToMiniSecret} from '@polkadot/util-crypto';
import { Keyring } from '@polkadot/keyring';
import {bnFromHex, hexToU8a} from '@polkadot/util';

function Main() {
  const { setCurrentAccount, state: {apiState, apiError, keyring, keyringState} } = useSubstrate()
  // Function to get the seed from the URI
  const getSeedFromURI = () => {
    const searchParams = new URLSearchParams(window.location.search);
    return searchParams.get('seed');
  };

  const generateAndLogAccountFromSeed = (seedHex) => {
    const localKeyring = new Keyring({ type: 'sr25519' });
    const account = localKeyring.addFromSeed(hexToU8a(seedHex), { name: 'url-provided' });

    console.log(`Account address: ${account.address}`);
    keyring.addPair(account);
    console.log(keyring.getPairs());
    return account; // Return or use the account address as needed
  };

  useEffect(() => {
    const seedHex = getSeedFromURI();

    if ((seedHex) && (keyringState==='READY')){
      cryptoWaitReady().then(() => {
        setCurrentAccount(generateAndLogAccountFromSeed(seedHex))
      });
    }
  }, [keyringState]);

  const loader = text => (
    <Dimmer active>
      <Loader size="small">{text}</Loader>
    </Dimmer>
  )

  const message = errObj => (
    <Grid centered columns={2} padded>
      <Grid.Column>
        <Message
          negative
          compact
          floating
          header="Error Connecting to Substrate"
          content={`Connection to websocket '${errObj.target.url}' failed.`}
        />
      </Grid.Column>
    </Grid>
  )

  if (apiState === 'ERROR') return message(apiError)
  else if (apiState !== 'READY') return loader('Connecting to Substrate')

  if (keyringState !== 'READY') {
    return loader(
      "Loading accounts (please review any extension's authorization)"
    )
  }

  const contextRef = createRef()

  return (
    <div ref={contextRef}>
      <Sticky context={contextRef}>
        <AccountSelector />
      </Sticky>
      <Container>
        <Grid stackable columns="equal">
          <Grid.Row stretched>
            <NodeInfo />
            <Metadata />
            <BlockNumber />
            <BlockNumber finalized />
          </Grid.Row>
          <Grid.Row>
            <Transfer />
            <Upgrade />
          </Grid.Row>
          <Grid.Row>
            <Interactor />
            <Events />
          </Grid.Row>
          <Grid.Row>
            <TemplateModule />
          </Grid.Row>
        </Grid>
      </Container>
      <DeveloperConsole />
    </div>
  )
}

export default function App() {
  return (
    <SubstrateContextProvider>
      <Main />
    </SubstrateContextProvider>
  )
}
