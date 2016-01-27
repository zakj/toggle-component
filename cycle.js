/*
Toggle API

#disable -> sets disabled attr
#enable -> unsets disabled attr
#toggle_disabled -> toggles disabled attr
vals
selected
on change (val)
#val -> returns selected
#select_val (val, silent) -> sets selected
*/

import classNames from 'classnames';
import Cycle from '@cycle/core';
import {button, div, makeDOMDriver} from '@cycle/dom';
import _ from 'lodash';
import {Observable} from 'rx';

function intent(DOM) {
  const changeValue$ = DOM.select('.toggle_side').events('click')
    .map(ev => ev.target.dataset.value);
  return {
    changeValue$,
  };
}

function model(actions, props$) {
  const initialValue$ = props$.map(props => props.value).first();
  const value$ = initialValue$.concat(
    actions.changeValue$.withLatestFrom(props$)
      .filter(([value, props]) => !props.isDisabled)
      .map(([value, props]) => value)
  ).distinctUntilChanged();
  return Observable.combineLatest(value$, props$, (value, props) => ({
    // ...props,
    options: props.options,
    isDisabled: props.isDisabled,
    value,
  }));
}

function view(state$) {
  return state$.map(state => (
    div('.toggle', _.map(state.options, option => (
      div('.toggle_side', {
        className: classNames({disabled: state.isDisabled, selected: option.value === state.value}),
        dataset: {value: option.value},
      },
      option.name)
    )))
  ));
}

function Toggle({DOM, props}) {
  const actions = intent(DOM);
  const state$ = model(actions, props);
  const vtree$ = view(state$);
  return {
    DOM: vtree$,
    value$: state$.map(state => state.value),
  }
}


// ----------------------------------------

function main({DOM}) {
  const options = [
    {name: 'Line', value: 'line'},
    {name: 'Bar', value: 'bar'},
    {name: 'Pie', value: 'pie'},
  ]

  const disable$ = DOM.select('.disable').events('click').map(ev => true);
  const enable$ = DOM.select('.enable').events('click').map(ev => false);
  const isDisabled$ = disable$.merge(enable$).startWith(false);
  const toggleProps$ = isDisabled$.map(isDisabled => ({
    options,
    value: options[0].value,
    isDisabled,
  }));
  const toggle = Toggle({DOM, props: toggleProps$});

  return {
    DOM: Observable.of(
      div([
        button('.disable', 'disable'),
        ' ',
        button('.enable', 'enable'),
        toggle.DOM,
      ])
    ),
  };
}

const sources = {
  DOM: makeDOMDriver('.app'),
};

Cycle.run(main, sources);
