import React from 'react'

export default (authToken, cancelOrder, gaCancelOrder, { width }) => [{
  label: '',
  dataKey: '',
  width: 15,
  flexGrow: 0.15,
  cellRenderer: ({ rowData = {} }) => ( // eslint-disable-line
    <div className={`row-marker ${rowData.amount < 0 ? 'red' : 'green'} ${width < 700 ? 'stick' : ''} ${width < 450 ? 'stick2' : ''}`} />
  ),
  disableSort: true,
}, {
  label: 'Pair',
  dataKey: 'symbol',
  width: 145,
  flexGrow: 1.45,
  cellRenderer: ({ rowData = {} }) => rowData.symbol,
}, {
  label: 'Type',
  dataKey: 'type',
  width: 120,
  flexGrow: 1.2,
  cellRenderer: ({ rowData = {} }) => rowData.type,
}, {
  label: 'Created',
  dataKey: 'created',
  width: 155,
  flexGrow: 1.5,
  cellRenderer: ({ rowData = {} }) => new Date(+rowData.created).toLocaleString(),
}, {
  label: 'Amount',
  dataKey: 'amount',
  width: 100,
  flexGrow: 1,
  cellRenderer: ({ rowData = {} }) => ( // eslint-disable-line
    <span className={rowData.amount < 0 ? 'hfui-red' : 'hfui-green'}>{rowData.amount}</span>
  ),
}, {
  label: 'Price',
  dataKey: 'price',
  width: 100,
  flexGrow: 1,
  cellRenderer: ({ rowData = {} }) => rowData.price,
}, {
  label: 'Status',
  dataKey: 'status',
  width: 100,
  flexGrow: 1,
  cellRenderer: ({ rowData = {} }) => rowData.status,
}, {
  label: '',
  dataKey: 'cid',
  width: 40,
  flexGrow: 0.4,
  cellRenderer: ({ rowData = {} }) => ( // eslint-disable-line
    <div className='icons-cell'>
      <i
        role='button'
        tabIndex={0}
        className='icon-cancel'
        onClick={() => {
          cancelOrder(authToken, rowData)
          gaCancelOrder()
        }}
      />
    </div>
  ),
  disableSort: true,
}]
