/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { Form, Input, Grid, Label, Icon, Dropdown } from 'semantic-ui-react'
import { TxButton } from './substrate-lib/components'
// import { useSubstrateState } from './substrate-lib'
import { Keyring } from '@polkadot/keyring'
import {   mnemonicGenerate,   mnemonicToMiniSecret, mnemonicValidate, ed25519PairFromSeed } from '@polkadot/util-crypto'

import { useSubstrate, useSubstrateState } from './substrate-lib'
import {u8aToHex} from "@polkadot/util";

export default function Main(props) {
  const {
    setCurrentAccount,
    state: { keyring, currentAccount },
  } = useSubstrate()

  useEffect(() => {
    const storedAddress = sessionStorage.getItem('currentAccount');
    if (storedAddress) {
      setCurrentAccount(storedAddress);
    }
  }, []);

  const [mnemonic, setMnemonic] = useState('');
  const [status, setStatus] = useState(null)
  const [formState, setFormState] = useState({ addressTo: '', amount: 0 })

  const onChange = (_, data) =>
    setFormState(prev => ({ ...prev, [data.state]: data.value }))

  const { addressTo, amount } = formState

  const accounts = [currentAccount]
  const availableAccounts = []
  accounts.map(account => {
    return availableAccounts.push({
      key: account,
      text: account,
      value: account,
    })
  })

  const createAccount = async () => {
    const generatedMnemonic = mnemonicGenerate();
    //setMnemonic(generatedMnemonic); // Storing the mnemonic in state (hypothetically)
    const keyring = new Keyring({ type: 'sr25519', ss58Format: 42 });

    // Add account from mnemonic
    const account = keyring.addFromMnemonic(generatedMnemonic, { name: 'fresh' });

    // Create valid Substrate-compatible seed from mnemonic
    const seed = mnemonicToMiniSecret(generatedMnemonic);

    // Convert the private key to a hexadecimal string
    const privateKeyHex = u8aToHex(seed);
    console.log(`Private Key in Hex: ${privateKeyHex}`);
    console.log(keyring.getPairs());
    setCurrentAccount(account.address);

    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('seed', privateKeyHex);
    window.history.pushState({ path: currentUrl.href }, '', currentUrl.href);

    console.log(`New account created: ${account.address}`)
  };

  console.log(`Account: ${currentAccount}`)

  return (
    <Grid.Column width={8}>
      <h1>Transfer</h1>
      <Form>
        <Form.Field>
          <Label basic color="teal">
            <Icon name="hand point right" />1 Unit = 1000000000000&nbsp;
          </Label>
          <Label
            basic
            color="teal"
            style={{ marginLeft: 0, marginTop: '.5em' }}
          >
            <Icon name="hand point right" />
            Transfer more than the existential amount for account with 0 balance
          </Label>
        </Form.Field>

        <Form.Field>
          <Input
            fluid
            label="To"
            type="text"
            placeholder="address"
            value={addressTo}
            state="addressTo"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field>
          <Input
            fluid
            label="Amount"
            type="number"
            state="amount"
            onChange={onChange}
          />
        </Form.Field>
        <Form.Field style={{ textAlign: 'center' }}>
          <TxButton
            label="Submit"
            type="SIGNED-TX"
            setStatus={setStatus}
            attrs={{
              palletRpc: 'balances',
              callable: 'transferKeepAlive',
              inputParams: [addressTo, amount],
              paramFields: [true, true],
            }}
          />
          <button onClick={createAccount}>Create Account</button>
          {/* <TxButton accountAddress={accountAddress} /> */}
        </Form.Field>
        <div style={{ overflowWrap: 'break-word' }}>{status}</div>
      </Form>
    </Grid.Column>
  )
}
