package io.github.satvikg7.nanometrics.authservice.enums;

public enum ErrorCode {
  VALIDATION_FAILED("VALIDATION_FAILED", "Validation failed"),
  USER_NOT_FOUND("USER_NOT_FOUND", "User not found"),
  INVALID_CREDENTIALS("INVALID_CREDENTIALS", "Invalid username or password"),
  USERNAME_ALREADY_EXISTS("USERNAME_ALREADY_EXISTS", "Username already exists"),
  EMAIL_ALREADY_EXISTS("EMAIL_ALREADY_EXISTS", "Email already exists"),
  SITE_NOT_FOUND("SITE_NOT_FOUND", "Site not found"),
  DOMAIN_ALREADY_EXISTS("DOMAIN_ALREADY_EXISTS", "Domain already exists"),
  UNAUTHORIZED("UNAUTHORIZED", "Unauthorized access"),
  ACCESS_DENIED("ACCESS_DENIED", "Access denied"),
  INTERNAL_SERVER_ERROR("INTERNAL_SERVER_ERROR", "Internal server error");

  private final String code;
  private final String message;

  ErrorCode(String code, String message) {
    this.code = code;
    this.message = message;
  }

  public String getCode() {
    return code;
  }

  public String getMessage() {
    return message;
  }
}
