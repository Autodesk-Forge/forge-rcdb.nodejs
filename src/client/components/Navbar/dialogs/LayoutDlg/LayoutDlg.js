import React, { PropTypes } from 'react'
import Modal from 'react-modal'
import './LayoutDlg.scss'

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
        layoutType: 'splitLayoutLeft',
        caption: 'Split Layout - Left',
        key: '1'
      },
      {
        className: 'split-layout-right',
        layoutType: 'splitLayoutRight',
        caption: 'Split Layout - Right',
        key: '2'
      },
      {
        className: 'grid-layout',
        layoutType: 'gridLayout',
        caption: 'Grid Layout',
        key: '3'
      },
      {
        className: 'grid-layout',
        layoutType: 'jqueryLayoutRight',
        caption: 'JQuery',
        key: '4'
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
