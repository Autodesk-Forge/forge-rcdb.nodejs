import PropTypes from 'prop-types'
import Modal from 'react-modal'
import React from 'react'
import './ThemeDlg.scss'

export default class ThemeDlg extends React.Component {
  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  constructor () {
    super()

    this.items = [
      {
        css: '/resources/themes/forge.css',
        className: 'forge-theme',
        name: 'forge-theme',
        caption: 'Forge',
        viewer: {
          backgroundColor: [
            255, 226, 110,
            219, 219, 219
          ]
        },
        key: '1'
      },
      {
        css: '/resources/themes/snow-white.css',
        className: 'snow-theme',
        name: 'snow-white-theme',
        caption: 'Snow',
        viewer: {
          backgroundColor: [
            245, 245, 245,
            245, 245, 245
          ]
        },
        key: '2'
      }
    ]
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  close () {
    this.props.close()
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  onClick (item) {
    this.props.themeChange(item)
    this.props.saveAppState()
    this.props.close()
  }

  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  render () {
    return (
      <div>
        <Modal
          className='dialog theme'
          contentLabel=''
          isOpen={this.props.open}
          onRequestClose={() => { this.close() }}
        >

          <div className='title'>
            <img />
            <b>Select theme ...</b>
          </div>

          <div className='content responsive-grid'>

            {this.items.map((item) => {
              return (
                <a key={item.key} href='#' onClick={() => { this.onClick(item) }}>
                  <figure>
                    <img className={item.className} />
                    <figcaption>
                      {item.caption}
                    </figcaption>
                  </figure>
                </a>)
            })}
          </div>

        </Modal>
      </div>
    )
  }
}
