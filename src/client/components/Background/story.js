'use strict'

import { storiesOf, action } from '@kadira/storybook'
import React from 'react'
import Trianglify from './index'
import Timer from '../storybook/timer'

storiesOf('Trianglify Canvas', module)
  .add('Without props - output in Canvas', () => (
    <Trianglify />
  ))

  .add('Passing a width and height', () => (
    <Trianglify width={500} height={300} />
  ))

  .add('Using cell_size', () => (
    <Trianglify cell_size={20} />
  ))

  .add('Updating for every 1.5s, using canvas', () => (
    <Timer>
      {() => {
        action('render canvas with timer')()
        return <Trianglify />
      }}
    </Timer>
  ))

storiesOf('Trianglify SVG', module)
  .add('Output in SVG', () => (
    <Trianglify output='svg' />
  ))

  .add('SVG with size', () => (
    <Trianglify width={500} height={500} output='svg' />
  ))

  .add('Updating for every 1.5s, using SVG', () => (
    <Timer>
      {() => {
        action('render SVG with timer')()
        return <Trianglify output='svg' />
      }}
    </Timer>
  ))

storiesOf('Trianglify PNG', module)
  .add('Output in PNG', () => (
    <Trianglify output='png' />
  ))

  .add('Updating for every 1.5s, using PNG', () => (
    <Timer>
      {() => {
        action('render PNG with timer')()
        return <Trianglify output='png' />
      }}
    </Timer>
  ))
