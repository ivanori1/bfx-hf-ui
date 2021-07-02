import React from 'react'
import randomColor from 'randomcolor'
import PropTypes from 'prop-types'
import _remove from 'lodash/remove'
import Joyride, { STEPS, STATUS } from '../../components/Joyride'

import Layout from '../../components/Layout'

import Panel from '../../ui/Panel'
import Markdown from '../../ui/Markdown'
import Backtester from '../../components/Backtester'
// import LiveStrategyExecutor from '../../components/LiveStrategyExecutor'
import StrategyEditor from '../../components/StrategyEditor'

import './style.css'

const DocsPath = require('bfx-hf-strategy/docs/api.md')

export default class StrategyEditorPage extends React.Component {
  state = {
    indicators: [],
  }

  componentDidMount() {
    // load readme docs (DocsPath is an object when running in electron window)
    const docsPath = typeof DocsPath === 'object' ? DocsPath.default : DocsPath
    fetch(docsPath)
      .then(response => response.text())
      .then(t => this.setState(() => ({ docsText: t })))
  }

  onAddIndicator = (indicator) => {
    this.setState(({ indicators }) => ({
      indicators: [...indicators, indicator],
    }))
  }

  onDeleteIndicator = (index) => {
    this.setState(({ indicators }) => ({
      indicators: _remove(indicators, (_, id) => id !== index),
    }))
  }

  onIndicatorsChange = (indicators) => {
    // TODO: Better color generation; to save time we generate enough colors for
    //       all indicators here, but optimally we'd switch on i.constructor.ui
    this.setState(() => ({
      indicators: Object.values(indicators).map((ind) => {
        let colors = []

        for (let i = 0; i < 5; i += 1) {
          colors.push(randomColor())
        }

        // allow users to overwrite colors
        if (ind.color) {
          colors[0] = ind.color
        } else if (ind.colors) {
          colors = ind.colors // eslint-disable-line
        }

        return [ind.constructor, ind._args, colors]
      }),
    }))
  }

  onGuideFinish = (data) => {
    const { finishGuide } = this.props
    const { status } = data
    const finishedStatuses = [STATUS.FINISHED, STATUS.SKIPPED]
    const CLOSE = 'close'
    if (finishedStatuses.includes(status) || data.action === CLOSE) {
      finishGuide()
    }
  }

  setContent = (content) => {
    const { setStrategyContent } = this.props
    // this.setState(() => ({ strategyContent: content }))
    this.setState(() => ({ forcedTab: 'Backtest' }))
    setStrategyContent(content)
  }

  selectStrategy = (content) => {
    const { selectStrategy } = this.props
    selectStrategy()
    this.setContent(content)
  }

  render() {
    const {
      indicators,
      // strategyContent,
      docsText = '',
      forcedTab = '',
    } = this.state
    const { firstLogin, isGuideActive } = this.props
    return (
      <Layout>
        <Layout.Header />
        <Layout.Main className='hfui-strategyeditorpage__wrapper'>
          <div className='hfui-strategyeditorpage__content-wrapper'>
            <StrategyEditor
              dark
              onStrategySelect={content => this.selectStrategy(content)}
              onStrategyChange={content => this.setContent(content)}
              key='editor'
              onIndicatorsChange={this.onIndicatorsChange}
              moveable={false}
              removeable={false}
              tf='1m'
            />
            {firstLogin && (
              <Joyride
                steps={STEPS.STRATEGY_EDITOR}
                callback={this.onGuideFinish}
                run={isGuideActive}
              />
            )}
            <div
              key='main'
              className='hfui-strategiespage__right'
            >
              <Panel
                className='hfui-strategiespage__pannel-wrapper'
                moveable={false}
                removeable={false}
                forcedTab={forcedTab}
                darkHeader
              >
                <Markdown
                  tabtitle='Docs'
                  text={docsText}
                />
                <div
                  tabtitle='Backtest'
                >
                  <Backtester
                    {...this.props}
                    indicators={indicators}
                    onAddIndicator={this.onAddIndicator}
                    onDeleteIndicator={this.onDeleteIndicator}
                  />
                </div>
                {/* hidden until this feature will be implemented
                <div
                  tabtitle='Execute'
                >
                  <LiveStrategyExecutor
                    strategyContent={strategyContent}
                  />
                </div> */}
              </Panel>
            </div>
          </div>
        </Layout.Main>
        <Layout.Footer />
      </Layout>
    )
  }
}

StrategyEditorPage.propTypes = {
  dark: PropTypes.bool,
  firstLogin: PropTypes.bool,
  isGuideActive: PropTypes.bool,
  finishGuide: PropTypes.func.isRequired,
  selectStrategy: PropTypes.func.isRequired,
  setStrategyContent: PropTypes.func.isRequired,
  // strategyContent: PropTypes.objectOf(Object),
}

StrategyEditorPage.defaultProps = {
  dark: true,
  firstLogin: false,
  isGuideActive: true,
  // strategyContent: {},
}
