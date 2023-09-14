import React from 'react';
import { inject, observer } from 'mobx-react';
import { types } from 'mobx-state-tree';
import { Input } from 'antd';

import InfoModal from '../../components/Infomodal/Infomodal';
import { guidGenerator } from '../../core/Helpers';
import Registry from '../../core/Registry';
import { AnnotationMixin } from '../../mixins/AnnotationMixin';
import PerRegionMixin from '../../mixins/PerRegion';
import RequiredMixin from '../../mixins/Required';
import { isDefined } from '../../utils/utilities';
import ControlBase from './Base';
import { ReadOnlyControlMixin } from '../../mixins/ReadOnlyMixin';
import ClassificationBase from './ClassificationBase';
import PerItemMixin from '../../mixins/PerItem';
import { FF_LSDV_4583, isFF } from '../../utils/feature-flags';

/**
 * The TextSpace tag supports annotating text data using a TextSpace element.
 *
 * Use with the following data types: audio, image, HTML, paragraphs, text, time series, video
 *
 * [^FF_LSDV_4583]: `fflag_feat_front_lsdv_4583_multi_image_segmentation_short` should be enabled for `perItem` functionality
 *
 * @example
 * <!--Basic labeling configuration for text annotation -->
 * <View>
 *   <TextSpace name="txt" toName="txt" />
 * </View>
 *
 * @name TextSpace
 * @meta_title TextSpace Tag for Text Annotation
 * @meta_description Customize Label Studio with the TextSpace tag to annotate text data in your machine learning and data science projects.
 * @param {string} name                       - Name of the element
 * @param {string} toName                     - Name of the element that you want to annotate
 * @param {number} [rows=4]                  - Number of visible text rows in the textspace
 * @param {number} [cols=50]                 - Number of visible text columns in the textspace
 * @param {boolean} [showCount=false]      - Whether to show character count
 * @param {boolean} [required=false]          - Whether to require annotation
 * @param {string} [requiredMessage]          - Message to show if annotation is required but missing
 * @param {boolean} [perItem]                 - Use this tag to annotate specific items inside the object instead of the whole object[^FF_LSDV_4583]
 * @param {string} [defaultValue]             - Default textspace value; will be added automatically to result for required fields
 */

const { TextArea } = Input;

const TagAttrs = types.model({
  toname: types.maybeNull(types.string),
  rows: types.optional(types.string, '4'),
  cols: types.optional(types.string, '50'),
  showCount: types.optional(types.boolean, false),
  value: types.optional(types.string, ''),
  defaultvalue: types.maybeNull(types.string),
});

const Model = types
  .model({
    pid: types.optional(types.string, guidGenerator),
    type: 'textspace',
    _value: types.maybeNull(types.string),
  })
  .views(self => ({

    get valueType() {
      console.log('33333333333'); // once the tag loads - once hit enter - blur the editable tag input - on click remove icon
      return 'text';
    },
    get serializableValue() {
      console.log('777777');
      if (!self.regions.length) return null;
      return { text: self.selectedValues() };
    },
    selectedValues() {
      console.log('View 1: selectedValues()');
      return self._value;
    },

    get holdsState() {
      console.log('View 2: holdsState()');
      return isDefined(self._value);
    },
  }))
  .actions(self => ({
    getSelectedString() {
      console.log('Action 1: getSelectedString()');
      return self._value || '';
    },

    needsUpdate() {
      console.log('Action 2: needsUpdate()');
      if (self.result) self._value = self.result.mainValue;
      else self._value = null;
    },

    beforeSend() {
      if (!isDefined(self.defaultvalue)) return;
      // Add defaultValue to results for top-level controls
      console.log('Action 3: beforeSend()');
      if (!isDefined(self._value)) self.setValue(self.defaultValue);
    },

    unselectAll() {
      console.log('Action 4: unselectAll()');
    },

    setValue(value) {
      console.log('Action 5: setValue()');
      self._value = value;
      self.updateResult();
    },

    onChange(e) {
      console.log('Action 6: onChange()');
      const value = e.target.value;

      self.setValue(value);
    },

    updateFromResult() {
      console.log('Action 7: updateFromResult()');
      this.needsUpdate();
    },

    /* requiredModal() {
      console.log('Action 8: requiredModal()');
      InfoModal.warning(self.requiredmessage || `TextSpace "${self.name}" is required.`);
    }, */
  }));

const TextSpaceModel = types.compose('TextSpaceModel',
  ControlBase,
  ClassificationBase,
  RequiredMixin,
  ReadOnlyControlMixin,
  PerRegionMixin,
  ...(isFF(FF_LSDV_4583) ? [PerItemMixin] : []),
  AnnotationMixin,
  TagAttrs,
  Model,
);

const HtxTextSpace = inject('store')(
  observer(({ item, store }) => {
    return (
      <div>
        <TextArea
          rows={item.rows}
          cols={item.cols}
          name={item.name}
          showCount={item.showCount}
          value={item._value || item.defaultValue}
          onChange={item.onChange}
        />
        {/* {store.settings.enableTooltips && item.required && (
          <sup style={{ fontSize: '9px' }}>Requiredzzz</sup>
        )} */}
      </div>
    );
  }),
);

Registry.addTag('textspace', TextSpaceModel, HtxTextSpace);

export { HtxTextSpace, TextSpaceModel };
