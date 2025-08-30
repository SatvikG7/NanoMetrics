package io.github.satvikg7.nanometrics.authservice.exception;

import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;

public class AuthException extends RuntimeException {
  private final ErrorCode errorCode;

  public AuthException(ErrorCode errorCode) {
    super(errorCode.getMessage());
    this.errorCode = errorCode;
  }

  public AuthException(ErrorCode errorCode, String message) {
    super(message);
    this.errorCode = errorCode;
  }

  public ErrorCode getErrorCode() {
    return errorCode;
  }
}
