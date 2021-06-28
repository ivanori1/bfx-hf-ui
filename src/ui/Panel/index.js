import React, { useState } from 'react'
import Scrollbars from 'react-custom-scrollbars'
import ClassNames from 'classnames'
import PropTypes from 'prop-types'

import './style.css'

const getTabTitle = (tab) => { // eslint-disable-line
  const { htmlKey, tabtitle } = tab.props
  if (typeof tabtitle === 'string') {
    return tabtitle
  }
  if (!htmlKey) console.trace('htmlKey missing')
  return htmlKey
}

const getForcedTab = (forcedTab, tabs) => { // eslint-disable-line
  for (let i = 0; i < tabs.length; i++) {
    if (tabs[i].props.tabtitle === forcedTab) {
      return i
    }
  }
}

const Panel = (props) => {
  const {
    label,
    className,
    onRemove,
    hideIcons,
    children,
    headerComponents,
    extraIcons,
    moveable,
    removeable,
    modal,
    footer,
    settingsOpen,
    onToggleSettings,
    darkHeader,
    dark,
    showChartMarket,
    chartMarketSelect,
    secondaryHeaderComponents,
    closePanel,
    preHeaderComponents,
    dropdown,
    forcedTab,
    headerRef,
  } = props
  const tabs = React.Children.toArray(children).filter(c => c && c.props.tabtitle)
  const initTab = forcedTab.length ? getForcedTab(forcedTab, tabs) : 0
  const [selectedTab, setSelectedTab] = useState(initTab)

  return (
    <div
      className={ClassNames('hfui-panel', className, {
        'dark-header': darkHeader,
        dark,
      })}
    >
      <div
        className={ClassNames('hfui-panel__header', {
          'has-secondary-header': !!secondaryHeaderComponents,
        })}
        ref={headerRef}
      >
        <div className='hfui-panel__left-container'>
          {label && <p className='hfui-panel__label'>{label}</p>}
          {headerComponents && (
            <div className='hfui-panel__header-components'>
              {headerComponents}
            </div>
          )}
        </div>
        <div className='hfui-panel__buttons-section'>
          {preHeaderComponents && (
          <div className='hfui-panel__preheader'>
            {preHeaderComponents}
          </div>
          )}
          {closePanel && (
          <p className='hfui-panel__close' onClick={closePanel}>&#10005;</p>
          )}
        </div>
        {tabs.length > 0 && (
        <ul className='hfui-panel__header-tabs'>
          {tabs.map((tab, index) => (
            <li
              key={tab.props.htmlKey || tab.props.tabtitle}
              className={ClassNames({ active: getTabTitle(tab) === getTabTitle(tabs[selectedTab]) })}
              onClick={() => setSelectedTab(index)}
            >
              <p className='hfui-panel__label'>
                {tab.props.tabtitle}
              </p>
            </li>
          ))}
        </ul>
        )}

        {!hideIcons && (
        <div className='hfui-panel__header-icons'>
          {removeable && (
          <i onClick={onRemove} className='icon-cancel' />
          )}

          {moveable && <i className='icon-move' />}

          {showChartMarket && (
          <div className='hfui-panel__chart-market-select'>
            {chartMarketSelect}
          </div>
          )}

          {onToggleSettings && (
          <i
            onClick={onToggleSettings}
            className={ClassNames('icon-settings-icon', {
              yellow: settingsOpen,
            })}
          />
          )}

          {extraIcons}

          {dropdown}
        </div>
        )}
      </div>

      {secondaryHeaderComponents && (
      <div
        className='hfui-panel__secondaryheader__wrapper'
      >
        {secondaryHeaderComponents}
      </div>
      )}

      <div className='hfui-panel__content'>
        {modal}

        <Scrollbars
          renderTrackVertical={compProps => (
            <div {...compProps} className='hfui-scrollbars-track-vertical' />
          )}
          renderThumbVertical={compProps => (
            <div {...compProps} className='hfui-scrollbars-thumb-vertical' />
          )}
        >
          {tabs.length > 0 ? tabs[selectedTab] : children}
        </Scrollbars>
      </div>

      {footer && (
      <div className='hfui-panel__footer'>{footer}</div>
      )}
    </div>
  )
}

Panel.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  onRemove: PropTypes.func,
  headerComponents: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  secondaryHeaderComponents: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  hideIcons: PropTypes.bool,
  extraIcons: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  moveable: PropTypes.bool,
  removeable: PropTypes.bool,
  modal: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  darkHeader: PropTypes.bool,
  dark: PropTypes.bool,
  htmlKey: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  footer: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  settingsOpen: PropTypes.bool,
  onToggleSettings: PropTypes.func,
  showChartMarket: PropTypes.bool,
  chartMarketSelect: PropTypes.node,
  closePanel: PropTypes.func,
  preHeaderComponents: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
  forcedTab: PropTypes.string,
  dropdown: PropTypes.node,
  headerRef: PropTypes.oneOfType([
    PropTypes.func,
    PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
  ]),
}

Panel.defaultProps = {
  moveable: true,
  removeable: true,
  darkHeader: false,
  dark: false,
  className: '',
  label: '',
  onRemove: () => {},
  headerComponents: null,
  secondaryHeaderComponents: null,
  hideIcons: false,
  extraIcons: null,
  children: [],
  modal: null,
  footer: null,
  htmlKey: '',
  settingsOpen: false,
  onToggleSettings: null,
  showChartMarket: false,
  chartMarketSelect: null,
  closePanel: null,
  preHeaderComponents: null,
  forcedTab: '',
  dropdown: null,
  headerRef: null,
}

export default Panel
