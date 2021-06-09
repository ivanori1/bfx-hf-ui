import _map from 'lodash/map'
import _filter from 'lodash/filter'
import types from '../../constants/ws'
import marketTypes from '../../constants/market'

const getInitialState = () => {
  return []
}

export default (state = getInitialState(), action = {}) => {
  const { type, payload = {} } = action

  switch (type) {
    case types.DATA_MARKETS: {
      const { markets = [] } = payload

      return markets
    }

    case marketTypes.SET_CCY_FULL_NAMES: {
      const { names: [namesArr] } = payload
      const newState = _map(state, (market) => {
        const { quote, base } = market
        const defaultArray = [quote, base]
        const fullNamesArray = _filter(namesArr, (pair) => {
          const [shortName] = pair
          return shortName === quote || shortName === base
        }, defaultArray)

        let labels
        if (fullNamesArray.length === 0) {
          labels = [...defaultArray]
        }
        if (fullNamesArray.length === 1) {
          const fullName = fullNamesArray[0][1]
          labels = [...defaultArray, fullName]
        }
        if (fullNamesArray.length === 2) {
          const [firstPair, secondPair] = fullNamesArray
          labels = [...firstPair, ...secondPair]
        }
        // eslint-disable-next-line no-param-reassign
        const newMarketObject = {
          ...market,
          ccyLabels: labels,
        }

        return newMarketObject
      })
      return newState
    }

    default: {
      return state
    }
  }
}
