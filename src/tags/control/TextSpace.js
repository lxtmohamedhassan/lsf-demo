import React from 'react';
import { inject, observer } from 'mobx-react';
import { types } from 'mobx-state-tree';
import { Input } from 'antd';

import { guidGenerator } from '../../core/Helpers';
import Registry from '../../core/Registry';
import { AnnotationMixin } from '../../mixins/AnnotationMixin';
import { isDefined } from '../../utils/utilities';
import ControlBase from './Base';
import ClassificationBase from './ClassificationBase';

/**
 * The TextSpace tag is used to display a text area for user input. Use for
		transcription, paraphrasing, or captioning tasks.
 * @example
 * <!-- Basic labeling configuration for text annotation -->
 * <View>
 *   <TextSpace name="txt" toName="txt" />
 * </View>
 *
 * @name TextSpace
 * @meta_title TextSpace Tag for Text Annotation
 * @meta_description Customize Label Studio using the TextSpace tag to annotate text data in your machine learning and data science projects.
 * @param {string} name                       - Name of the element
 * @param {string} toName                     - Name of the element that you want to annotate
 * @param {number} [rows=4]                  - Number of visible text rows in the textspace (default is 4)
 * @param {number} [cols=50]                 - Number of visible text columns in the textspace (default is 50)
 * @param {boolean} [showcount=false]        - Whether to show character count (default is false)
 */

const { TextArea } = Input;

const TagAttrs = types.model({
  toname: types.maybeNull(types.string),
  rows: types.optional(types.string, '4'),
  cols: types.maybeNull(types.string),
  value: types.optional(types.string, ''),
  showcount: types.optional(types.boolean, false), // no camelCase naming
});

const Model = types
  .model({
    pid: types.optional(types.string, guidGenerator),
    type: 'textspace',
    _value: types.maybeNull(types.string),
  })
  .views(self => ({

    get valueType() {
      return 'text'; // 'text' will be the key of the TextSpace value object in the result object as shown below
    },
    selectedValues() { // this view must exist as any control-tag must follow the ClassificationBase mixin rules
      return self._value;
    },

    get holdsState() { // this view must exist to keep the result object in the state tree
      return isDefined(self._value);
    },
  }))
  .actions(self => ({
    needsUpdate() { // this action runs once the tag is rendered and checks whether an update is needed for the TextSpace tag's value.
      if (self.result) { // Check if a result object for this tag exists or not
        self._value = self.result.mainValue; // Set the TextSpace's value with the value from the result object.
      } else {
        self._value = null; // Set the TextSpace's value to null since there is no result object.
      }
    },
    beforeSend() { // this action runs before submitting the task values
      console.log('result object', self.result);
      return;
    },

    setValue(value) { // this action is responsible for updating the result object with the received value
      self._value = value;
      self.updateResult();
    },

    onChange(e) {
      const value = e.target.value;

      self.setValue(value); // calling the setValue action to update the result object
    },
  }));

const TextSpaceModel = types.compose('TextSpaceModel',
  ControlBase,
  ClassificationBase,
  AnnotationMixin,
  TagAttrs,
  Model,
);

const HtxTextSpace = inject('store')(
  observer(({ item, store }) => {
    const props = {
      rows: item.rows,
      name: item.name,
      value: item._value,
      showCount: item.showcount,
      onChange: item.onChange,
    };

    const styles = {};

    if (item.cols) {
      styles.width = item.cols + 'rem';
    } else {
      styles.width = '100%';
    }

    return (
      <div>
        <TextArea {...props} style={styles} />
      </div>
    );
  }),
);

Registry.addTag('textspace', TextSpaceModel, HtxTextSpace);

export { HtxTextSpace, TextSpaceModel };
