import { memo } from 'react';

const FormField = memo(function FormField({
  label, name, type = 'text', value, onChange, error, required = false,
  placeholder, as: As = 'input', disabled = false,
}) {
  return (
    <div className="form-field">
      {label && (
        <label className="form-label" htmlFor={name}>
          {label}{required && <span style={{ color: 'var(--color-danger)' }}> *</span>}
        </label>
      )}
      {As === 'textarea' ? (
        <textarea
          id={name}
          name={name}
          className="form-textarea"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      ) : (
        <input
          id={name}
          name={name}
          type={type}
          className="form-input"
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
        />
      )}
      {error && <p className="form-error">{error}</p>}
    </div>
  );
});

export default FormField;
