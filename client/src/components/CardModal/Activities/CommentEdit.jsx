import { dequal } from 'dequal';
import React, { useCallback, useEffect, useImperativeHandle, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import TextareaAutosize from 'react-textarea-autosize';
import { Button, Form, TextArea } from 'semantic-ui-react';

import { useClosableForm, useForm } from '../../../hooks';

import styles from './CommentEdit.module.scss';
import gStyles from '../../Core/Core.module.scss';

const CommentEdit = React.forwardRef(({ children, defaultData, onUpdate }, ref) => {
  const [t] = useTranslation();
  const [isOpened, setIsOpened] = useState(false);
  const [data, handleFieldChange, setData, handleFocus] = useForm(null);

  const textField = useRef(null);

  const open = useCallback(() => {
    setIsOpened(true);
    setData({
      text: '',
      ...defaultData,
    });
  }, [defaultData, setData]);

  const close = useCallback(() => {
    setIsOpened(false);
    setData(null);
  }, [setData]);

  const [handleFieldBlur, handleControlMouseOver, handleControlMouseOut, handleValueChange, handleClearModified] = useClosableForm(close, isOpened);

  const submit = useCallback(() => {
    const cleanData = {
      ...data,
      text: data.text.trim(),
    };

    if (!cleanData.text) {
      textField.current.ref.current.select();
      return;
    }

    if (!dequal(cleanData, defaultData)) {
      onUpdate(cleanData);
    }

    handleClearModified();
    close();
  }, [data, defaultData, handleClearModified, close, onUpdate]);

  const handleSubmit = useCallback(() => {
    submit();
  }, [submit]);

  const handleCancel = useCallback(() => {
    handleClearModified();
    close();
  }, [close, handleClearModified]);

  useImperativeHandle(
    ref,
    () => ({
      open,
      close,
    }),
    [open, close],
  );

  const handleFieldKeyDown = useCallback(
    (event) => {
      if (event.ctrlKey && event.key === 'Enter') {
        submit();
      } else if (event.key === 'Escape') {
        handleCancel();
      }
    },
    [handleCancel, submit],
  );

  useEffect(() => {
    if (isOpened) {
      textField.current.ref.current.focus();
    }
  }, [isOpened]);

  const handleChange = useCallback(
    (_, { name: fieldName, value }) => {
      handleFieldChange(_, { name: fieldName, value });
      handleValueChange(value, defaultData.text);
    },
    [defaultData, handleFieldChange, handleValueChange],
  );

  if (!isOpened) {
    return children;
  }

  return (
    <Form onSubmit={handleSubmit}>
      <TextArea
        ref={textField}
        as={TextareaAutosize}
        name="text"
        value={data.text}
        minRows={1}
        spellCheck
        className={styles.field}
        onKeyDown={handleFieldKeyDown}
        onChange={handleChange}
        onBlur={handleFieldBlur}
        onFocus={handleFocus}
      />
      <div className={gStyles.controls}>
        <Button type="button" negative content={t('action.cancel')} className={gStyles.cancelButton} onClick={handleCancel} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
        <Button positive content={t('action.save')} className={gStyles.submitButton} onMouseOver={handleControlMouseOver} onMouseOut={handleControlMouseOut} />
      </div>
    </Form>
  );
});

CommentEdit.propTypes = {
  children: PropTypes.element.isRequired,
  defaultData: PropTypes.object.isRequired, // eslint-disable-line react/forbid-prop-types
  onUpdate: PropTypes.func.isRequired,
};

export default React.memo(CommentEdit);
