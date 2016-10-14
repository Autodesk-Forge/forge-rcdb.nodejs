import React, { PropTypes } from 'react'
import Modal from 'react-modal'
import './DatabaseDlg.scss'

export default class DatabaseDlg extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

    this.items = [
      //{
      //  img: '/resources/img/split-layout-left.png',
      //  layoutType: 'splitLayoutLeft',
      //  caption: 'Split Layout - Left',
      //  key: '1'
      //},
      //{
      //  img: '/resources/img/split-layout-right.png',
      //  layoutType: 'splitLayoutRight',
      //  caption: 'Split Layout - Right',
      //  key: '2'
      //}
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
        <Modal className="dialog layout"
          isOpen={this.props.open}
          onRequestClose={() => {this.close()}}>

          <div className="title">
            <img/>
            <b>Select database ...</b>
          </div>

          <div className="content responsive-grid">

            NOT YET IMPLEMENTED :( ...

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
