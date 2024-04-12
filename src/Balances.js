import React, {useEffect, useState} from 'react'
import {useSubstrateState} from './substrate-lib'
import { formatBalance } from '@polkadot/util';
const acctAddr = acct => (acct ? acct.address : '')
export default function Main(props) {
    const {api, currentAccount} = useSubstrateState()
    const [accountBalance, setAccountBalance] = useState('none')

    formatBalance.setDefaults({
        decimals: 10,
        unit: 'PAS'
    });

// When account address changes, update subscriptions
    useEffect(() => {
        let unsubscribe

        // If the user has selected an address, create a new subscription
        currentAccount &&
        api.query.system
            .account(acctAddr(currentAccount), balance =>
                setAccountBalance(formatBalance(balance.data.free))
            )
            .then(unsub => (unsubscribe = unsub))
            .catch(console.error)

        return () => unsubscribe && unsubscribe()
    }, [api, currentAccount])

    return (
      <div>
          My L1 Balance: {accountBalance}
      </div>
    )
}
