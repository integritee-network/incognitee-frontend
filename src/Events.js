import React, { useEffect, useState } from 'react'
import { Feed, Grid, Button } from 'semantic-ui-react'

import { useSubstrateState } from './substrate-lib'

const eventName = ev => `${ev.section}:${ev.method}`

function Main(props) {
  const { api, vaultAccount } = useSubstrateState()
  const [eventFeed, setEventFeed] = useState([])

  useEffect(() => {
    let unsub = null
    let keyNum = 0
    const allEvents = async () => {
      unsub = await api.query.system.events(events => {
        // loop through the Vec<EventRecord>
        events.forEach(record => {
          // extract the phase, event and the event types
          const { event } = record
          // show what we are busy with
          const evHuman = event.toHuman()
          const evName = eventName(evHuman)
          if (evName === 'balances:Transfer') {
            const {from, to, amount } = evHuman.data;
            if (to === vaultAccount) {
              setEventFeed(e => [
                {
                  key: keyNum,
                  icon: 'bell',
                  summary: evName + ' shielding',
                  content: 'from: ' + from + ' amount: ' + amount,
                },
                ...e,
              ])
              keyNum += 1
            }
          }
        })
      })
    }

    allEvents()
    return () => unsub && unsub()
  }, [api.query.system, vaultAccount])

  const { feedMaxHeight = 250 } = props

  return (
    <Grid.Column width={8}>
      <h1 style={{ float: 'left' }}>Events on L1</h1>
      <Button
        basic
        circular
        size="mini"
        color="grey"
        floated="right"
        icon="erase"
        onClick={_ => setEventFeed([])}
      />
      <Feed
        style={{ clear: 'both', overflow: 'auto', maxHeight: feedMaxHeight }}
        events={eventFeed}
      />
    </Grid.Column>
  )
}

export default function Events(props) {
  const { api } = useSubstrateState()
  return api.query && api.query.system && api.query.system.events ? (
    <Main {...props} />
  ) : null
}
