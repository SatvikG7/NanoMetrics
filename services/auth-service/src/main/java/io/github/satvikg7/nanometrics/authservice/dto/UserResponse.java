package io.github.satvikg7.nanometrics.authservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class UserResponse {
  private UUID id;
  private String username;
  private String fname;
  private String lname;
  private String email;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
