/**
 * @license
 *
 * Copyright IBM Corp. 2023
 *
 * This source code is licensed under the Apache-2.0 license found in the
 * LICENSE file in the root directory of this source tree.
 */

import { LitElement, PropertyValueMap } from 'lit';
import { property, state } from 'lit/decorators.js';
import { v4 as uuidv4 } from 'uuid';
import { FeedbackAPI } from '../../../services/feedback';
// @ts-ignore
import styles from './feedback.scss?inline';
/**
 * Feedback component to record and give feedback on AI generated content
 */
export class Feedback extends LitElement {
  static styles = styles;

  /**
   * API Key of registered application for using this component
   */
  @property({ attribute: 'api-key', type: String })
  private _api_key = '';

  /**
   * Unique username or id of the application
   */
  @property({ attribute: 'user', type: String })
  private _user_id = '';

  /**
   * Model ID or Model Name for which feedback is recording
   */
  @property({ attribute: 'ai-model', type: String })
  private _model_id = '';

  /**
   * User Input to the model
   */
  @property({ attribute: 'input', type: String })
  private _input = '';

  /**
   * Output generated by AI Model
   */
  @property({ attribute: 'output', type: String })
  private _output = '';

  /**
   * ID generated For a particular input and output
   */
  @state()
  generation_id = '';

  /**
   * State variable for Feedback Model
   */
  @state()
  private isModelOpen = false;

  /**
   * To store data of selected text
   */
  @state()
  private selection;

  /**
   * Getter for selection
   */
  get Selection() {
    return this.selection;
  }

  /**
   * Object for recording the feedback
   */
  @state()
  private formData = {
    id: '',
    generation_id: '',
    start_index: 0,
    end_index: 0,
    selected_value: '',
    corrected_value: '',
    feedback: '',
    comment: '',
  };

  /**
   * Instance of feedback API
   */
  private feedbackApi = FeedbackAPI.getInstance();

  /**
   * Array for storing checkbox values selected by user
   */
  private _feedbacks: string[] = [];

  /**
   * Creating generation id when component is created
   */
  constructor() {
    super();
    this.generation_id = uuidv4();
  }

  /**
   * For Mounting the web component
   */
  connectedCallback(): void {
    super.connectedCallback();
    if (
      this._api_key &&
      this._model_id &&
      this._user_id &&
      (this._input || this._output)
    ) {
      const payload = {
        id: this.generation_id,
        api_key: this._api_key,
        model_id: this._model_id,
        user_id: this._user_id,
        input_value: this._input,
        output_value: this._output,
      };
      this.feedbackApi.recordGeneration(payload);
    }
  }

  /**
   * Click event handler that is attached to this component to get the selection / selected text
   * @private
   */
  _handleTextSelection() {
    const selection = window.getSelection();
    this.selection = selection;
    const selectedText = selection?.toString().trim();
    this.setAttribute('selected', '');

    if (selectedText && selection) {
      const minOffset = Math.min(selection.anchorOffset, selection.focusOffset);
      const maxOffset = Math.max(selection.anchorOffset, selection.focusOffset);
      this.formData.generation_id = this.generation_id;
      this.formData.selected_value = selectedText;
      this.formData.start_index = minOffset;
      this.formData.end_index = maxOffset;
    } else {
      this.selection = null;
      this.removeAttribute('selected');
    }
  }

  /**
   * Input event handler that is attached to the feedback (corrected value) form input
   *
   * @param {object} event Event object of the corrected value from input box
   * @param {object} event.target input element
   * @private
   */
  _handleTextInput({ target }: Event) {
    const { value } = target as HTMLInputElement;
    this.formData.corrected_value = value;
  }

  /**
   * Input event handler that is attached to the feedback (comments) form input
   *
   * @param {object} event Event object of the corrected value from input box
   * @param {object} event.target input element
   * @private
   */
  _handleTextArea(event) {
    this.formData.comment = event?.target.value;
  }

  /**
   * Submit/Record the feedback data to backend
   * @private
   */
  _handleFormData() {
    if (!this.formData.corrected_value) {
      this.formData.corrected_value = this.formData.selected_value;
    }
    this.feedbackApi.recordFeedback(this.formData);
    this.selection = null;
    this.formData = {
      id: '',
      generation_id: '',
      start_index: 0,
      end_index: 0,
      selected_value: '',
      corrected_value: '',
      feedback: '',
      comment: '',
    };
    this._feedbacks = [];
    this.isModelOpen = false;
  }

  /**
   *
   * @param {PropertyValueMap<any>} _changedProperties
   * Contains the properties/attribute which are changed
   */
  protected updated(
    _changedProperties: PropertyValueMap<any> | Map<PropertyKey, unknown>
  ): void {
    if (this.isModelOpen) {
      this.removeEventListener('click', this._handleTextSelection, false);
    } else {
      this.addEventListener('click', this._handleTextSelection);
    }
    // TODO: If we want to capture feedback while typing can be done here
  }

  /**
   * Checkbox Input event handler that is attached to the feedback form input
   *
   * @param {object} event Event object of the corrected value from input box
   * @param {object} event.target input element
   * @private
   */
  _handleFeedback(event) {
    const feedback = event.target.labelText;
    if (!this._feedbacks.includes(feedback)) {
      this._feedbacks.push(feedback);
    } else {
      this._feedbacks = this._feedbacks.filter((item) => item != feedback);
    }
    this.formData.feedback = this._feedbacks.join(' | ');
  }

  /**
   * Method for toggling the Feedback Modal
   */
  _toggle() {
    this.isModelOpen = !this.isModelOpen;
  }
}
