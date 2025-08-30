package io.github.satvikg7.nanometrics.authservice.exception;

import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;
import io.github.satvikg7.nanometrics.authservice.response.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.FieldError;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.HashMap;
import java.util.Map;

@RestControllerAdvice
public class GlobalExceptionHandler {

  @ExceptionHandler(AuthException.class)
  public ResponseEntity<ApiResponse<Object>> handleAuthException(AuthException ex) {
    return ResponseEntity.status(getHttpStatus(ex.getErrorCode()))
        .body(ApiResponse.error(ex.getErrorCode()));
  }

  @ExceptionHandler(MethodArgumentNotValidException.class)
  public ResponseEntity<ApiResponse<Map<String, String>>> handleValidationException(
      MethodArgumentNotValidException ex) {

    Map<String, String> errors = new HashMap<>();
    ex.getBindingResult().getAllErrors().forEach(error -> {
      String fieldName = ((FieldError) error).getField();
      String errorMessage = error.getDefaultMessage();
      errors.put(fieldName, errorMessage);
    });

    return ResponseEntity.badRequest()
        .body(ApiResponse.<Map<String, String>>error(ErrorCode.VALIDATION_FAILED, "Validation failed").data(errors));
  }

  @ExceptionHandler(Exception.class)
  public ResponseEntity<ApiResponse<Object>> handleGenericException(Exception ex) {
    return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
        .body(ApiResponse.error(ErrorCode.INTERNAL_SERVER_ERROR));
  }

  private HttpStatus getHttpStatus(ErrorCode errorCode) {
    return switch (errorCode) {
      case USER_NOT_FOUND, SITE_NOT_FOUND -> HttpStatus.NOT_FOUND;
      case INVALID_CREDENTIALS, UNAUTHORIZED -> HttpStatus.UNAUTHORIZED;
      case ACCESS_DENIED -> HttpStatus.FORBIDDEN;
      case USERNAME_ALREADY_EXISTS, EMAIL_ALREADY_EXISTS, DOMAIN_ALREADY_EXISTS -> HttpStatus.CONFLICT;
      case VALIDATION_FAILED -> HttpStatus.BAD_REQUEST;
      default -> HttpStatus.INTERNAL_SERVER_ERROR;
    };
  }
}
