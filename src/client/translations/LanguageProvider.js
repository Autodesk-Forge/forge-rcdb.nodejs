import React from 'react'
import { connect } from 'react-redux'
import { IntlProvider } from 'react-intl'

import { DEFAULT_LOCALE, SUPPORT_LANG } from './languages'

export class LanguageProvider extends React.PureComponent {
  render() {
    const { messages } = this.props
    const locale = SUPPORT_LANG[DEFAULT_LOCALE] // can be set in global state/reducer
    return (
      <IntlProvider locale={locale} key={locale} messages={messages[locale]}>
        {React.Children.only(this.props.children)}
      </IntlProvider>
    );
  }
}

LanguageProvider.propTypes = {
  messages: React.PropTypes.object,
  children: React.PropTypes.element.isRequired
};

export default connect()(LanguageProvider)
