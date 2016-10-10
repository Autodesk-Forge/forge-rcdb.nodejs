import React, { PropTypes } from 'react'
import './LayoutSettingsDlg.scss'
import Modal from 'react-modal'

export default class LayoutSettingsDlg extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

    this.items = [
      {
        img: '/resources/img/split-layout-left.png',
        layoutType: 'splitLayoutLeft',
        caption: 'Split Layout - Left',
        key: '1'
      },
      {
        img: '/resources/img/split-layout-right.png',
        layoutType: 'splitLayoutRight',
        caption: 'Split Layout - Right',
        key: '2'
      },
      {
        img: '/resources/img/grid-layout.png',
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
    this.props.close()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div>
        <Modal className="dialog layout-settings"
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
                    <img src={item.img}/>
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
