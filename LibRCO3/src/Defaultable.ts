/** Default Symbol */
const defaultValue = Symbol('defaultableDefaultValue');
export class Defaultable<T> {
  /**
   * Default Value Symbol
   */
  static defaultValue = defaultValue;
  /**
   * The real value, excluding default fallbacks
   * @internal
   */
  _rawValue: T | typeof defaultValue = defaultValue;
  /**
   * The default value getter
   * @internal
   */
  _getDefaultValue: (self: Defaultable<T>) => T;
  /**
   * @param getDefaultValue The default value getter
   */
  constructor(getDefaultValue: (self: Defaultable<T>) => T) {
    this._getDefaultValue = getDefaultValue;
  }
  /**
   * The value, falling back to {@link Defaultable._getDefaultValue getDefaultValue} if the value is {@link defaultValue}
   */
  get value(): T {
    return this._rawValue === defaultValue ? this._getDefaultValue(this) : this._rawValue;
  }
  /**
   * The value, falling back to {@link Defaultable._getDefaultValue getDefaultValue} if the value is {@link defaultValue}
   */
  set value(value: T | typeof defaultValue) {
    if (value === defaultValue) {
      this._rawValue = this._getDefaultValue(this);
    } else {
      this._rawValue = value;
    }
  }
  /**
   * Whether or not the value is the default value
   */
  get willUseDefault(): boolean {
    return this._rawValue === defaultValue;
  }
}
