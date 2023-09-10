import React from 'react';
import { types } from 'mobx-state-tree';
import { observer } from 'mobx-react';

import ProcessAttrsMixin from '../../mixins/ProcessAttrs';
import Registry from '../../core/Registry';
import Tree from '../../core/Tree';
import { guidGenerator } from '../../utils/unique';
import { clamp } from '../../utils/utilities';

/**
 * The `Quote` tag is used to show a Quote text on the labeling interface.
 * @example
 * <!-- Display a quote on the labeling interface based on a field in the data -->
 * <View>
 *   <Quote value="$text" style="color:#09c" size="1" underline="true" bold="true" />
 * </View>
 * @example
 * <!-- Display a static quote on the labeling interface -->
 * <View>
 *   <Quote value="Please select the class" />
 * </View>
 * @name Quote
 * @meta_title Quote Tag to Show Quotes
 * @meta_description Customize Label Studio with the Quote tag to display a quote for a labeling task for machine learning and data science projects.
 * @param {string} value              - Text of quote, either static text or the field name in data to use for the Quote
 * @param {number} [size=1]           - Size of quote on a page, used to control size of the text
 * @param {string} [style]            - CSS style for the quote
 * @param {boolean} [underline=false] - Whether to underline the quote
 * @param {boolean} [bold=false] - Whether to make the quote font bold or not
 */

const Model = types.model({
  id: types.optional(types.identifier, guidGenerator),
  type: 'quote',
  size: types.optional(types.string, '1'),
  style: types.maybeNull(types.string),
  _value: types.optional(types.string, ''),
  value: types.optional(types.string, ''),
  underline: types.optional(types.boolean, false),
  bold: types.optional(types.boolean, false),
});

const QuoteModel = types.compose('QuoteModel', Model, ProcessAttrsMixin);

const HtxQuote = observer(({ item }) => {
  const size = clamp(parseInt(item.size), 1, 5);
  const defaultStyles = 'font-style:italic;';

  const style = item.style ? Tree.cssConverter(defaultStyles + item.style) : Tree.cssConverter(defaultStyles);

  const fontSize = size >= 2 ? (size * 0.5) + 0.5 : 1;

  style.fontSize = `${fontSize}rem`;
  style.borderBottom = item.underline && '1px solid';
  style.fontWeight = item.bold && 'bold';

  return (
    <q style={style} size={size} >
      {item._value}
    </q>
  );
});

Registry.addTag('quote', QuoteModel, HtxQuote);

export { HtxQuote, QuoteModel };
