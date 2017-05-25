import PropTypes from 'prop-types'
import Modal from 'react-modal'
import './LayoutDlg.scss'
import React from 'react'

export default class LayoutDlg extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

    this.items = [
      {
        className: 'split-layout-left',
        layoutType: 'flexLayoutLeft',
        caption: 'Split Layout - Left',
        key: '1'
      },
      {
        className: 'split-layout-right',
        layoutType: 'flexLayoutRight',
        caption: 'Split Layout - Right',
        key: '2'
      },
      {
        className: 'grid-layout',
        layoutType: 'gridLayout',
        caption: 'Grid Layout',
        key: '3'
      }
    ]
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  close () {

    this.props.close()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  onClick (item) {

    this.props.layoutChange(item.layoutType)
    this.props.saveAppState()
    this.props.close()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div>
        <Modal className="dialog layout"
          contentLabel=""
          isOpen={this.props.open}
          onRequestClose={() => {this.close()}}>

          <div className="title">
            <img/>
            <b>Select layout type ...</b>
          </div>

          <div className="content responsive-grid">

            {this.items.map((item) => {
              return (
                <a key={item.key} href="#" onClick={()=>{this.onClick(item)}}>
                  <figure>
                    <img className={item.className}/>
                    <figcaption>
                    {item.caption}
                    </figcaption>
                  </figure>
                </a>)
              })
            }
          </div>

        </Modal>
      </div>
    )
  }
}
