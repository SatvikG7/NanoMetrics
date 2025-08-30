package io.github.satvikg7.nanometrics.authservice.response;

import io.github.satvikg7.nanometrics.authservice.enums.ErrorCode;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class ApiResponse<T> {
  private boolean success;
  private String message;
  private T data;
  private String errorCode;

  public static <T> ApiResponse<T> success(T data) {
    ApiResponse<T> response = new ApiResponse<>();
    response.setSuccess(true);
    response.setData(data);
    return response;
  }

  public static <T> ApiResponse<T> success(T data, String message) {
    ApiResponse<T> response = new ApiResponse<>();
    response.setSuccess(true);
    response.setMessage(message);
    response.setData(data);
    return response;
  }

  public static <T> ApiResponse<T> error(ErrorCode errorCode) {
    ApiResponse<T> response = new ApiResponse<>();
    response.setSuccess(false);
    response.setMessage(errorCode.getMessage());
    response.setErrorCode(errorCode.getCode());
    return response;
  }

  public static <T> ApiResponse<T> error(ErrorCode errorCode, String message) {
    ApiResponse<T> response = new ApiResponse<>();
    response.setSuccess(false);
    response.setMessage(message);
    response.setErrorCode(errorCode.getCode());
    return response;
  }

  public ApiResponse<T> data(T data) {
    this.setData(data);
    return this;
  }
}
