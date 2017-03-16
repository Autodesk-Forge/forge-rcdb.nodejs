import React from 'react'

class LazyLoader extends React.Component {

  static propTypes = {
    children: React.PropTypes.func.isRequired
  }

  constructor() {
    super(...arguments)
    this.state = {
      isLoaded: false
    };
  }

  componentDidMount() {
    this._isMounted = true;
    this.load();
  }

  componentDidUpdate(previous) {
    const shouldLoad = !!Object.keys(this.props.modules).filter((key)=> {
      return this.props.modules[key] !== previous.modules[key];
    }).length;
    if (shouldLoad) {
      this.load();
    }
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  load() {
    this.setState({
      isLoaded: false,
    });

    const { modules } = this.props;
    const keys = Object.keys(modules);

    Promise.all(keys.map((key) => modules[key]()))
      .then((values) => (keys.reduce((agg, key, index) => {
        agg[key] = values[index];
        return agg;
      }, {})))
      .then((result) => {
        if (!this._isMounted) return null;
        this.setState({ modules: result, isLoaded: true });
      });
  }

  render() {
    if (!this.state.isLoaded) return null;
    return React.Children.only(this.props.children(this.state.modules));
  }
}

export const LazyLoaderFactory = (Component, modules) => {
  return (props) => (
    <LazyLoader modules={modules}>
      {(mods) => <Component {...mods} {...props} />}
    </LazyLoader>
  );
};

export const importLazy = (promise) => (
  promise.then((result) => result.default)
);

export default LazyLoader;
