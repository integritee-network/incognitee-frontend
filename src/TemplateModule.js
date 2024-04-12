import React, { useEffect, useState } from 'react'
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
import { IntegriteeWorker } from '@encointer/worker-api';
import {Keyring} from "@polkadot/keyring";
function Main(props) {
  const { api } = useSubstrateState()


  // The transaction submission status
  const [status, setStatus] = useState('')

  // The currently stored value
  const [currentValue, setCurrentValue] = useState(0)
  const [formValue, setFormValue] = useState(0)

  useEffect(() => {
      const worker = new IntegriteeWorker('wss://scv1.paseo.api.incognitee.io:443', {
        createWebSocket: (url) => new WebSocket(url),
        types: api.registry.types
      })
    // works
    // worker.getShardVault().then((sk) => console.log(`Vault: ${sk.toHuman()}}`));
    let keyring = new Keyring({type: "sr25519"});
    let alice = keyring.addFromUri('//Alice', {name: 'Alice default'});
    let bob = keyring.addFromUri('//Bob', {name: 'Alice default'});
    // works: but get current shard empty error
    const shard = '5wePd1LYa5M49ghwgZXs55cepKbJKhj5xfzQGfPeMS7c';
    const mrenclave = '7RuM6U4DLEtrTnVntDjDPBCAN4LbCGRpnmcTYUGhLqc7';
    // try {
    //   worker.getBalance(alice, shard)
    //     .then((balance) => console.log(`Alice balance: ${balance}`));
    // } catch (error) {
    //   console.log(`Error getting Alice's balance: ${error}`)
    // }
    // try {
    //   worker.getNonce(alice, shard)
    //     .then((nonce) => console.log(`Alice balance: ${nonce}`));
    // } catch (error) {
    //   console.log(`Error getting Alice's nonce: ${error}`)
    // }
    //

    try {
      // this does only call `author_submit`, so we can only know if the trusted call is valid, but we
      // can't know here if the trusted call has been executed without an error.
      worker.trustedBalanceTransfer(
        alice,
        shard,
        mrenclave,
        alice.address,
        bob.address,
        1100000000000
        ).then((hash) => console.log(`trustedOperationHash: ${hash}`));

      // worker.getShieldingKey()
      //   .then((sk) => {
      //     console.log("encrypting hello");
      //     sk.encrypt("hello");
      //     console.log("encrypted hello")
      //   });

    } catch (error) {
      console.log(`Error submitting the trusted operation: ${error}`)
    }

    let unsubscribe
    api.query.system
      .palletVersion(newValue => {
        // The storage value is an Option<u32>
        // So we have to check whether it is None first
        // There is also unwrapOr
        if (newValue.isNone) {
          setCurrentValue('<None>')
        } else {
          // setCurrentValue(newValue.unwrap().toNumber())
        }
      })
      .then(unsub => {
        unsubscribe = unsub
      })
      .catch(console.error)

    return () => unsubscribe && unsubscribe()
  }, [api.query.system, api])

  return (
    <Grid.Column width={8}>
      <h1>Template Module</h1>
      <Card centered>
        <Card.Content textAlign="center">
          <Statistic label="Current Value" value={currentValue} />
        </Card.Content>
      </Card>
      <Form>
        <Form.Field>
          <Input
            label="New Value"
            state="newValue"
            type="number"
            onChange={(_, { value }) => setFormValue(value)}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
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
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}

export default function TemplateModule(props) {
  const { api } = useSubstrateState()
  return api.query.system && api.query.system ? (
    <Main {...props} />
  ) : null
}
