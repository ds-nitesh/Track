/**
 * @format
 */

import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import {Provider} from 'react-redux';
import {store} from '../src/redux/store';

// Lightweight smoke test — full navigation needs native mocks
test('redux store initializes', () => {
  const state = store.getState();
  expect(state.auth).toBeDefined();
  expect(state.transactions.items).toEqual([]);
  expect(state.settings.currency).toBeTruthy();
});

test('renders provider tree', async () => {
  const Tree = () => (
    <Provider store={store}>
      <></>
    </Provider>
  );
  await ReactTestRenderer.act(() => {
    ReactTestRenderer.create(<Tree />);
  });
});
