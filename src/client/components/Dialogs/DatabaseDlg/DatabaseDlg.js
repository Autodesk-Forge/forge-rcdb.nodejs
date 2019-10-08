import PropTypes from 'prop-types'
import Modal from 'react-modal'
import './DatabaseDlg.scss'
import React from 'react'

export default class DatabaseDlg extends React.Component {
  /// //////////////////////////////////////////////////////////////
  //
  //
  /// //////////////////////////////////////////////////////////////
  constructor () {
    super()

    this.items = [

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
    this.props.onSelectItem(item)
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
          className='dialog database'
          contentLabel=''
          isOpen={this.props.open}
          onRequestClose={() => { this.close() }}
        >

          <div className='title'>
            <img />
            <b>Select Database ...</b>
          </div>

          <div className='content responsive-grid'>

          NOT YET IMPLEMENTED :( ...

            {this.items.map((item) => {
              return (
                <a key={item.key} href='#' onClick={() => { this.onClick(item) }}>
                  <figure>
                    <img src={item.img} />
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
