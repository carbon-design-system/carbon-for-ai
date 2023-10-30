/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */
import { html } from 'lit';

export function testInputTemplate(cls) {
  const { _handleInput: handleInput } = cls;
  return html`<div>
    <label>Search typeahead</label>
    <input type="text" @input="${handleInput}" />
    ${cls.searchResults
    ? cls.searchResults.map((result) => html`<p>${result}</p>`)
    : undefined}
  </div>`;
}
