import React, {useEffect, useState} from 'react'
import {Form, Input, Grid} from 'semantic-ui-react'

import {useSubstrate, useSubstrateState} from './substrate-lib'
import {TxButton} from './substrate-lib/components'
import {IntegriteeWorker} from '@encointer/worker-api';
//import {Keyring} from "@polkadot/keyring";
import { formatBalance } from '@polkadot/util';

function Main(props) {
  const {setVaultAccount, state: {api, currentAccount}} = useSubstrate()
  // The transaction submission status
  const [status, setStatus] = useState('')
  // The currently stored value
  const [formValue, setFormValue] = useState(0)
  const [incogniteeBalance, setIncogniteeBalance] = useState(0)

    formatBalance.setDefaults({
        decimals: 10,
        unit: 'iPAS'
    });

  useEffect(() => {
    const worker = new IntegriteeWorker('wss://scv1.paseo.api.incognitee.io:443', {
      createWebSocket: (url) => new WebSocket(url),
      types: api.registry.types
    })
    // works
    worker.getShardVault().then((sk) => {
      setVaultAccount(sk[0].toHuman())
      console.log('Vault: ')
      console.log(sk[0])
    });
    const shard = '5wePd1LYa5M49ghwgZXs55cepKbJKhj5xfzQGfPeMS7c';

    // works

    //
    // // works: get balance of an account for a shard
    worker.getBalance(currentAccount, shard)
         .then((balance) => {
           setIncogniteeBalance(formatBalance(balance))
           console.log(`current account balance L2: ${balance}`)
         });
    //
    // // works: get the nonce of an account for a shard.
    // // We don't actually need to use this. `trustedBalanceTransfer` uses this internally.
    //   worker.getNonce(alice, shard)
    //     .then((nonce) => console.log(`Alice balance: ${nonce}`));



    // try {
    //  const mrenclave = '7RuM6U4DLEtrTnVntDjDPBCAN4LbCGRpnmcTYUGhLqc7';
    // let keyring = new Keyring({type: "sr25519"});
    // let alice = keyring.addFromUri('//Alice', {name: 'Alice default'});
    // let bob = keyring.addFromUri('//Bob', {name: 'Alice default'});
    //   // this does only call `author_submit`, so we can only know if the trusted call is valid, but we
    //   // can't know here if the trusted call has been executed without an error.
    //   worker.trustedBalanceTransfer(
    //     alice,
    //     shard,
    //     mrenclave,
    //     alice.address,
    //     bob.address,
    //     1100000000000
    //   ).then((hash) => console.log(`trustedOperationHash: ${hash}`));
    //
    // } catch (error) {
    //   console.log(`Error submitting the trusted operation: ${error}`)
    // }

  }, [api.query.system, api, currentAccount, setIncogniteeBalance])

  return (
    <Grid.Column width={8}>
      <h1>Incognitee L2</h1>
      <p>My L2 balance: {incogniteeBalance}</p>
      <Form>
        <Form.Field>
          <Input
            label="New Value"
            state="newValue"
            type="number"
            onChange={(_, {value}) => setFormValue(value)}
          />
        </Form.Field>
        <Form.Field style={{textAlign: 'center'}}>
          <TxButton
            label="Store Something"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'templateModule',
              callable: 'doSomething',
              inputParams: [formValue],
              paramFields: [true],
            }}
          />
        </Form.Field>
        <div style={{overflowWrap: 'break-word'}}>{status}</div>
      </Form>
    </Grid.Column>
  )
}

export default function TemplateModule(props) {
  const {api} = useSubstrateState()
  return api.query.system && api.query.system ? (
    <Main {...props} />
  ) : null
}
