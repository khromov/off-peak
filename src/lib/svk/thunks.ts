import { createAsyncThunk } from '@reduxjs/toolkit'
import moment from 'moment'
import { handledFetch } from '../http'
import * as Types from './types'

/**
 * @param last the number of hours to retrive
 */
export const getProfile = createAsyncThunk<string, { area: Types.Area; last?: number }>(
  'svk/getProfile',
  async (args) => {
    args = {
      last: 100,
      ...args,
    }

    const from = moment().subtract(args.last, 'hours').format('YYYY-MM-DD')
    const to = moment().format('YYYY-MM-DD')

    const params = [`periodFrom=${from}`, `periodTo=${to}`, `networkAreaIdString=${args.area}`]
    const url = `/api/v1/svkprofile?` + params.join('&')

    const response = await handledFetch(url, {
      method: 'GET',
    })

    return await response.text()
  }
)

export function parseCSV(csv: string) {
  let rows = csv.split('\n').slice(1)
  rows = rows.slice(0, rows.length - 2)

  const nodes: Types.ProfileNode[] = []
  for (const row of rows) {
    const cols = row.split(';')
    const node = {
      time: cols[0],
      // Data is reported in negative values since they are
      // consumption numbers. Flip it for convenience.
      value: parseFloat(cols[1]) * -1,
    }
    nodes.push(node)
  }
  return nodes
}
