import React, { useEffect, useState } from 'react'
import { Form, Input, Grid, Card, Statistic } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'
import { TxButton } from './substrate-lib/components'
import { IntegriteeWorker } from '@encointer/worker-api';
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
      worker.getShardVault().then((sk) => console.log(`Vault: ${sk.toHuman()}}`));
      // let keyring = new Keyring({type: "sr25519"});
      // let alice = keyring.addFromUri('//Alice', {name: 'Alice default'});
      // works: but get current shard empty error
      // worker.getBalance(alice, '7RuM6U4DLEtrTnVntDjDPBCAN4LbCGRpnmcTYUGhLqc7')
      //   .then((balance) => console.log(`Alice balance: ${balance.toHuman()}`))
      // //  works: but get current shard empty error
      // worker.getNonce(alice, '7RuM6U4DLEtrTnVntDjDPBCAN4LbCGRpnmcTYUGhLqc7')
      //   .then((nonce) => console.log(`Alice balance: ${nonce.toHuman()}`))
      // fails
      worker.getShieldingKey().then((key) => console.log(`Shielding key: ${JSON.stringify(key)}`));


    let unsubscribe
    api.query.system
      .palletVersion(newValue => {
        // The storage value is an Option<u32>
        // So we have to check whether it is None first
        // There is also unwrapOr
        if (newValue.isNone) {
          setCurrentValue('<None>')
        } else {
          setCurrentValue(newValue.unwrap().toNumber())
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
