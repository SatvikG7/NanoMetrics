package io.github.satvikg7.nanometrics.authservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "sites", indexes = {
    @Index(name = "domain_index", columnList = "domain"),
    @Index(name = "owner_index", columnList = "owner_id")
}, uniqueConstraints = {
    @UniqueConstraint(name = "domain_unique", columnNames = { "domain" })
})
@Getter
@Setter
public class Site {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @NotBlank
  @Pattern(regexp = "^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\\.[a-zA-Z]{2,}$", message = "Invalid domain format")
  @Column(nullable = false, unique = true)
  private String domain;

  @ManyToOne(fetch = FetchType.LAZY)
  @JoinColumn(name = "owner_id", nullable = false, foreignKey = @ForeignKey(name = "fk_site_owner"))
  private User owner;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @PrePersist
  protected void onCreate() {
    createdAt = LocalDateTime.now();
    updatedAt = LocalDateTime.now();
  }

  @PreUpdate
  protected void onUpdate() {
    updatedAt = LocalDateTime.now();
  }
}
