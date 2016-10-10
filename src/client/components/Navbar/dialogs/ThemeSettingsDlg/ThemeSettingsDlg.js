import React, { PropTypes } from 'react'
import './ThemeSettingsDlg.scss'
import Modal from 'react-modal'

export default class ThemeSettingsDlg extends React.Component {

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  constructor() {

    super()

    this.items = [
      {
        img: '/resources/img/forge-theme.png',
        layoutType: 'forge-theme',
        caption: 'Forge',
        key: '1'
      },
      {
        img: '/resources/img/snow-white-theme.png',
        theme: 'snow-white-theme',
        caption: 'Snow White',
        key: '2'
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

    this.props.onSelectItem(item)
    this.props.close()
  }

  /////////////////////////////////////////////////////////////////
  //
  //
  /////////////////////////////////////////////////////////////////
  render() {

    return (
      <div>
        <Modal className="dialog theme-settings"
          isOpen={this.props.open}
          onRequestClose={() => {this.close()}}>

          <div className="title">
            <img/>
            <b>Select theme ...</b>
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
