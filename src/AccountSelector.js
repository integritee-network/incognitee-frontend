/* eslint-disable no-unused-vars */
import React, { useState, useEffect } from 'react'
import { CopyToClipboard } from 'react-copy-to-clipboard'
import { encodeAddress } from '@polkadot/util-crypto';

import {
  Menu,
  Button,
  Dropdown,
  Container,
  Icon,
  Image,
  Label,
} from 'semantic-ui-react'

import { useSubstrate, useSubstrateState } from './substrate-lib'

const CHROME_EXT_URL =
  'https://chrome.google.com/webstore/detail/polkadot%7Bjs%7D-extension/mopnmbcafieddcagagdcbnhejhlodfdd'
const FIREFOX_ADDON_URL =
  'https://addons.mozilla.org/en-US/firefox/addon/polkadot-js-extension/'

const acctAddr = acct => (acct ? acct.address : '')

function Main(props) {
  const {
    setCurrentAccount,
    state: { keyring, currentAccount },
  } = useSubstrate()

  // Get the list of accounts we possess the private key for
  const keyringOptions = keyring.getPairs().map(account => ({
    key: account.address,
    value: account.address,
    text: account.meta.name.toUpperCase(),
    icon: 'user',
  }))

  const initialAddress =
    keyringOptions.length > 0 ? keyringOptions[0].value : ''

  // Set the initial address
  // useEffect(() => {
  //   // `setCurrentAccount()` is called only when currentAccount is null (uninitialized)
  //   !currentAccount &&
  //     initialAddress.length > 0 &&
  //     setCurrentAccount(keyring.getPair(initialAddress))
  // }, [currentAccount, setCurrentAccount, keyring, initialAddress])

  console.log(`Account: ${currentAccount}`)

  const onChange = addr => {
    console.log(keyring.getPair(addr))
    //setCurrentAccount(keyring.getPair(addr))
  }

  return (
    <Menu
      attached="top"
      tabular
      style={{
        backgroundColor: '#fff',
        borderColor: '#fff',
        paddingTop: '1em',
        paddingBottom: '1em',
      }}
    >
      <Container>
        <Menu.Menu>
          <Image
            src={`${process.env.PUBLIC_URL}/assets/substrate-logo.png`}
            size="mini"
          />
        </Menu.Menu>
        <Menu.Menu position="right" style={{ alignItems: 'center' }}>
          {/* {!currentAccount ? (
            <span>
              Create an account with Polkadot-JS Extension (
              <a target="_blank" rel="noreferrer" href={CHROME_EXT_URL}>
                Chrome
              </a>
              ,&nbsp;
              <a target="_blank" rel="noreferrer" href={FIREFOX_ADDON_URL}>
                Firefox
              </a>
              )&nbsp;
            </span>
          ) : null} */}
          {!currentAccount ? (
            <span>
              Please generate a new account&nbsp;
            </span>
          ) : null}
          <CopyToClipboard text={currentAccount}>
            <Button
              basic
              circular
              size="large"
              icon="user"
              color={currentAccount ? 'green' : 'red'}
            />
          </CopyToClipboard>
          <span>{currentAccount}</span>
          {/* <Dropdown
            search
            selection
            clearable
            placeholder="Select an account"
            options={keyringOptions}
            onChange={(_, dropdown) => {
              onChange(dropdown.value)
            }}
            value={acctAddr(currentAccount)}
          /> */}
          {/* <BalanceAnnotation /> */}
          <TempBalanceAnnotation />
        </Menu.Menu>
      </Container>
    </Menu>
  )
}

function BalanceAnnotation(props) {
  const { api, currentAccount } = useSubstrateState()
  const [accountBalance, setAccountBalance] = useState(0)

  // When account address changes, update subscriptions
  useEffect(() => {
    let unsubscribe

    // If the user has selected an address, create a new subscription
    currentAccount &&
      api.query.system
        .account(acctAddr(currentAccount), balance =>
          setAccountBalance(balance.data.free.toHuman())
        )
        .then(unsub => (unsubscribe = unsub))
        .catch(console.error)

    return () => unsubscribe && unsubscribe()
  }, [api, currentAccount])

  return currentAccount ? (
    <Label pointing="left">
      <Icon name="money" color="green" />
      {accountBalance}
    </Label>
  ) : null
}

function TempBalanceAnnotation(props) {
  const { api, currentAccount } = useSubstrateState()
  const [balance, setBalance] = useState(0);

  useEffect(() => {
    const fetchBalance = async () => {
      try {
        // Fetch the account balance
        const { data: { free: currentBalance } } = await api.query.system.account(currentAccount);
        console.log(encodeAddress(currentAccount, 42));

        // Update state with the balance
        setBalance(currentBalance.toString());
        console.log(currentBalance.toString());
      } catch (error) {
        console.error(error);
        setBalance('Error fetching balance');
      }
    };

    if (currentAccount) {
      fetchBalance();
    }
  }, [currentAccount]);

  return currentAccount ? (
    <Label pointing="left">
      <Icon name="money" color="green" />
      {balance}
    </Label>
  ) : null
};

export default function AccountSelector(props) {
  const { api, keyring } = useSubstrateState()
  return keyring.getPairs && api.query ? <Main {...props} /> : null
}
