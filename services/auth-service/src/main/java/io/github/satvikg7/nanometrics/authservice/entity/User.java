package io.github.satvikg7.nanometrics.authservice.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "users", indexes = {
    @Index(name = "username_idx", columnList = "username"),
    @Index(name = "email_idx", columnList = "email")
}, uniqueConstraints = {
    @UniqueConstraint(name = "username_email_unique", columnNames = { "username", "email" })
})
@Getter
@Setter
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.AUTO)
  private UUID id;

  @NotBlank
  @Size(min = 3, max = 50)
  @Column(nullable = false, unique = true)
  private String username;

  @NotBlank
  @Size(max = 50)
  @Column(nullable = false)
  private String fname;

  @NotBlank
  @Size(max = 50)
  @Column(nullable = false)
  private String lname;

  @Email
  @NotBlank
  @Column(nullable = false, unique = true)
  private String email;

  @NotBlank
  @Column(nullable = false)
  private String passhash;

  @Column(name = "created_at", nullable = false)
  private LocalDateTime createdAt;

  @Column(name = "updated_at")
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
  private List<Site> sites;

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
