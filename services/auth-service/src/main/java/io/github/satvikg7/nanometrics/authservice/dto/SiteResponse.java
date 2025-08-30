package io.github.satvikg7.nanometrics.authservice.dto;

import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
public class SiteResponse {
  private UUID id;
  private String domain;
  private UUID ownerId;
  private LocalDateTime createdAt;
  private LocalDateTime updatedAt;
}
