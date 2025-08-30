package io.github.satvikg7.nanometrics.authservice.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class RegisterRequest {
  @NotBlank(message = "Username is required")
  @Size(min = 3, max = 50, message = "Username must be between 3 and 50 characters")
  private String username;

  @NotBlank(message = "First name is required")
  @Size(max = 50, message = "First name must not exceed 50 characters")
  private String fname;

  @NotBlank(message = "Last name is required")
  @Size(max = 50, message = "Last name must not exceed 50 characters")
  private String lname;

  @Email(message = "Invalid email format")
  @NotBlank(message = "Email is required")
  private String email;

  @NotBlank(message = "Password is required")
  @Size(min = 8, message = "Password must be at least 8 characters long")
  private String password;
}
