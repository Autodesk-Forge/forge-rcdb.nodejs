'use strict'

const allOptions = (PropTypes) => ({
  height: {
    defaultValue: 300,
    type: PropTypes.number
  },
  width: {
    defaultValue: 300,
    type: PropTypes.number
  },
  cell_size: {
    defaultValue: 60,
    type: PropTypes.number
  },
  variance: {
    defaultValue: 0.75,
    type: PropTypes.number
  },
  seed: {
    defaultValue: null,
    type: PropTypes.string
  },
  x_colors: {
    defaultValue: 'random',
    type: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  },
  y_colors: {
    defaultValue: 'match_x',
    type: PropTypes.oneOfType([
      PropTypes.string,
      PropTypes.arrayOf(PropTypes.string)
    ])
  },
  color_space: {
    defaultValue: 'lab',
    type: PropTypes.oneOf(['rgb', 'hsv', 'hsl', 'hsi', 'lab', 'hcl'])
  },
  color_function: {
    defaultValue: null,
    type: PropTypes.func
  },
  stroke_width: {
    defaultValue: 1.51,
    type: PropTypes.number
  },
  points: {
    defaultValue: undefined,
    type: PropTypes.array
  },
  output: {
    defaultValue: 'canvas',
    type: PropTypes.oneOf(['svg', 'canvas', 'png'])
  }
})

export const extractProps = (PropTypes) => {
  const options = allOptions(PropTypes)

  return (optionName) => {
    return Object.keys(options).reduce((acc, option) => ({
      ...acc,
      [option]: options[option][optionName]
    }), {})
  }
}
